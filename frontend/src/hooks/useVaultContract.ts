import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { FINANCE_VAULT_ABI, getVaultContractAddress } from '../lib/contractABI';
import { VaultStats, TransactionRecord, GasEstimate } from '../types';
import { formatEth, parseBlockchainError, safeParseEther } from '../lib/ethersUtils';

export function useVaultContract(
  provider: ethers.BrowserProvider | null,
  signer: ethers.JsonRpcSigner | null,
  userAddress: string | null,
  isSepolia: boolean
) {
  const [stats, setStats] = useState<VaultStats>({
    userBalance: '0.0000',
    userDeposited: '0.0000',
    userWithdrawn: '0.0000',
    contractTVL: '0.0000',
    totalVaultDeposited: '0.0000',
    totalVaultWithdrawn: '0.0000',
    isLoading: false,
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [isTxPending, setIsTxPending] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(null);

  const contractAddress = useMemo(() => getVaultContractAddress(), []);

  // Contract instance (read-only or signer-connected)
  const getContract = useCallback(
    (useSigner = false) => {
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      if (useSigner && signer) {
        return new ethers.Contract(contractAddress, FINANCE_VAULT_ABI, signer);
      }

      if (provider) {
        return new ethers.Contract(contractAddress, FINANCE_VAULT_ABI, provider);
      }

      return null;
    },
    [contractAddress, provider, signer]
  );

  // Fetch all Vault Stats
  const fetchStats = useCallback(async () => {
    const contract = getContract(false);
    if (!contract || !provider) {
      setStats((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStats((prev) => ({ ...prev, isLoading: true }));

      // Fetch global metrics
      const [tvl, totalDep, totalWith] = await Promise.all([
        contract.getContractBalance().catch(() => 0n),
        contract.getTotalDeposited().catch(() => 0n),
        contract.getTotalWithdrawn().catch(() => 0n),
      ]);

      let uBal = 0n;
      let uDep = 0n;
      let uWith = 0n;

      if (userAddress) {
        try {
          const userStats = await contract.getUserStats(userAddress);
          uBal = userStats[0];
          uDep = userStats[1];
          uWith = userStats[2];
        } catch {
          // Fallback to individual calls
          uBal = await contract.getUserBalance(userAddress).catch(() => 0n);
        }
      }

      setStats({
        userBalance: formatEth(uBal),
        userDeposited: formatEth(uDep),
        userWithdrawn: formatEth(uWith),
        contractTVL: formatEth(tvl),
        totalVaultDeposited: formatEth(totalDep),
        totalVaultWithdrawn: formatEth(totalWith),
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to query vault stats:', err);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  }, [getContract, provider, userAddress]);

  // Query on-chain deposit and withdrawal events
  const fetchTransactions = useCallback(async () => {
    const contract = getContract(false);
    if (!contract || !provider) return;

    try {
      setIsLoadingTx(true);

      const latestBlock = await provider.getBlockNumber();
      // Search recent blocks to prevent RPC timeouts on testnets (last 10000 blocks)
      const fromBlock = Math.max(0, latestBlock - 9999);

      const depositFilter = contract.filters.Deposit();
      const withdrawFilter = contract.filters.Withdrawal();

      const [depositEvents, withdrawEvents] = await Promise.all([
        contract.queryFilter(depositFilter, fromBlock, 'latest').catch(() => []),
        contract.queryFilter(withdrawFilter, fromBlock, 'latest').catch(() => []),
      ]);

      const records: TransactionRecord[] = [];

      for (const ev of depositEvents) {
        const parsed = (ev as any).args;
        if (!parsed) continue;
        const user = parsed.user;
        const amountWei = parsed.amount;
        const timestamp = Number(parsed.timestamp || 0);

        records.push({
          id: `dep-${ev.transactionHash}-${ev.index}`,
          type: 'deposit',
          amount: ethers.formatEther(amountWei),
          amountWei,
          user,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
          timestamp,
          dateStr: timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Recent',
          status: 'confirmed',
          isCurrentUser: userAddress ? user.toLowerCase() === userAddress.toLowerCase() : false,
        });
      }

      for (const ev of withdrawEvents) {
        const parsed = (ev as any).args;
        if (!parsed) continue;
        const user = parsed.user;
        const amountWei = parsed.amount;
        const timestamp = Number(parsed.timestamp || 0);

        records.push({
          id: `with-${ev.transactionHash}-${ev.index}`,
          type: 'withdrawal',
          amount: ethers.formatEther(amountWei),
          amountWei,
          user,
          txHash: ev.transactionHash,
          blockNumber: ev.blockNumber,
          timestamp,
          dateStr: timestamp ? new Date(timestamp * 1000).toLocaleString() : 'Recent',
          status: 'confirmed',
          isCurrentUser: userAddress ? user.toLowerCase() === userAddress.toLowerCase() : false,
        });
      }

      // Sort newest to oldest
      records.sort((a, b) => {
        if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
        return b.blockNumber - a.blockNumber;
      });

      setTransactions(records);
    } catch (err) {
      console.error('Failed to fetch contract events:', err);
    } finally {
      setIsLoadingTx(false);
    }
  }, [getContract, provider, userAddress]);

  // Estimate Gas for Deposit
  const estimateDepositGas = useCallback(
    async (amountEth: string): Promise<GasEstimate> => {
      const contract = getContract(true);
      const parsedWei = safeParseEther(amountEth);

      if (!contract || !provider || !parsedWei || parsedWei <= 0n) {
        return { estimatedGas: '0', estimatedFeeEth: '0', isCalculating: false, error: null };
      }

      try {
        const gasLimit = await contract.deposit.estimateGas({ value: parsedWei });
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || 1000000000n; // fallback 1 gwei
        const totalFeeWei = gasLimit * gasPrice;

        return {
          estimatedGas: gasLimit.toString(),
          estimatedFeeEth: ethers.formatEther(totalFeeWei),
          isCalculating: false,
          error: null,
        };
      } catch (err: any) {
        return {
          estimatedGas: '0',
          estimatedFeeEth: '0',
          isCalculating: false,
          error: parseBlockchainError(err),
        };
      }
    },
    [getContract, provider]
  );

  // Estimate Gas for Withdraw
  const estimateWithdrawGas = useCallback(
    async (amountEth: string): Promise<GasEstimate> => {
      const contract = getContract(true);
      const parsedWei = safeParseEther(amountEth);

      if (!contract || !provider || !parsedWei || parsedWei <= 0n) {
        return { estimatedGas: '0', estimatedFeeEth: '0', isCalculating: false, error: null };
      }

      try {
        const gasLimit = await contract.withdraw.estimateGas(parsedWei);
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || 1000000000n;
        const totalFeeWei = gasLimit * gasPrice;

        return {
          estimatedGas: gasLimit.toString(),
          estimatedFeeEth: ethers.formatEther(totalFeeWei),
          isCalculating: false,
          error: null,
        };
      } catch (err: any) {
        return {
          estimatedGas: '0',
          estimatedFeeEth: '0',
          isCalculating: false,
          error: parseBlockchainError(err),
        };
      }
    },
    [getContract, provider]
  );

  // Execute Deposit Transaction
  const executeDeposit = useCallback(
    async (amountEth: string) => {
      const contract = getContract(true);
      if (!contract) throw new Error('Contract instance not ready or not configured.');
      if (!isSepolia) throw new Error('Please switch to Ethereum Sepolia to perform deposits.');

      const wei = safeParseEther(amountEth);
      if (!wei || wei <= 0n) throw new Error('Invalid deposit amount.');

      try {
        setIsTxPending(true);
        const tx = await contract.deposit({ value: wei });
        setPendingTxHash(tx.hash);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);

        // Refresh stats & transactions
        await Promise.all([fetchStats(), fetchTransactions()]);

        return {
          success: true,
          txHash: tx.hash,
          receipt,
        };
      } finally {
        setIsTxPending(false);
        setPendingTxHash(null);
      }
    },
    [fetchStats, fetchTransactions, getContract, isSepolia]
  );

  // Execute Withdrawal Transaction
  const executeWithdraw = useCallback(
    async (amountEth: string) => {
      const contract = getContract(true);
      if (!contract) throw new Error('Contract instance not ready or not configured.');
      if (!isSepolia) throw new Error('Please switch to Ethereum Sepolia to perform withdrawals.');

      const wei = safeParseEther(amountEth);
      if (!wei || wei <= 0n) throw new Error('Invalid withdrawal amount.');

      try {
        setIsTxPending(true);
        const tx = await contract.withdraw(wei);
        setPendingTxHash(tx.hash);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);

        // Refresh stats & transactions
        await Promise.all([fetchStats(), fetchTransactions()]);

        return {
          success: true,
          txHash: tx.hash,
          receipt,
        };
      } finally {
        setIsTxPending(false);
        setPendingTxHash(null);
      }
    },
    [fetchStats, fetchTransactions, getContract, isSepolia]
  );

  // Live event listeners
  useEffect(() => {
    const contract = getContract(false);
    if (!contract) return;

    const onDeposit = (user: string, amount: bigint, timestamp: bigint, event: any) => {
      console.log('Real-time Deposit event detected:', user, amount);
      fetchStats();
      const newRec: TransactionRecord = {
        id: `dep-${event.log?.transactionHash || Date.now()}`,
        type: 'deposit',
        amount: ethers.formatEther(amount),
        amountWei: amount,
        user,
        txHash: event.log?.transactionHash || '',
        blockNumber: event.log?.blockNumber || 0,
        timestamp: Number(timestamp),
        dateStr: new Date(Number(timestamp) * 1000).toLocaleString(),
        status: 'confirmed',
        isCurrentUser: userAddress ? user.toLowerCase() === userAddress.toLowerCase() : false,
      };
      setTransactions((prev) => [newRec, ...prev.filter((t) => t.id !== newRec.id)]);
    };

    const onWithdrawal = (user: string, amount: bigint, timestamp: bigint, event: any) => {
      console.log('Real-time Withdrawal event detected:', user, amount);
      fetchStats();
      const newRec: TransactionRecord = {
        id: `with-${event.log?.transactionHash || Date.now()}`,
        type: 'withdrawal',
        amount: ethers.formatEther(amount),
        amountWei: amount,
        user,
        txHash: event.log?.transactionHash || '',
        blockNumber: event.log?.blockNumber || 0,
        timestamp: Number(timestamp),
        dateStr: new Date(Number(timestamp) * 1000).toLocaleString(),
        status: 'confirmed',
        isCurrentUser: userAddress ? user.toLowerCase() === userAddress.toLowerCase() : false,
      };
      setTransactions((prev) => [newRec, ...prev.filter((t) => t.id !== newRec.id)]);
    };

    try {
      contract.on('Deposit', onDeposit);
      contract.on('Withdrawal', onWithdrawal);
    } catch (e) {
      console.warn('Could not register live event listeners:', e);
    }

    return () => {
      try {
        contract.off('Deposit', onDeposit);
        contract.off('Withdrawal', onWithdrawal);
      } catch {}
    };
  }, [fetchStats, getContract, userAddress]);

  // Initial and reactive load
  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [fetchStats, fetchTransactions]);

  return {
    contractAddress,
    stats,
    transactions,
    isLoadingTx,
    isTxPending,
    pendingTxHash,
    fetchStats,
    fetchTransactions,
    estimateDepositGas,
    estimateWithdrawGas,
    executeDeposit,
    executeWithdraw,
  };
}
