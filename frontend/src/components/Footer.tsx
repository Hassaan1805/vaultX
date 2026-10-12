import React from 'react';
import { Shield, ExternalLink, Github, Terminal } from 'lucide-react';
import { getEtherscanAddressUrl } from '../lib/ethersUtils';

interface FooterProps {
  contractAddress: string;
}

export const Footer: React.FC<FooterProps> = ({ contractAddress }) => {
  return (
    <footer className="w-full bg-[#030405] border-t border-white/5 py-12 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#C5FF36]" />
              <span className="text-base font-bold text-white tracking-wider">
                VAULT<span className="text-[#C5FF36]">X</span>
              </span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Decentralized Ethereum finance vault engineered for transparent self-custody and
              non-custodial asset protection.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-[#C5FF36]" />
              <span>ETHEREUM SEPOLIA (11155111)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase mb-3">NAVIGATION</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a href="#overview" className="hover:text-[#C5FF36] transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#vault" className="hover:text-[#C5FF36] transition-colors">
                  Finance Vault
                </a>
              </li>
              <li>
                <a href="#activity" className="hover:text-[#C5FF36] transition-colors">
                  Live Activity
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#C5FF36] transition-colors">
                  Security Model
                </a>
              </li>
            </ul>
          </div>

          {/* Blockchain & Verification */}
          <div>
            <h4 className="text-white font-bold uppercase mb-3">BLOCKCHAIN</h4>
            <ul className="space-y-2 text-zinc-400">
              {contractAddress && (
                <li>
                  <a
                    href={getEtherscanAddressUrl(contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 hover:text-[#C5FF36] transition-colors"
                  >
                    <span>Sepolia Etherscan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              )}
              <li>
                <a
                  href="https://sepolia.etherscan.io/address/0x5FbDB2315678afecb367f032d93F642f64180aa3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-[#C5FF36] transition-colors"
                >
                  <span>Contract Source Code</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-[#C5FF36] transition-colors"
                >
                  <span>Google Cloud Faucet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Project & Tech */}
          <div>
            <h4 className="text-white font-bold uppercase mb-3">PROJECT</h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-center space-x-1.5">
                <Terminal className="w-3 h-3 text-[#C5FF36]" />
                <span>Solidity 0.8.24 + Hardhat</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3 h-3 text-[#C5FF36]" />
                <span>OpenZeppelin Guard</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Github className="w-3 h-3 text-[#C5FF36]" />
                <span>ethers.js v6 + React 18</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-[11px] gap-4">
          <p>© {new Date().getFullYear()} VAULTX Protocol. Final Year Computer Engineering Project.</p>
          <p className="text-center md:text-right text-zinc-600">
            Educational testnet software. Not intended for commercial mainnet financial use.
          </p>
        </div>
      </div>
    </footer>
  );
};
