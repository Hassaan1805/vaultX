import { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { useVaultContract } from './hooks/useVaultContract';
import { ToastMessage } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VaultStats } from './components/VaultStats';
import { DepositCard } from './components/DepositCard';
import { WithdrawCard } from './components/WithdrawCard';
import { TransactionHistory } from './components/TransactionHistory';
import { HowItWorks } from './components/HowItWorks';
import { SecurityInfo } from './components/SecurityInfo';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { AlertTriangle, Wallet } from 'lucide-react';

export function App() {
  const {
    wallet,
    provider,
    signer,
    connectWallet,
    switchNetwork,
    disconnectWallet,
    refreshBalance,
  } = useWallet();

  const {
    contractAddress,
    stats,
    transactions,
    isLoadingTx,
    fetchStats,
    fetchTransactions,
    estimateDepositGas,
    estimateWithdrawGas,
    executeDeposit,
    executeWithdraw,
  } = useVaultContract(provider, signer, wallet.address, wallet.isSepolia);

  const [activeSection, setActiveSection] = useState('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast dispatchers
  const addToast = (
    title: string,
    description: string,
    type: 'success' | 'error' | 'info' | 'warning',
    txHash?: string
  ) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      type,
      txHash,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 6s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Surface wallet error as toast if triggered
  useEffect(() => {
    if (wallet.error) {
      addToast('Wallet Notice', wallet.error, 'warning');
    }
  }, [wallet.error]);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDepositAction = async (amount: string) => {
    const result = await executeDeposit(amount);
    refreshBalance();
    return result;
  };

  const handleWithdrawAction = async (amount: string) => {
    const result = await executeWithdraw(amount);
    refreshBalance();
    return result;
  };

  return (
    <div className="min-h-screen bg-[#050607] text-[#EDEDED] flex flex-col font-sans selection:bg-[#C5FF36] selection:text-black">
      {/* Toast Overlay */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        contractAddress={contractAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onSwitchNetwork={switchNetwork}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* Wrong Network Global Banner */}
      {wallet.isConnected && !wallet.isSepolia && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>
                You are currently connected to Chain ID {wallet.chainId}. VAULTX requires Ethereum
                Sepolia (Chain ID 11155111).
              </span>
            </div>
            <button
              onClick={switchNetwork}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase transition-colors"
            >
              Switch to Sepolia
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Section 1: Hero Overview */}
        <div id="overview">
          <Hero
            onLaunchApp={() => handleNavigate('vault')}
            onExplore={() => handleNavigate('how-it-works')}
            isConnected={wallet.isConnected}
          />
        </div>

        {/* Section 2: Vault Dashboard */}
        <section id="vault" className="py-12 md:py-20 border-t border-white/5 relative bg-vault-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-[#C5FF36] uppercase tracking-widest">
                  LIVE DECENTRALIZED PROTOCOL
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase mt-1">
                  FINANCE VAULT
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Deposit ETH to custody reserves. Withdraw any amount securely with verified
                  Checks-Effects-Interactions.
                </p>
              </div>

              {!wallet.isConnected && (
                <button
                  onClick={connectWallet}
                  className="btn-neon-primary px-6 py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>CONNECT METAMASK</span>
                </button>
              )}
            </div>

            {/* Dashboard Stats */}
            <VaultStats
              stats={stats}
              wallet={wallet}
              contractAddress={contractAddress}
              onRefresh={() => {
                refreshBalance();
                fetchStats();
              }}
              onSwitchNetwork={switchNetwork}
            />

            {/* If Wallet Not Connected: Show Friendly Guide Callout */}
            {!wallet.isConnected && (
              <div className="p-8 rounded-2xl bg-[#090B0D] border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#15191D] border border-white/10 mx-auto flex items-center justify-center text-[#C5FF36]">
                  <Wallet className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold font-mono text-white uppercase">
                  MetaMask Connection Required
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  To view your individual vault balances, estimate network gas fees, or execute
                  on-chain transactions, please connect your MetaMask wallet.
                </p>
                <button
                  onClick={connectWallet}
                  className="btn-neon-primary px-6 py-3 rounded-xl text-xs font-mono font-bold tracking-wider uppercase"
                >
                  CONNECT METAMASK NOW
                </button>
              </div>
            )}

            {/* Interactive Deposit & Withdrawal Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DepositCard
                wallet={wallet}
                onDeposit={handleDepositAction}
                estimateGas={estimateDepositGas}
                onConnectWallet={connectWallet}
                onSwitchNetwork={switchNetwork}
                onSuccessToast={(title, desc, hash) => addToast(title, desc, 'success', hash)}
                onErrorToast={(title, desc) => addToast(title, desc, 'error')}
              />

              <WithdrawCard
                wallet={wallet}
                stats={stats}
                onWithdraw={handleWithdrawAction}
                estimateGas={estimateWithdrawGas}
                onConnectWallet={connectWallet}
                onSwitchNetwork={switchNetwork}
                onSuccessToast={(title, desc, hash) => addToast(title, desc, 'success', hash)}
                onErrorToast={(title, desc) => addToast(title, desc, 'error')}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Live On-Chain Activity */}
        <section id="activity" className="py-12 md:py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TransactionHistory
              transactions={transactions}
              isLoading={isLoadingTx}
              onRefresh={fetchTransactions}
            />
          </div>
        </section>

        {/* Section 4: How It Works */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Section 5: Security & Verification */}
        <div id="security">
          <SecurityInfo />
        </div>
      </main>

      {/* Footer */}
      <Footer contractAddress={contractAddress} />
    </div>
  );
}
