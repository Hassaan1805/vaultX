import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Code2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { FAUCET_LINKS } from '../lib/constants';

export const SecurityInfo: React.FC = () => {
  return (
    <section className="py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#C5FF36] uppercase tracking-widest">
            SECURITY & VERIFICATION
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase mt-2">
            SMART CONTRACT SECURITY
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            A comprehensive look at cryptographic custody, mathematical accounting guarantees, and
            testnet educational boundaries.
          </p>
        </div>

        {/* Security Deep Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item 1: Checks-Effects-Interactions */}
          <div className="neon-glow-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase text-white">
                Checks-Effects-Interactions Pattern
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every withdrawal first checks conditions (<code className="text-zinc-200">amount &gt; 0</code> and <code className="text-zinc-200">balances[msg.sender] &gt;= amount</code>), immediately modifies state effects (<code className="text-[#C5FF36]">balances[msg.sender] -= amount</code>), and only then interacts with external addresses via low-level call.
            </p>
          </div>

          {/* Item 2: ReentrancyGuard */}
          <div className="neon-glow-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#C5FF36]/10 border border-[#C5FF36]/20 flex items-center justify-center text-[#C5FF36]">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase text-white">
                OpenZeppelin ReentrancyGuard
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All state-changing functions (<code className="text-zinc-200">deposit()</code>, <code className="text-zinc-200">withdraw()</code>) utilize OpenZeppelin's audited <code className="text-[#C5FF36]">nonReentrant</code> modifier. Any recursive re-entrant invocation immediately reverts the transaction.
            </p>
          </div>

          {/* Item 3: Zero Admin Privilege */}
          <div className="neon-glow-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase text-white">
                Zero Owner Privileges
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The contract contains no <code className="text-zinc-200">onlyOwner</code>, pause functions, upgrade proxies, or arbitrary fund retrieval mechanisms. Neither the developer nor any third party can withdraw or freeze user deposits.
            </p>
          </div>

          {/* Item 4: Educational Sepolia Scope */}
          <div className="neon-glow-card p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase text-white">
                Educational Project Notice
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              VAULTX is a computer engineering blockchain demonstration built for the Ethereum
              Sepolia testnet. All assets used are free testnet tokens with no monetary value. This
              contract has not completed an independent third-party audit and is not for mainnet
              financial use.
            </p>
          </div>
        </div>

        {/* Sepolia Faucets Guide */}
        <div className="mt-12 p-8 rounded-2xl bg-[#0A0C0E] border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 text-[#C5FF36] font-mono text-xs uppercase">
                <Flame className="w-4 h-4" />
                <span>Need Sepolia Testnet ETH?</span>
              </div>
              <h4 className="text-xl font-bold font-mono text-white uppercase mt-1">
                GET FREE SEPOLIA TESTNET TOKENS
              </h4>
              <p className="mt-2 text-xs text-zinc-400">
                To test deposits and withdrawals, request free testnet ETH from official Ethereum
                faucets directly into your MetaMask wallet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {FAUCET_LINKS.map((faucet) => (
                <a
                  key={faucet.name}
                  href={faucet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-neon-secondary px-4 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2 hover:border-[#C5FF36]"
                >
                  <span>{faucet.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5FF36]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
