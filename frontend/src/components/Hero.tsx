import React from 'react';
import { ArrowRight, Lock, Eye, Cpu } from 'lucide-react';

interface HeroProps {
  onLaunchApp: () => void;
  onExplore: () => void;
  isConnected: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchApp, onExplore }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-vault-dots">
      {/* Ambient Radial Lime Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C5FF36]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-[#C5FF36]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0F1215] border border-white/10 text-zinc-300 text-xs font-mono mb-8 hover:border-[#C5FF36]/30 transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#C5FF36] shadow-neon-sm" />
          <span className="text-zinc-400">VAULTX PROTOCOL</span>
          <span className="text-zinc-600">•</span>
          <span className="text-[#C5FF36]">ETHEREUM SEPOLIA</span>
        </div>

        {/* Oversized Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] max-w-5xl mx-auto">
          SECURE YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#C5FF36]">
            DIGITAL FUTURE.
          </span>
        </h1>

        {/* Tagline & Supporting Description */}
        <div className="mt-8 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl font-medium text-[#C5FF36] tracking-wide uppercase font-mono">
            Your Assets. Your Control.
          </p>
          <p className="mt-3 text-zinc-400 text-sm md:text-base leading-relaxed">
            A decentralized finance vault built for transparent, wallet-controlled digital asset
            management on the Ethereum Sepolia testnet. Zero intermediaries, automated smart
            contract escrow, and perpetual self-custody.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLaunchApp}
            className="btn-neon-primary w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center space-x-3 group"
          >
            <span>LAUNCH APP</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onExplore}
            className="btn-neon-secondary w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-mono font-semibold tracking-widest uppercase flex items-center justify-center space-x-2"
          >
            <span>EXPLORE THE VAULT</span>
          </button>
        </div>

        {/* Three Core Feature Pillars */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="neon-glow-card p-6 rounded-2xl group">
            <div className="w-10 h-10 rounded-xl bg-[#050607] border border-white/10 flex items-center justify-center text-[#C5FF36] mb-5 group-hover:border-[#C5FF36]/40 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              100% Self-Custody
            </h3>
            <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
              You maintain sovereign ownership of your private keys and assets. No third-party
              custodian can freeze, redirect, or confiscate your deposited funds.
            </p>
          </div>

          <div className="neon-glow-card p-6 rounded-2xl group">
            <div className="w-10 h-10 rounded-xl bg-[#050607] border border-white/10 flex items-center justify-center text-[#C5FF36] mb-5 group-hover:border-[#C5FF36]/40 transition-colors">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              Transparent Accounting
            </h3>
            <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
              Every deposit, withdrawal, and balance is immutably indexed on the Ethereum blockchain.
              Verify your reserves on Sepolia Etherscan at any second.
            </p>
          </div>

          <div className="neon-glow-card p-6 rounded-2xl group">
            <div className="w-10 h-10 rounded-xl bg-[#050607] border border-white/10 flex items-center justify-center text-[#C5FF36] mb-5 group-hover:border-[#C5FF36]/40 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              Smart Contract Security
            </h3>
            <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
              Built on Solidity 0.8.24 utilizing OpenZeppelin's ReentrancyGuard and strict
              Checks-Effects-Interactions guarantees against exploit vectors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
