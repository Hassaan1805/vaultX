# VAULTX — Next-Gen Decentralized Finance Vault

[![Ethereum Sepolia](https://img.shields.io/badge/Network-Ethereum%20Sepolia-blue?style=flat-square&logo=ethereum)](https://sepolia.etherscan.io)
[![Solidity 0.8.24](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.3-yellow?style=flat-square)](https://hardhat.org/)
[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **"Your Assets. Your Control."**  
> VAULTX is a premium, non-custodial **Ethereum Finance Vault Web3 application** engineered for transparent, wallet-controlled digital asset custody. Designed with an ultra-sleek high-contrast fintech aesthetic featuring deep obsidian backgrounds, electric neon-lime (`#C5FF36`) accents, oversized editorial typography, and mathematical smart-contract security.

---

## ⚡ Core Highlights & Architectural Guarantees

1. **Sovereign Self-Custody**: Zero third-party custodial risk. No admin keys, no owner withdrawal backdoors, and no token upgrade proxies.
2. **Checks-Effects-Interactions (CEI)**: Every state change modifies internal balances *before* external value transfers occur.
3. **OpenZeppelin ReentrancyGuard**: Both `deposit()` and `withdraw()` employ audited `nonReentrant` mutex guards.
4. **Real Blockchain Integration**: Powered by `ethers.js v6` with MetaMask browser wallet connectivity on the **Ethereum Sepolia Testnet** (`Chain ID: 11155111`).
5. **Real-Time On-Chain Event Indexing**: Live listening and filtering of `Deposit` and `Withdrawal` events with block numbers, timestamps, and direct Sepolia Etherscan explorer links.
6. **Gas Protection UX**: Percentage buttons (25%, 50%, 75%, MAX) with automated gas buffer reservation preventing out-of-gas transaction failures.

---

## 📂 Project Architecture

```
VaultX/
├── contracts/                        # Smart Contracts & Hardhat Environment
│   ├── contracts/
│   │   ├── FinanceVault.sol          # Production Vault Contract
│   │   └── mocks/
│   │       └── ReentrancyAttacker.sol # Security test harness
│   ├── scripts/
│   │   └── deploy.ts                 # Automated deployment & config exporter
│   ├── test/
│   │   └── FinanceVault.test.ts      # 12 Automated Mocha/Chai Unit Tests
│   ├── hardhat.config.ts             # Hardhat network & optimizer settings
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                         # Vite + React 18 + TypeScript dApp
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Navigation, network pill, wallet menu
│   │   │   ├── Hero.tsx              # Editorial headline, ambient lime glow, CTAs
│   │   │   ├── VaultStats.tsx        # TVL, wallet bal, vault bal, lifetime flow
│   │   │   ├── DepositCard.tsx       # ETH deposit input, gas estimator, confetti
│   │   │   ├── WithdrawCard.tsx      # ETH withdrawal, CEI protection, confetti
│   │   │   ├── TransactionHistory.tsx# Live event table with search & filter tabs
│   │   │   ├── HowItWorks.tsx        # 4-stage smart contract visual lifecycle
│   │   │   ├── SecurityInfo.tsx      # Security guarantees & Sepolia faucets
│   │   │   ├── Toast.tsx             # Floating transaction confirmation alerts
│   │   │   └── Footer.tsx            # Explorer links & academic credits
│   │   ├── hooks/
│   │   │   ├── useWallet.ts          # MetaMask connector, account/chain listeners
│   │   │   └── useVaultContract.ts   # Contract reads/writes, gas estimation, events
│   │   ├── lib/
│   │   │   ├── constants.ts          # Sepolia params, RPCs, faucets
│   │   │   ├── contractABI.ts        # Typed interface & ABI loader
│   │   │   ├── ethersUtils.ts        # Formatters, parseEther, error decoders
│   │   │   └── deployedContract.json # Exported deployment metadata
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript domain interfaces
│   │   ├── App.tsx                   # Main dApp layout & state orchestration
│   │   ├── main.tsx                  # React DOM entry point
│   │   ├── index.css                 # Custom design tokens & utility styles
│   │   └── vite-env.d.ts             # Environment typing
│   ├── index.html                    # SEO tags, Space Grotesk & JetBrains Mono
│   ├── tailwind.config.js            # Custom VAULTX neon theme config
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore                        # Standard node, hardhat, and env ignores
├── .env.example                      # Deployment & RPC template
├── package.json                      # Root orchestration scripts
└── README.md                         # Comprehensive documentation
```

---

## 🛠️ Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node `v22.17.1`)
- **npm**: `v9.0.0` or higher (tested on npm `10.9.2`)
- **MetaMask Extension**: Installed in your web browser (Chrome, Brave, Edge, Firefox)
- **Sepolia Testnet ETH**: Free test tokens from public faucets (see Faucets section below)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

You can install all dependencies from the root directory or inside each folder:

```bash
# Install root, contracts, and frontend dependencies
npm --prefix contracts install
npm --prefix frontend install
```

### 2. Run Automated Smart Contract Tests

Verify that all 12 smart contract security tests pass:

```bash
npm --prefix contracts test
```

**Expected Test Output**:
```
  FinanceVault (VAULTX)
    1. Deployment & Initial State
      √ should initialize with zero TVL and balances
    2. Deposit Functionality
      √ should allow a user to deposit ETH and update balances correctly
      √ should accumulate multiple deposits for the same user
      √ should revert with ZeroAmount if deposit value is 0
      √ should accept direct ETH transfers via receive() fallback
    3. Withdrawal Functionality
      √ should allow a user to partially withdraw their funds
      √ should allow a user to withdraw their entire balance
      √ should revert with ZeroAmount when attempting to withdraw 0 ETH
      √ should revert with InsufficientBalance when requested amount exceeds user balance
    4. Multi-User Isolation & Security
      √ should guarantee that User A cannot withdraw User B funds
      √ should return correct account stats via getUserStats
    5. Reentrancy Protection
      √ should defend against reentrancy attacks via ReentrancyGuard

  12 passing (1s)
```

### 3. Start the Frontend Development Server

Launch the Vite local dev server:

```bash
npm --prefix frontend run dev
```

Open your browser and navigate to: **`http://localhost:3000`**

### 4. Build Production Bundle

To validate TypeScript types and generate the minified production distribution:

```bash
npm --prefix frontend run build
```

---

## 🔐 Deploying to Ethereum Sepolia Testnet

### Step 1: Configure Environment Variables

1. In the project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the following fields:
   ```env
   # Sepolia RPC URL (from Alchemy, Infura, or public RPC)
   SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"

   # Deployer Account Private Key (Export from MetaMask test wallet)
   # DO NOT USE AN ACCOUNT CONTAINING REAL MAINNET FUNDS!
   PRIVATE_KEY="YOUR_64_CHAR_HEX_PRIVATE_KEY"

   # (Optional) For automated Etherscan source verification
   ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
   ```

### Step 2: Deploy Contract

Run the deployment script configured for Sepolia:

```bash
npm --prefix contracts run deploy:sepolia
```

When execution completes:
- The terminal displays the deployed contract address.
- The script **automatically exports** the contract address and ABI into `frontend/src/lib/deployedContract.json`.
- The frontend will immediately bind to the live deployed contract!

### Step 3: Verify on Sepolia Etherscan (Optional)

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

---

## 🦊 MetaMask & Sepolia Network Setup

If MetaMask does not automatically prompt you to switch, you can verify or add Sepolia with these parameters:

- **Network Name**: `Ethereum Sepolia`
- **New RPC URL**: `https://rpc.sepolia.org` or `https://ethereum-sepolia-rpc.publicnode.com`
- **Chain ID**: `11155111` (`0xaa36a7`)
- **Currency Symbol**: `ETH`
- **Block Explorer URL**: `https://sepolia.etherscan.io`

### 🚰 Free Sepolia Testnet Faucets

Acquire free Sepolia testnet ETH to test deposits and withdrawals:
- [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

---

## 🔒 Smart Contract Security Architecture

### Solidity Contract: `FinanceVault.sol`

```solidity
// Core invariants:
mapping(address => uint256) public balances;
mapping(address => uint256) public userDeposited;
mapping(address => uint256) public userWithdrawn;
uint256 public totalVaultDeposited;
uint256 public totalVaultWithdrawn;
```

### Key Security Safeguards:
1. **Isolated Accounting**: Balances are recorded per `msg.sender`. One user can never decrease or withdraw another user's balance.
2. **Reentrancy Protection**: Protected by OpenZeppelin's `ReentrancyGuard` modifier (`nonReentrant`) on all state modifications.
3. **Safe Low-Level Transfers**: Uses standard `(bool success, ) = msg.sender.call{value: amount}("");` with explicit error handling (`revert TransferFailed()`).
4. **Zero Administrative Backdoors**: Contains no owner keys, pause levers, or withdrawal overrides.

---

## 🎓 Academic Demonstration Guide

For presentations and viva evaluations, follow this live demonstration path:

1. **Brand & Architecture**: Showcase the editorial typography, neon aesthetics, and responsive layout.
2. **MetaMask Connection**: Click **CONNECT METAMASK**, sign the provider handshake, and observe dynamic wallet balance reading.
3. **Network Validation**: Connect to another network (e.g. Ethereum Mainnet or Polygon) to display the automatic **Wrong Network** banner and one-click **Switch to Sepolia** flow.
4. **Deposit Execution**:
   - Use the percentage buttons (e.g., `50%` or `MAX`).
   - Note the automatic gas buffer calculation.
   - Confirm the transaction in MetaMask.
   - Observe the live confirmation state, confetti animation, balance refresh, and clickable Etherscan link.
5. **Withdrawal Execution**:
   - Withdraw a portion of your funds.
   - Demonstrate the Checks-Effects-Interactions validation ensuring users cannot withdraw beyond their balance.
6. **Activity Log**: View the real-time indexed event log displaying transaction hash, block number, amount, and timestamp.
7. **Security Deep Dive**: Walk through the automated tests (`npm test` in `contracts/`) showing 100% test pass rate including reentrancy resistance.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
# vaultX
