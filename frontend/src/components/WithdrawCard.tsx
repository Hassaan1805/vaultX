import React, { useState, useEffect } from 'react';
import { WalletState, VaultStats, GasEstimate } from '../types';
import {
  ArrowUpRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Fuel,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getEtherscanTxUrl } from '../lib/ethersUtils';
import { ethers } from 'ethers';

interface WithdrawCardProps {
  wallet: WalletState;
  stats: VaultStats;
  onWithdraw: (amount: string) => Promise<{ success: boolean; txHash: string }>;
  estimateGas: (amount: string) => Promise<GasEstimate>;
  onConnectWallet: () => void;
  onSwitchNetwork: () => void;
  onSuccessToast: (title: string, desc: string, txHash?: string) => void;
  onErrorToast: (title: string, desc: string) => void;
}

export const WithdrawCard: React.FC<WithdrawCardProps> = ({
  wallet,
  stats,
  onWithdraw,
  estimateGas,
  onConnectWallet,
  onSwitchNetwork,
  onSuccessToast,
  onErrorToast,
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStage, setTxStage] = useState<'idle' | 'approving' | 'confirming' | 'success' | 'error'>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [gasInfo, setGasInfo] = useState<GasEstimate>({
    estimatedGas: '0',
    estimatedFeeEth: '0',
    isCalculating: false,
    error: null,
  });

  // Calculate gas fee when amount changes
  useEffect(() => {
    let active = true;
    const fetchGas = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !wallet.isConnected) {
        setGasInfo({ estimatedGas: '0', estimatedFeeEth: '0', isCalculating: false, error: null });
        return;
      }
      setGasInfo((prev) => ({ ...prev, isCalculating: true }));
      const result = await estimateGas(amount);
      if (active) {
        setGasInfo(result);
      }
    };

    const timer = setTimeout(fetchGas, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [amount, estimateGas, wallet.isConnected]);

  // Validation
  const parsedAmount = parseFloat(amount || '0');
  const vaultBalNum = parseFloat(stats.userBalance || '0');
  let validationError: string | null = null;

  if (amount !== '') {
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      validationError = 'Amount must be greater than 0 ETH';
    } else if (parsedAmount > vaultBalNum) {
      validationError = 'Withdrawal amount exceeds your current deposited vault balance';
    }
  }

  const handlePercentageClick = (percentage: number) => {
    try {
      const rawUserBal = ethers.parseEther(stats.userBalance || '0');
      if (rawUserBal <= 0n) {
        setAmount('0');
        return;
      }
      const fraction = BigInt(percentage);
      const targetWei = (rawUserBal * fraction) / 100n;
      setAmount(ethers.formatEther(targetWei));
    } catch {
      setAmount('0');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) {
      onConnectWallet();
      return;
    }
    if (!wallet.isSepolia) {
      onSwitchNetwork();
      return;
    }
    if (validationError || !amount || parsedAmount <= 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setTxStage('approving');
      setLastTxHash(null);

      const result = await onWithdraw(amount);

      setTxStage('success');
      setLastTxHash(result.txHash);
      setAmount('');

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C5FF36', '#38BDF8', '#FFFFFF'],
      });

      onSuccessToast(
        'Withdrawal Confirmed',
        `Successfully unlocked and withdrew ${amount} ETH to your wallet!`,
        result.txHash
      );
    } catch (err: any) {
      setTxStage('error');
      onErrorToast('Withdrawal Failed', err.message || 'Transaction was rejected or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="neon-glow-card rounded-2xl p-6 relative flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wide">
                WITHDRAW ASSETS
              </h3>
              <p className="text-[11px] text-zinc-400">Claim and unlock your ETH back to MetaMask</p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-500/20">
            INSTANT
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleWithdrawSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-zinc-400">AMOUNT TO WITHDRAW</span>
              <span className="text-zinc-400">
                Vault Deposited:{' '}
                <button
                  type="button"
                  onClick={() => handlePercentageClick(100)}
                  className="text-[#C5FF36] hover:underline font-semibold"
                >
                  {stats.userBalance} ETH
                </button>
              </span>
            </div>

            {/* ETH Input Field */}
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (txStage === 'success' || txStage === 'error') setTxStage('idle');
                }}
                placeholder="0.00"
                disabled={isSubmitting}
                className="w-full bg-[#050607] border border-white/10 focus:border-[#C5FF36] rounded-xl px-4 py-3.5 text-lg font-mono font-bold text-white placeholder-zinc-600 focus:outline-none transition-colors"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#15191D] text-[#C5FF36] border border-white/5">
                  ETH
                </span>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <p className="mt-2 text-xs font-mono text-rose-400 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </p>
            )}

            {/* Percentage Selectors */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentageClick(pct)}
                  disabled={!wallet.isConnected || isSubmitting || vaultBalNum <= 0}
                  className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#C5FF36] text-[11px] font-mono text-zinc-300 transition-colors disabled:opacity-40"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Gas & Fee Overview */}
          <div className="p-3 rounded-xl bg-[#050607]/60 border border-white/5 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5">
                <Fuel className="w-3.5 h-3.5 text-zinc-400" />
                <span>Estimated Gas:</span>
              </span>
              <span>
                {gasInfo.isCalculating ? (
                  <span className="text-zinc-500 animate-pulse">Estimating...</span>
                ) : gasInfo.estimatedFeeEth !== '0' ? (
                  `~${parseFloat(gasInfo.estimatedFeeEth).toFixed(5)} ETH`
                ) : (
                  'Calculated on submit'
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Check:</span>
              </span>
              <span className="text-emerald-400">Checks-Effects-Interactions</span>
            </div>
          </div>

          {/* Transaction Status Box */}
          {txStage === 'approving' && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center space-x-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Confirm transaction in MetaMask and wait for on-chain block...</span>
            </div>
          )}

          {txStage === 'success' && lastTxHash && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Withdrawal Confirmed!</span>
              </div>
              <a
                href={getEtherscanTxUrl(lastTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-[#C5FF36] hover:underline"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Submit Button */}
          {!wallet.isConnected ? (
            <button
              type="button"
              onClick={onConnectWallet}
              className="btn-neon-primary w-full py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase"
            >
              CONNECT METAMASK TO WITHDRAW
            </button>
          ) : !wallet.isSepolia ? (
            <button
              type="button"
              onClick={onSwitchNetwork}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors"
            >
              SWITCH TO SEPOLIA NETWORK
            </button>
          ) : (
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !!validationError ||
                !amount ||
                parsedAmount <= 0 ||
                vaultBalNum <= 0
              }
              className="btn-neon-secondary w-full py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center space-x-2 border-white/20 hover:border-[#C5FF36]/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING WITHDRAWAL...</span>
                </>
              ) : (
                <span>WITHDRAW ETH FROM VAULT</span>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
