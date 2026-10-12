import React from 'react';
import { Wallet, ShieldCheck, Database, KeyRound, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'CONNECT WALLET',
      subtitle: 'Non-Custodial Handshake',
      desc: 'Connect your MetaMask wallet on Ethereum Sepolia. Authentication is cryptographic — no email, password, or third-party server account needed.',
      icon: Wallet,
    },
    {
      step: '02',
      title: 'DEPOSIT ETH',
      subtitle: 'Direct Contract Escrow',
      desc: 'Send testnet ETH directly to the FinanceVault smart contract. The transaction triggers the payable deposit() function, immutably crediting your address.',
      icon: Database,
    },
    {
      step: '03',
      title: 'BALANCE ACCOUNTING',
      subtitle: 'Isolated State Mappings',
      desc: 'Your balance is isolated in a private EVM state mapping. User A cannot touch User B funds, and the contract maintains lifetime cumulative accounting.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'INSTANT WITHDRAWAL',
      subtitle: 'Sovereign Self-Custody',
      desc: 'Call withdraw(amount) anytime. The contract validates checks, updates effects, and safely transfers your ETH back to your wallet with zero delay.',
      icon: KeyRound,
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#C5FF36] uppercase tracking-widest">
            DECENTRALIZED ARCHITECTURE
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase mt-2">
            HOW VAULTX WORKS
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            A transparent four-stage lifecycle powering decentralized asset protection without
            middlemen or centralized counterparty risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="neon-glow-card p-6 rounded-2xl relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black font-mono text-zinc-700 group-hover:text-[#C5FF36] transition-colors">
                      {st.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#050607] border border-white/10 flex items-center justify-center text-[#C5FF36] group-hover:border-[#C5FF36]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-mono text-white uppercase">
                    {st.title}
                  </h3>
                  <p className="text-xs font-mono text-[#C5FF36] mt-0.5">
                    {st.subtitle}
                  </p>
                  <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-5 h-5 text-zinc-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
