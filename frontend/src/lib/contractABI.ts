import deployedConfig from './deployedContract.json';

export const FINANCE_VAULT_ABI = [
  // Functions
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function getMyBalance() external view returns (uint256)",
  "function getUserBalance(address user) external view returns (uint256)",
  "function getUserStats(address user) external view returns (uint256 currentBalance, uint256 depositedTotal, uint256 withdrawnTotal)",
  "function getTotalDeposited() external view returns (uint256)",
  "function getTotalWithdrawn() external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function balances(address user) external view returns (uint256)",
  "function userDeposited(address user) external view returns (uint256)",
  "function userWithdrawn(address user) external view returns (uint256)",
  "function totalVaultDeposited() external view returns (uint256)",
  "function totalVaultWithdrawn() external view returns (uint256)",

  // Events
  "event Deposit(address indexed user, uint256 amount, uint256 timestamp)",
  "event Withdrawal(address indexed user, uint256 amount, uint256 timestamp)",

  // Custom Errors
  "error ZeroAmount()",
  "error InsufficientBalance(uint256 requested, uint256 available)",
  "error TransferFailed()",
  "error ReentrancyGuardReentrantCall()"
] as const;

// Get configured contract address: First check .env, then deployedContract.json, then fallback
export function getVaultContractAddress(): string {
  const envAddress = import.meta.env.VITE_VAULT_CONTRACT_ADDRESS;
  if (envAddress && envAddress !== "0x0000000000000000000000000000000000000000") {
    return envAddress;
  }
  if (deployedConfig && deployedConfig.address && deployedConfig.address !== "0x0000000000000000000000000000000000000000") {
    return deployedConfig.address;
  }
  return "0x0000000000000000000000000000000000000000";
}
