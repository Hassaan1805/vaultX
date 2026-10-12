import React, { useState } from 'react';
import { VaultStats as VaultStatsType, WalletState } from '../types';
import {
  Coins,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Layers,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { getEtherscanAddressUrl, shortenAddress } from '../lib/ethersUtils';

interface VaultStatsProps {
  stats: VaultStatsType;
  wallet: WalletState;
  contractAddress: string;
  onRefresh: () => void;
  onSwitchNetwork: () => void;
}

export const VaultStats: React.FC<VaultStatsProps> = ({
  stats,
  wallet,
  contractAddress,
  onRefresh,
  onSwitchNetwork,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: Contract Verification & Quick Copy */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0A0C0E] border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C5FF36] shadow-neon-sm" />
          <span className="text-xs font-mono uppercase text-zinc-400">VAULT SMART CONTRACT:</span>
          <span className="text-xs font-mono font-medium text-white break-all">
            {contractAddress ? shortenAddress(contractAddress, 8) : 'Not Deployed'}
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {contractAddress && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                title="Copy Contract Address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#C5FF36]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <a
                href={getEtherscanAddressUrl(contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-[#C5FF36] transition-colors"
                title="View contract on Sepolia Etherscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ETHERSCAN</span>
              </a>
            </>
          )}

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-[#C5FF36] transition-colors"
            title="Refresh on-chain metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C5FF36]' : ''}`} />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
        </div>
      </div>

      {/* Dynamic Network Alert Banner if MetaMask is not on Sepolia */}
      {wallet.isConnected && !wallet.isSepolia && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span>Connected to <strong>{wallet.networkName}</strong>. </span>
              {wallet.sepoliaRawBalance > 0n ? (
                <span className="text-[#C5FF36] font-bold">
                  You have {wallet.sepoliaBalance} ETH on Ethereum Sepolia!
                </span>
              ) : (
                <span>Switch to Sepolia to access your Sepolia testnet assets.</span>
              )}
            </div>
          </div>
          <button
            onClick={onSwitchNetwork}
            className="btn-neon-primary px-4 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap shadow-neon-sm"
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Your Vault Balance */}
        <div className="neon-glow-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              YOUR VAULT BALANCE
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#15191D] flex items-center justify-center text-[#C5FF36]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#C5FF36]">
              {wallet.isConnected ? stats.userBalance : '0.0000'}
            </span>
            <span className="text-xs font-mono text-zinc-400">ETH</span>
          </div>
          <p className="mt-2 text-[11px] font-mono text-zinc-500">
            {wallet.isConnected ? 'Available in contract to withdraw' : 'Connect wallet to view'}
          </p>
        </div>

        {/* Card 2: Wallet Available ETH */}
        <div className="neon-glow-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              WALLET BALANCE
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#15191D] flex items-center justify-center text-zinc-300">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {wallet.isConnected
                ? wallet.isSepolia
                  ? wallet.balance
                  : wallet.sepoliaRawBalance > 0n
                  ? wallet.sepoliaBalance
                  : wallet.balance
                : '0.0000'}
            </span>
            <span className="text-xs font-mono text-zinc-400">ETH</span>
          </div>

          {wallet.isConnected ? (
            wallet.isSepolia ? (
              <p className="mt-2 text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Available in MetaMask (Sepolia)</span>
              </p>
            ) : (
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400">
                  {wallet.sepoliaRawBalance > 0n
                    ? `Sepolia: ${wallet.sepoliaBalance} ETH`
                    : `On ${wallet.networkName}`}
                </span>
                <button
                  onClick={onSwitchNetwork}
                  className="text-[#C5FF36] hover:underline flex items-center space-x-0.5"
                >
                  <Zap className="w-3 h-3" />
                  <span>Switch</span>
                </button>
              </div>
            )
          ) : (
            <p className="mt-2 text-[11px] font-mono text-zinc-500">MetaMask not connected</p>
          )}
        </div>

        {/* Card 3: Total Value Locked (TVL) */}
        <div className="neon-glow-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              TOTAL VALUE LOCKED (TVL)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#15191D] flex items-center justify-center text-[#C5FF36]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {stats.contractTVL}
            </span>
            <span className="text-xs font-mono text-zinc-400">ETH</span>
          </div>
          <p className="mt-2 text-[11px] font-mono text-zinc-500">
            Global balance held by smart contract
          </p>
        </div>

        {/* Card 4: Lifetime Metrics */}
        <div className="neon-glow-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              YOUR LIFETIME FLOW
            </span>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-zinc-400">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deposited:</span>
              </span>
              <span className="text-white font-semibold">
                {wallet.isConnected ? stats.userDeposited : '0.0000'} ETH
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-zinc-400">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Withdrawn:</span>
              </span>
              <span className="text-white font-semibold">
                {wallet.isConnected ? stats.userWithdrawn : '0.0000'} ETH
              </span>
            </div>
          </div>
          <p className="mt-3 text-[10px] font-mono text-zinc-500">
            Cumulative on-chain accounting
          </p>
        </div>
      </div>
    </div>
  );
};
