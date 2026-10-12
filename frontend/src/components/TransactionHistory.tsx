import React, { useState } from 'react';
import { TransactionRecord } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';
import { getEtherscanTxUrl, getEtherscanAddressUrl, shortenAddress } from '../lib/ethersUtils';

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'mine'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Tab filter
    if (filter === 'deposits' && tx.type !== 'deposit') return false;
    if (filter === 'withdrawals' && tx.type !== 'withdrawal') return false;
    if (filter === 'mine' && !tx.isCurrentUser) return false;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchUser = tx.user.toLowerCase().includes(q);
      const matchAmount = tx.amount.includes(q);
      return matchHash || matchUser || matchAmount;
    }

    return true;
  });

  return (
    <div className="neon-glow-card rounded-2xl p-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-mono font-bold uppercase text-white tracking-wide">
              TRANSACTION ACTIVITY
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#15191D] text-[#C5FF36] border border-white/10">
              {transactions.length} ON-CHAIN EVENTS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time indexed smart contract events on Ethereum Sepolia
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by hash or address..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#050607] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5FF36] w-48 sm:w-60"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-[#C5FF36] transition-colors"
            title="Refresh transaction logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C5FF36]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 py-4 overflow-x-auto">
        {[
          { id: 'all', label: 'ALL EVENTS' },
          { id: 'deposits', label: 'DEPOSITS' },
          { id: 'withdrawals', label: 'WITHDRAWALS' },
          { id: 'mine', label: 'MY TRANSACTIONS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-colors whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#C5FF36] text-black font-bold shadow-neon-sm'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Table / List */}
      <div className="overflow-x-auto mt-2">
        {isLoading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs space-y-2">
            <p>NO ON-CHAIN EVENTS RECORDED YET</p>
            <p className="text-[11px] text-zinc-600">
              Perform your first deposit or withdrawal to create verified on-chain history.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 uppercase text-[11px]">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3">Tx Hash</th>
                <th className="py-3 px-3">Block</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Type */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {tx.type === 'deposit' ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>DEPOSIT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-sky-950/50 border border-sky-500/20 text-sky-400 font-semibold text-[11px]">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>WITHDRAW</span>
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-bold text-white">
                    <span className={tx.type === 'deposit' ? 'text-emerald-300' : 'text-sky-300'}>
                      {tx.type === 'deposit' ? '+' : '-'}
                      {parseFloat(tx.amount).toFixed(4)} ETH
                    </span>
                  </td>

                  {/* Account */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <a
                        href={getEtherscanAddressUrl(tx.user)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-[#C5FF36] transition-colors"
                      >
                        {shortenAddress(tx.user)}
                      </a>
                      {tx.isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#C5FF36]/10 text-[#C5FF36] border border-[#C5FF36]/30">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tx Hash */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <a
                        href={getEtherscanTxUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-[#C5FF36] flex items-center space-x-1"
                        title="View on Sepolia Etherscan"
                      >
                        <span>{shortenAddress(tx.txHash, 4)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleCopy(tx.txHash)}
                        className="text-zinc-500 hover:text-white p-1 rounded"
                        title="Copy Tx Hash"
                      >
                        {copiedHash === tx.txHash ? (
                          <Check className="w-3 h-3 text-[#C5FF36]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Block */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-zinc-400">
                    #{tx.blockNumber}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-zinc-400">
                    {tx.dateStr}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-right">
                    <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Confirmed</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
