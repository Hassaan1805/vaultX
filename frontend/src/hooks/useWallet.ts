import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_PARAMS,
} from '../lib/constants';
import { shortenAddress, formatEth, parseBlockchainError } from '../lib/ethersUtils';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Public Sepolia RPC fallback for guaranteed on-chain reads
const SEPOLIA_PUBLIC_RPCS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',
  'https://sepolia.gateway.tenderly.co',
];

function getNetworkName(chainId: number | null): string {
  if (!chainId) return 'Unknown';
  switch (chainId) {
    case 11155111:
      return 'Ethereum Sepolia';
    case 1:
      return 'Ethereum Mainnet';
    case 11155420:
      return 'Optimism Sepolia';
    case 421614:
      return 'Arbitrum Sepolia';
    case 84532:
      return 'Base Sepolia';
    case 137:
      return 'Polygon Mainnet';
    case 31337:
      return 'Hardhat Localhost';
    default:
      return `Chain ID ${chainId}`;
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    shortAddress: '',
    balance: '0.0000',
    rawBalance: 0n,
    sepoliaBalance: '0.0000',
    sepoliaRawBalance: 0n,
    chainId: null,
    networkName: 'Not Connected',
    isSepolia: false,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const isFetchingRef = useRef(false);

  // Directly fetch balances from both MetaMask and Sepolia RPC
  const fetchAllBalances = useCallback(async (account: string, currentChainId: number | null) => {
    if (!account || !ethers.isAddress(account) || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      let activeRaw = 0n;
      let sepoliaRaw = 0n;

      // 1. Fetch from active MetaMask provider directly
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const hexBal = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [account, 'latest'],
          });
          if (hexBal) {
            activeRaw = BigInt(hexBal);
          }
        } catch (err) {
          console.warn('MetaMask eth_getBalance request failed:', err);
        }
      }

      // 2. Fetch directly from Sepolia public RPC to ensure Sepolia balance is ALWAYS known
      for (const rpcUrl of SEPOLIA_PUBLIC_RPCS) {
        try {
          const sepProvider = new ethers.JsonRpcProvider(rpcUrl);
          sepoliaRaw = await sepProvider.getBalance(account);
          break; // successfully fetched
        } catch {
          // try next RPC if this one failed
        }
      }

      const isSep = currentChainId === SEPOLIA_CHAIN_ID;
      const netName = getNetworkName(currentChainId);

      // If user is on Sepolia, activeRaw should reflect Sepolia balance
      // If MetaMask returned 0 due to an internal RPC sync issue, fall back to the live Sepolia RPC
      let finalActiveRaw = activeRaw;
      if (isSep && activeRaw === 0n && sepoliaRaw > 0n) {
        finalActiveRaw = sepoliaRaw;
      }

      setWallet((prev) => ({
        ...prev,
        address: account,
        shortAddress: shortenAddress(account),
        balance: formatEth(isSep ? finalActiveRaw : (finalActiveRaw > 0n ? finalActiveRaw : sepoliaRaw)),
        rawBalance: isSep ? finalActiveRaw : (finalActiveRaw > 0n ? finalActiveRaw : sepoliaRaw),
        sepoliaBalance: formatEth(sepoliaRaw),
        sepoliaRawBalance: sepoliaRaw,
        chainId: currentChainId,
        networkName: netName,
        isSepolia: isSep,
        isConnected: true,
      }));
    } catch (err) {
      console.error('Error in fetchAllBalances:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWallet((prev) => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to use VAULTX.',
      }));
      return;
    }

    try {
      setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected in MetaMask');
      }

      const activeAccount = accounts[0];
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);
      const jsonSigner = await browserProvider.getSigner().catch(() => null);

      setProvider(browserProvider);
      setSigner(jsonSigner);

      await fetchAllBalances(activeAccount, currentChainId);
      setWallet((prev) => ({ ...prev, isConnecting: false }));
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: parseBlockchainError(err),
      }));
    }
  }, [fetchAllBalances]);

  // Switch to Sepolia or add it if missing
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      setWallet((prev) => ({ ...prev, error: null }));
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      // Refresh balances immediately after switch
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const newChainId = parseInt(chainIdHex, 16);
      if (wallet.address) {
        await fetchAllBalances(wallet.address, newChainId);
      }
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK_PARAMS],
          });
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const newChainId = parseInt(chainIdHex, 16);
          if (wallet.address) {
            await fetchAllBalances(wallet.address, newChainId);
          }
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          setWallet((prev) => ({
            ...prev,
            error: 'Failed to add Ethereum Sepolia network to MetaMask.',
          }));
        }
      } else {
        console.error('Failed to switch network:', switchError);
        setWallet((prev) => ({
          ...prev,
          error: parseBlockchainError(switchError),
        }));
      }
    }
  }, [fetchAllBalances, wallet.address]);

  // Disconnect locally
  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      shortAddress: '',
      balance: '0.0000',
      rawBalance: 0n,
      sepoliaBalance: '0.0000',
      sepoliaRawBalance: 0n,
      chainId: null,
      networkName: 'Not Connected',
      isSepolia: false,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    setProvider(null);
    setSigner(null);
  }, []);

  // Check if wallet was previously connected
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const checkExistingConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          const activeAccount = accounts[0];
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const currentChainId = parseInt(chainIdHex, 16);

          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const jsonSigner = await browserProvider.getSigner().catch(() => null);

          setProvider(browserProvider);
          setSigner(jsonSigner);

          await fetchAllBalances(activeAccount, currentChainId);
        }
      } catch (err) {
        console.warn('Initial connection check failed:', err);
      }
    };

    checkExistingConnection();
  }, [fetchAllBalances]);

  // Listen to accountsChanged and chainChanged events from MetaMask
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('MetaMask accountsChanged:', accounts);
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAccount = accounts[0];
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainIdHex, 16);
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner().catch(() => null);
        setProvider(newProvider);
        setSigner(newSigner);
        await fetchAllBalances(newAccount, currentChainId);
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      console.log('MetaMask chainChanged:', chainIdHex);
      const newChainId = parseInt(chainIdHex, 16);
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner().catch(() => null);
      setProvider(newProvider);
      setSigner(newSigner);

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const activeAccount = accounts?.[0] || wallet.address;
      if (activeAccount) {
        await fetchAllBalances(activeAccount, newChainId);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet, fetchAllBalances, wallet.address]);

  // Periodic polling every 5 seconds to ensure live balance sync
  useEffect(() => {
    if (!wallet.isConnected || !wallet.address) return;

    const interval = setInterval(() => {
      fetchAllBalances(wallet.address!, wallet.chainId);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAllBalances, wallet.address, wallet.chainId, wallet.isConnected]);

  return {
    wallet,
    provider,
    signer,
    connectWallet,
    switchNetwork,
    disconnectWallet,
    refreshBalance: () => {
      if (wallet.address) {
        fetchAllBalances(wallet.address, wallet.chainId);
      }
    },
  };
}
