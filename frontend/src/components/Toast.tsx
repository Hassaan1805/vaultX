import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, ExternalLink } from 'lucide-react';
import { getEtherscanTxUrl } from '../lib/ethersUtils';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-sky-400" />;
        let borderColor = 'border-white/10';
        let bgColor = 'bg-[#0D0F12]';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-[#C5FF36]" />;
          borderColor = 'border-[#C5FF36]/30';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-400" />;
          borderColor = 'border-rose-500/30';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          borderColor = 'border-amber-500/30';
        }

        return (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border ${borderColor} ${bgColor} shadow-2xl backdrop-blur-xl animate-fade-in flex items-start space-x-3 relative`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>

            <div className="flex-1 pr-6">
              <h5 className="text-xs font-mono font-bold uppercase text-white tracking-wide">
                {toast.title}
              </h5>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                {toast.description}
              </p>

              {toast.txHash && (
                <a
                  href={getEtherscanTxUrl(toast.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center space-x-1.5 text-[11px] font-mono text-[#C5FF36] hover:underline"
                >
                  <span>View on Sepolia Etherscan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="absolute top-3.5 right-3.5 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
