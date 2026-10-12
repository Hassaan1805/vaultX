import React, { useState, useEffect } from 'react';
import { WalletState, GasEstimate } from '../types';
import {
  ArrowDownLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Fuel,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculatePercentageAmount, getEtherscanTxUrl } from '../lib/ethersUtils';

interface DepositCardProps {
  wallet: WalletState;
  onDeposit: (amount: string) => Promise<{ success: boolean; txHash: string }>;
  estimateGas: (amount: string) => Promise<GasEstimate>;
  onConnectWallet: () => void;
  onSwitchNetwork: () => void;
  onSuccessToast: (title: string, desc: string, txHash?: string) => void;
  onErrorToast: (title: string, desc: string) => void;
}

export const DepositCard: React.FC<DepositCardProps> = ({
  wallet,
  onDeposit,
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

  // Calculate gas when amount changes
  useEffect(() => {
    let active = true;
    const fetchGas = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !wallet.isConnected || !wallet.isSepolia) {
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
  }, [amount, estimateGas, wallet.isConnected, wallet.isSepolia]);

  // Determine effective balance (either on Sepolia or direct Sepolia fallback)
  const effectiveRawBalance = wallet.isSepolia
    ? wallet.rawBalance
    : wallet.sepoliaRawBalance > 0n
    ? wallet.sepoliaRawBalance
    : wallet.rawBalance;

  const effectiveDisplayBal = wallet.isSepolia
    ? wallet.balance
    : wallet.sepoliaRawBalance > 0n
    ? wallet.sepoliaBalance
    : wallet.balance;

  // Validation
  const parsedAmount = parseFloat(amount || '0');
  const availableBalNum = parseFloat(effectiveDisplayBal || '0');
  let validationError: string | null = null;

  if (amount !== '') {
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      validationError = 'Amount must be greater than 0 ETH';
    } else if (parsedAmount > availableBalNum) {
      validationError = 'Amount exceeds your available balance';
    }
  }

  const handlePercentageClick = (percentage: number) => {
    const calculated = calculatePercentageAmount(effectiveRawBalance, percentage, true);
    setAmount(calculated);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
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

      const result = await onDeposit(amount);

      setTxStage('success');
      setLastTxHash(result.txHash);
      setAmount('');

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C5FF36', '#FFFFFF', '#9AE600'],
      });

      onSuccessToast(
        'Deposit Confirmed',
        `Successfully deposited ${amount} ETH into VAULTX!`,
        result.txHash
      );
    } catch (err: any) {
      setTxStage('error');
      onErrorToast('Deposit Failed', err.message || 'Transaction was rejected or failed.');
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wide">
                DEPOSIT ASSETS
              </h3>
              <p className="text-[11px] text-zinc-400">Lock native Sepolia ETH into self-custody vault</p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            0% FEE
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleDepositSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-zinc-400">AMOUNT TO DEPOSIT</span>
              <span className="text-zinc-400">
                Wallet Available:{' '}
                <button
                  type="button"
                  onClick={() => handlePercentageClick(100)}
                  className="text-[#C5FF36] hover:underline font-semibold"
                >
                  {effectiveDisplayBal} ETH
                </button>
              </span>
            </div>

            {/* Main ETH Input Field */}
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

            {/* Validation Message */}
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
                  disabled={!wallet.isConnected || isSubmitting || effectiveRawBalance <= 0n}
                  className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-[#C5FF36] text-[11px] font-mono text-zinc-300 transition-colors disabled:opacity-40"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Network Switch Prompt inside card if on wrong network */}
          {wallet.isConnected && !wallet.isSepolia && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>MetaMask is on <strong>{wallet.networkName}</strong></span>
              </div>
              <button
                type="button"
                onClick={onSwitchNetwork}
                className="text-[#C5FF36] hover:underline font-bold"
              >
                Switch to Sepolia
              </button>
            </div>
          )}

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
              <span>Network:</span>
              <span className={wallet.isSepolia ? "text-emerald-400 font-semibold flex items-center space-x-1" : "text-amber-400 font-semibold"}>
                {wallet.isConnected ? (
                  wallet.isSepolia ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span>Ethereum Sepolia (11155111)</span>
                    </>
                  ) : (
                    <span>{wallet.networkName} (Chain {wallet.chainId})</span>
                  )
                ) : (
                  'Ethereum Sepolia (11155111)'
                )}
              </span>
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
                <span>Deposit Successful!</span>
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
              CONNECT METAMASK TO DEPOSIT
            </button>
          ) : !wallet.isSepolia ? (
            <button
              type="button"
              onClick={onSwitchNetwork}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold tracking-wider uppercase transition-colors shadow-neon-sm flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>
                SWITCH TO SEPOLIA TO DEPOSIT {wallet.sepoliaRawBalance > 0n ? `(${wallet.sepoliaBalance} ETH AVAILABLE)` : ''}
              </span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !!validationError || !amount || parsedAmount <= 0}
              className="btn-neon-primary w-full py-3.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING DEPOSIT...</span>
                </>
              ) : (
                <span>DEPOSIT ETH TO VAULT</span>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
