export interface WalletState {
  address: string | null;
  shortAddress: string;
  balance: string; // in ETH (formatted string)
  rawBalance: bigint;
  sepoliaBalance: string; // Direct on-chain Sepolia balance
  sepoliaRawBalance: bigint;
  chainId: number | null;
  networkName: string;
  isSepolia: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface VaultStats {
  userBalance: string; // User's active vault balance
  userDeposited: string; // User's lifetime total deposits
  userWithdrawn: string; // User's lifetime total withdrawals
  contractTVL: string; // Contract's active balance (TVL)
  totalVaultDeposited: string; // Global lifetime deposits
  totalVaultWithdrawn: string; // Global lifetime withdrawals
  isLoading: boolean;
}

export interface TransactionRecord {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: string; // in ETH
  amountWei: bigint;
  user: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  dateStr: string;
  status: 'confirmed' | 'pending' | 'failed';
  isCurrentUser: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
  txHash?: string;
  timestamp: number;
}

export interface GasEstimate {
  estimatedGas: string;
  estimatedFeeEth: string;
  isCalculating: boolean;
  error: string | null;
}
