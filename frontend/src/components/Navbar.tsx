import React, { useState } from 'react';
import { WalletState } from '../types';
import {
  Shield,
  Wallet,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { getEtherscanAddressUrl } from '../lib/ethersUtils';

interface NavbarProps {
  wallet: WalletState;
  contractAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  contractAddress,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
  onNavigate,
  activeSection,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const copyToClipboard = (text: string, isContract = false) => {
    navigator.clipboard.writeText(text);
    if (isContract) {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const navLinks = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'vault', label: 'VAULT' },
    { id: 'activity', label: 'ACTIVITY' },
    { id: 'how-it-works', label: 'HOW IT WORKS' },
    { id: 'security', label: 'SECURITY' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050607]/80 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('overview')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#0F1215] border border-white/10 group-hover:border-[#C5FF36]/50 transition-colors">
            <Shield className="w-5 h-5 text-[#C5FF36] transition-transform group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C5FF36] shadow-neon-sm animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#C5FF36] transition-colors">
                VAULT
              </span>
              <span className="text-xl font-extrabold text-[#C5FF36]">X</span>
            </div>
            <span className="text-[10px] tracking-widest text-zinc-400 font-mono uppercase">
              SEPOLIA VAULT
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`text-xs font-mono tracking-wider uppercase transition-colors py-1 relative ${
                activeSection === link.id
                  ? 'text-[#C5FF36] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5FF36] shadow-neon-sm rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Action Controls & Wallet */}
        <div className="flex items-center space-x-3">
          {/* Network Indicator / Switch Button */}
          {wallet.isConnected && (
            <div className="hidden sm:flex items-center">
              {wallet.isSepolia ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sepolia</span>
                </div>
              ) : (
                <button
                  onClick={onSwitchNetwork}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-mono hover:bg-amber-900/40 transition-colors"
                  title="Click to switch to Sepolia"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wrong Network</span>
                </button>
              )}
            </div>
          )}

          {/* Wallet State Button */}
          {!wallet.isConnected ? (
            <button
              onClick={onConnect}
              disabled={wallet.isConnecting}
              className="btn-neon-primary flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-mono tracking-wider uppercase"
            >
              <Wallet className="w-4 h-4" />
              <span>{wallet.isConnecting ? 'CONNECTING...' : 'CONNECT METAMASK'}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-3.5 py-2 rounded-lg bg-[#0F1215] border border-white/10 hover:border-[#C5FF36]/40 text-white transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[#C5FF36]" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-mono font-semibold text-zinc-200">
                    {wallet.shortAddress}
                  </span>
                  <span className="text-[10px] font-mono text-[#C5FF36]">
                    {wallet.balance} ETH
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>

              {/* Wallet Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0D0F12] border border-white/10 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-[11px] text-zinc-400 font-mono">CONNECTED WALLET</p>
                    <p className="font-mono text-white text-xs break-all mt-0.5">
                      {wallet.address}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => copyToClipboard(wallet.address || '')}
                      className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <span className="flex items-center space-x-2">
                        {copiedAddress ? (
                          <Check className="w-3.5 h-3.5 text-[#C5FF36]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy Address</span>
                      </span>
                      {copiedAddress && (
                        <span className="text-[10px] text-[#C5FF36] font-mono">Copied!</span>
                      )}
                    </button>

                    <a
                      href={getEtherscanAddressUrl(wallet.address || '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center space-x-2 px-4 py-2 text-zinc-300 hover:text-white hover:bg-white/5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on Sepolia Etherscan</span>
                    </a>

                    {contractAddress && (
                      <button
                        onClick={() => copyToClipboard(contractAddress, true)}
                        className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:text-white hover:bg-white/5"
                      >
                        <span className="flex items-center space-x-2">
                          {copiedContract ? (
                            <Check className="w-3.5 h-3.5 text-[#C5FF36]" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-[#C5FF36]" />
                          )}
                          <span>Copy Vault Contract</span>
                        </span>
                        {copiedContract && (
                          <span className="text-[10px] text-[#C5FF36] font-mono">Copied!</span>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onDisconnect();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
