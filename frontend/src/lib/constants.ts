// Sepolia Network Details
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
export const SEPOLIA_CHAIN_NAME = 'Ethereum Sepolia';

export const SEPOLIA_NETWORK_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Ethereum Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://sepolia.gateway.tenderly.co',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Default deployed contract address fallback (can be overridden via VITE_VAULT_CONTRACT_ADDRESS)
export const DEFAULT_CONTRACT_ADDRESS =
  import.meta.env.VITE_VAULT_CONTRACT_ADDRESS ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io';

export const FAUCET_LINKS = [
  {
    name: 'Google Cloud Sepolia Faucet',
    url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
    desc: 'Instant, no social login required',
  },
  {
    name: 'Alchemy Sepolia Faucet',
    url: 'https://www.alchemy.com/faucets/ethereum-sepolia',
    desc: 'Reliable 0.5 Sepolia ETH/day',
  },
  {
    name: 'Infura Sepolia Faucet',
    url: 'https://www.infura.io/faucet/sepolia',
    desc: 'Official Consensys developer faucet',
  },
];
