import { ethers } from 'ethers';
import { ETHERSCAN_BASE_URL } from './constants';

/**
 * Shorten an Ethereum address for UI display (e.g. 0x1234...abcd)
 */
export function shortenAddress(address: string | null | undefined, chars: number = 4): string {
  if (!address) return '';
  if (!ethers.isAddress(address)) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Generate Etherscan URL for a transaction hash
 */
export function getEtherscanTxUrl(txHash: string): string {
  return `${ETHERSCAN_BASE_URL}/tx/${txHash}`;
}

/**
 * Generate Etherscan URL for an account or contract address
 */
export function getEtherscanAddressUrl(address: string): string {
  return `${ETHERSCAN_BASE_URL}/address/${address}`;
}

/**
 * Format ETH value (from bigint or string) to a clean human-readable string
 */
export function formatEth(value: bigint | string | number | undefined | null, maxDecimals: number = 4): string {
  if (value === undefined || value === null) return '0.0000';
  
  let formatted: string;
  if (typeof value === 'bigint') {
    formatted = ethers.formatEther(value);
  } else {
    formatted = String(value);
  }

  const num = parseFloat(formatted);
  if (isNaN(num) || num === 0) return '0.0000';

  // Fix precision without scientific notation
  const parts = formatted.split('.');
  if (parts.length === 1) return `${parts[0]}.0000`;
  
  const integerPart = parts[0];
  const decimalPart = parts[1].substring(0, maxDecimals).padEnd(maxDecimals, '0');
  return `${integerPart}.${decimalPart}`;
}

/**
 * Parse human input string to BigInt wei safely
 */
export function safeParseEther(input: string): bigint | null {
  try {
    const clean = input.trim().replace(',', '.');
    if (!clean || isNaN(Number(clean)) || Number(clean) <= 0) return null;
    return ethers.parseEther(clean);
  } catch {
    return null;
  }
}

/**
 * Calculate amount for percentage buttons with gas reserve buffer for 100%
 */
export function calculatePercentageAmount(
  rawBalance: bigint,
  percentage: number,
  isDeposit: boolean = true
): string {
  if (rawBalance <= 0n) return '0';

  if (isDeposit && percentage === 100) {
    // Reserve ~0.003 ETH for gas buffer so transaction doesn't fail
    const gasBuffer = ethers.parseEther('0.003');
    if (rawBalance <= gasBuffer) {
      return '0';
    }
    const maxDepositable = rawBalance - gasBuffer;
    return ethers.formatEther(maxDepositable);
  }

  // Calculate percentage
  const fraction = BigInt(percentage);
  const targetWei = (rawBalance * fraction) / 100n;
  return ethers.formatEther(targetWei);
}

/**
 * Parse raw errors from MetaMask and ethers.js into human-friendly messages
 */
export function parseBlockchainError(error: any): string {
  if (!error) return 'An unexpected error occurred.';

  // MetaMask rejection error
  if (
    error.code === 4001 ||
    error.code === 'ACTION_REJECTED' ||
    error?.info?.error?.code === 4001 ||
    error?.message?.includes('user rejected') ||
    error?.message?.includes('User denied')
  ) {
    return 'Transaction rejected in MetaMask.';
  }

  // Insufficient funds for gas + value
  if (
    error.code === 'INSUFFICIENT_FUNDS' ||
    error?.message?.includes('insufficient funds')
  ) {
    return 'Insufficient ETH in wallet to cover amount and network gas fees.';
  }

  // Custom contract errors
  const errStr = String(error.message || error.reason || error);
  if (errStr.includes('ZeroAmount')) {
    return 'Amount must be greater than 0 ETH.';
  }
  if (errStr.includes('InsufficientBalance')) {
    return 'Withdrawal amount exceeds your current deposited vault balance.';
  }
  if (errStr.includes('TransferFailed')) {
    return 'ETH transfer failed. Contract could not send funds.';
  }
  if (errStr.includes('ReentrancyGuardReentrantCall')) {
    return 'Security alert: Reentrancy protection triggered.';
  }

  // Missing contract / network errors
  if (errStr.includes('could not decode result data') || errStr.includes('call revert exception')) {
    return 'Contract call reverted. Ensure the contract is deployed on this network.';
  }

  return error.shortMessage || error.reason || error.message || 'Transaction failed.';
}
