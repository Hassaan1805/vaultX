import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Preformatted,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Don't draw header/footer on cover page (page 1)
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 755, "VAULTX PROTOCOL — DECENTRALIZED FINANCE VAULT | ENGINEERING SPECIFICATION")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)

            # Footer
            self.line(54, 45, 558, 45)
            self.setFont("Helvetica", 8)
            self.drawString(54, 32, "Confidential — Computer Engineering Project Documentation & Code Audit")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 32, page_text)
            
        self.restoreState()

def create_code_box(code_text, style, bg="#F8FAFC", border="#CBD5E1"):
    pre = Preformatted(code_text.strip(), style)
    t = Table([[pre]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return t

def create_pdf(filename="VAULTX_Complete_Project_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=20,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=5,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor('#0F172A'),
    )

    story = []

    # =========================================================================
    # COVER / HEADER SECTION
    # =========================================================================
    story.append(Paragraph("VAULTX PROTOCOL • ETHEREUM SEPOLIA", ParagraphStyle('SuperTitle', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.HexColor('#4D7C0F'), spaceAfter=5)))
    story.append(Paragraph("A Decentralized Blockchain Finance Vault", title_style))
    story.append(Paragraph("Technical Architecture, Smart Contract Security & Production Web3 Implementation", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor('#84CC16'), spaceAfter=14))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Project Domain:</b>", body_style), Paragraph("Decentralized Finance (DeFi) Self-Custody Vault", body_style)],
        [Paragraph("<b>Blockchain Network:</b>", body_style), Paragraph("Ethereum Sepolia Testnet (Chain ID: 11155111)", body_style)],
        [Paragraph("<b>Smart Contract:</b>", body_style), Paragraph("<code>FinanceVault.sol</code> (Solidity 0.8.24)", body_style)],
        [Paragraph("<b>Live Contract Address:</b>", body_style), Paragraph("<b>0xc105C3d4006d546D9eB92b72FEC2A1C18BcF027e</b>", body_style)],
        [Paragraph("<b>Etherscan Verification:</b>", body_style), Paragraph("https://sepolia.etherscan.io/address/0xc105C3d4006d546D9eB92b72FEC2A1C18BcF027e", body_style)],
        [Paragraph("<b>GitHub Repository:</b>", body_style), Paragraph("https://github.com/Hassaan1805/vaultX", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[130, 374])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # =========================================================================
    # 1. EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "Modern digital asset custody faces a critical dilemma between ease-of-use and cryptographic security. "
        "Centralized exchange vaults and poorly architected smart contracts frequently suffer from custodial freeze risks, "
        "reentrancy exploits, and administrative backdoors. <b>VAULTX</b> addresses these vulnerabilities by establishing a "
        "mathematically verifiable, 100% self-custodial digital asset escrow protocol.",
        body_style
    ))
    story.append(Paragraph("<b>Fundamental Protocol Safeguards:</b>", body_style))
    story.append(Paragraph("• <b>Zero Custodial Intermediaries:</b> Users maintain sovereign ownership of private keys via MetaMask. No third party can freeze or confiscate assets.", bullet_style))
    story.append(Paragraph("• <b>Per-User Accounting Isolation:</b> Balances are tracked per <code>msg.sender</code>. User A cannot withdraw or affect funds belonging to User B.", bullet_style))
    story.append(Paragraph("• <b>Checks-Effects-Interactions (CEI):</b> Internal balance states are updated before external transfers occur, eradicating reentrancy drainage vectors.", bullet_style))
    story.append(Paragraph("• <b>OpenZeppelin ReentrancyGuard:</b> Both deposit and withdrawal execution are shielded by audited mutex locks.", bullet_style))
    story.append(Paragraph("• <b>Zero Privilege Levers:</b> Contains no <code>onlyOwner</code> functions, admin upgrade levers, or arbitrary withdrawal overrides.", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # 2. SYSTEM ARCHITECTURE & TECH STACK
    # =========================================================================
    story.append(Paragraph("2. System Architecture & Technology Stack", h1_style))

    stack_data = [
        [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Technology</b>", body_style), Paragraph("<b>Key Responsibilities</b>", body_style)],
        [Paragraph("Smart Contract", body_style), Paragraph("Solidity 0.8.24", body_style), Paragraph("Core vault ledger, escrow accounting, reentrancy defense", body_style)],
        [Paragraph("Development Env", body_style), Paragraph("Hardhat 2.22.3", body_style), Paragraph("Compilation, Mocha/Chai unit testing, network deployment", body_style)],
        [Paragraph("Security Library", body_style), Paragraph("OpenZeppelin 5.0.2", body_style), Paragraph("Audited ReentrancyGuard mutex lock", body_style)],
        [Paragraph("Web3 Integration", body_style), Paragraph("ethers.js v6.12.1", body_style), Paragraph("BrowserProvider, contract calls, ABI encoding, event listeners", body_style)],
        [Paragraph("Client Framework", body_style), Paragraph("React 18 + Vite", body_style), Paragraph("Reactive state, fast HMR, optimized bundler", body_style)],
        [Paragraph("Styling System", body_style), Paragraph("Tailwind CSS", body_style), Paragraph("Fintech editorial theme, neon green (#C5FF36), glassmorphism", body_style)],
        [Paragraph("Network Node", body_style), Paragraph("Alchemy Sepolia RPC", body_style), Paragraph("High-speed EVM JSON-RPC provider on Ethereum Sepolia", body_style)],
    ]
    stack_table = Table(stack_data, colWidths=[95, 115, 294])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Project File Architecture:</b>", h2_style))
    tree_text = """vaultX/
+-- contracts/
|   +-- contracts/
|   |   +-- FinanceVault.sol              # Core Escrow Contract (Solidity 0.8.24)
|   |   +-- mocks/ReentrancyAttacker.sol  # Security Attack Harness
|   +-- scripts/deploy.ts                 # Automated Sepolia Deployment & JSON Exporter
|   +-- test/FinanceVault.test.ts         # 12 Hardhat Unit Test Cases
|   +-- hardhat.config.ts                 # Hardhat Compiler & Network Config
+-- frontend/
|   +-- src/
|   |   +-- components/                   # Navbar, Hero, Stats, Cards, Activity, Security
|   |   +-- hooks/
|   |   |   +-- useWallet.ts              # MetaMask Provider, Network Detection & Polling
|   |   |   +-- useVaultContract.ts       # On-chain Read/Write & Real-Time Events
|   |   +-- lib/deployedContract.json     # Live Sepolia Contract Address & ABI
|   |   +-- App.tsx                       # Master Application Layout & Toast Coordinator
+-- .env                                  # Alchemy RPC & Testnet Deployer Private Key
+-- package.json                          # Unified Root Scripts (dev, build, test, deploy)
+-- README.md                             # Comprehensive Operations & Setup Manual"""
    story.append(create_code_box(tree_text, code_style))

    # =========================================================================
    # 3. SMART CONTRACT DEEP-DIVE & KEY CODES
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Smart Contract Implementation (`FinanceVault.sol`)", h1_style))
    story.append(Paragraph(
        "<code>FinanceVault.sol</code> is engineered to provide gas-optimized accounting, strict Checks-Effects-Interactions (CEI) guarantees, "
        "and clear custom errors for failure states.",
        body_style
    ))

    story.append(Paragraph("<b>A. State Storage Architecture:</b>", h2_style))
    code_storage = """// Active per-user liquid balances
mapping(address => uint256) public balances;

// Cumulative lifetime ETH deposited per user address
mapping(address => uint256) public userDeposited;

// Cumulative lifetime ETH withdrawn per user address
mapping(address => uint256) public userWithdrawn;

// Global lifetime cumulative statistics
uint256 public totalVaultDeposited;
uint256 public totalVaultWithdrawn;"""
    story.append(create_code_box(code_storage, code_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>B. Deposit Function (`deposit`):</b>", h2_style))
    code_deposit = """function deposit() external payable nonReentrant {
    if (msg.value == 0) {
        revert ZeroAmount();
    }

    uint256 amount = msg.value;

    // State accounting (Effects)
    balances[msg.sender] += amount;
    userDeposited[msg.sender] += amount;
    totalVaultDeposited += amount;

    emit Deposit(msg.sender, amount, block.timestamp);
}"""
    story.append(create_code_box(code_deposit, code_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>C. Withdrawal Function with Checks-Effects-Interactions (`withdraw`):</b>", h2_style))
    code_withdraw = """function withdraw(uint256 amount) external nonReentrant {
    // 1. CHECKS (Validation)
    if (amount == 0) {
        revert ZeroAmount();
    }
    uint256 currentBalance = balances[msg.sender];
    if (amount > currentBalance) {
        revert InsufficientBalance(amount, currentBalance);
    }

    // 2. EFFECTS (Internal state updated BEFORE external transfer)
    balances[msg.sender] = currentBalance - amount;
    userWithdrawn[msg.sender] += amount;
    totalVaultWithdrawn += amount;

    emit Withdrawal(msg.sender, amount, block.timestamp);

    // 3. INTERACTIONS (Safe native low-level transfer)
    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) {
        revert TransferFailed();
    }
}"""
    story.append(create_code_box(code_withdraw, code_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>D. Direct Ether Transfer Fallback (`receive`):</b>", h2_style))
    code_receive = """receive() external payable {
    if (msg.value == 0) {
        revert ZeroAmount();
    }
    uint256 amount = msg.value;
    balances[msg.sender] += amount;
    userDeposited[msg.sender] += amount;
    totalVaultDeposited += amount;
    emit Deposit(msg.sender, amount, block.timestamp);
}"""
    story.append(create_code_box(code_receive, code_style))

    # =========================================================================
    # 4. SECURITY AUDIT ANALYSIS & TEST RESULTS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Automated Unit Testing & Security Verification", h1_style))
    story.append(Paragraph(
        "All 12 automated unit tests pass in Hardhat. The test suite verifies deposit state accumulation, overdraft protection, "
        "direct transfers, multi-user isolation, and reentrancy attack resistance via <code>ReentrancyAttacker.sol</code>:",
        body_style
    ))

    test_data = [
        [Paragraph("<b>Test Module</b>", body_style), Paragraph("<b>Test Assertion Description</b>", body_style), Paragraph("<b>Status</b>", body_style)],
        [Paragraph("1. Init", body_style), Paragraph("Verifies initial TVL, balances, and cumulative counters are 0.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("2. Deposit", body_style), Paragraph("Verifies balance updates and event emissions on single/multiple deposits.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("2. Zero Dep", body_style), Paragraph("Asserts revert with custom error <code>ZeroAmount()</code> on 0 ETH deposit.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("2. Fallback", body_style), Paragraph("Verifies plain Ether transfers trigger <code>receive()</code> and credit balance.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("3. Partial With", body_style), Paragraph("Verifies partial withdrawal updates balance and transfers correct Ether.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("3. Full With", body_style), Paragraph("Verifies user can withdraw 100% of their deposited balance safely.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("3. Zero With", body_style), Paragraph("Asserts revert with custom error <code>ZeroAmount()</code> on 0 ETH withdrawal.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("3. Overdraft", body_style), Paragraph("Asserts revert with <code>InsufficientBalance(requested, available)</code>.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("4. User Isolation", body_style), Paragraph("Guarantees User A cannot withdraw User B's funds even if contract has TVL.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("4. Account Stats", body_style), Paragraph("Verifies <code>getUserStats()</code> returns correct 3-tuple metrics.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("5. Reentrancy", body_style), Paragraph("Malicious contract attempting recursive callback fails and reverts safely.", body_style), Paragraph("<b>PASSED</b>", body_style)],
    ]
    test_table = Table(test_data, colWidths=[90, 334, 80])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (2,1), (2,-1), colors.HexColor('#15803D')),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Reentrancy Defense Test Code:</b>", h2_style))
    code_test = """it("should defend against reentrancy attacks via ReentrancyGuard", async function () {
    // User1 deposits 5 ETH into the vault
    await vault.connect(user1).deposit({ value: ethers.parseEther("5.0") });

    // Deploy malicious attacker contract targeting vault
    const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
    const attacker = await AttackerFactory.connect(attackerUser).deploy(await vault.getAddress());

    // Attacker attempts recursive reentrant drain -> Reverts!
    await expect(
        attacker.connect(attackerUser).initiateAttack({ value: ONE_ETH })
    ).to.be.reverted;

    // Vault TVL and User1 funds remain 100% intact
    expect(await vault.getUserBalance(user1.address)).to.equal(ethers.parseEther("5.0"));
    expect(await vault.getContractBalance()).to.equal(ethers.parseEther("5.0"));
});"""
    story.append(create_code_box(code_test, code_style))

    # =========================================================================
    # 5. FRONTEND WEB3 INTEGRATION & UX ENGINE
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Frontend Web3 Integration Engine", h1_style))
    story.append(Paragraph(
        "The frontend application provides seamless synchronization between MetaMask browser wallets, Ethereum Sepolia RPC nodes, "
        "and the <code>FinanceVault</code> contract. Key innovations include:",
        body_style
    ))

    story.append(Paragraph("<b>A. Dual-Source Balance Resolution (`useWallet.ts`):</b>", h2_style))
    story.append(Paragraph(
        "MetaMask multi-chain UI frequently displays tokens across different chains while keeping the active connection on Ethereum Mainnet. "
        "To prevent confusion where a user holds 0.0500 SepoliaETH but sees 0.0000 ETH on Mainnet, VAULTX implements dual-source balance querying. "
        "It queries the active MetaMask provider while simultaneously checking the public Sepolia RPC directly:",
        body_style
    ))

    code_dual = """// 1. Fetch from active MetaMask provider directly
const hexBal = await window.ethereum.request({
    method: 'eth_getBalance',
    params: [account, 'latest'],
});
if (hexBal) activeRaw = BigInt(hexBal);

// 2. Fetch directly from Sepolia public RPC for guaranteed testnet accuracy
const sepProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
sepoliaRaw = await sepProvider.getBalance(account);

// If MetaMask is on Mainnet, the dApp still knows the user has 0.0500 SepoliaETH
// and renders an instant 1-click 'Switch to Sepolia' action!"""
    story.append(create_code_box(code_dual, code_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>B. Gas Reserve Buffer Protection (`calculatePercentageAmount`):</b>", h2_style))
    story.append(Paragraph(
        "When depositing, clicking 100% (MAX) in naive dApps drains all Ether, causing MetaMask to throw an <i>'insufficient funds for gas'</i> error. "
        "VAULTX calculates a dynamic 0.003 ETH buffer reserve automatically:",
        body_style
    ))

    code_buffer = """export function calculatePercentageAmount(rawBalance: bigint, percentage: number, isDeposit: boolean = true) {
    if (rawBalance <= 0n) return '0';
    if (isDeposit && percentage === 100) {
        const gasBuffer = ethers.parseEther('0.003'); // Reserve gas buffer
        if (rawBalance <= gasBuffer) return '0';
        return ethers.formatEther(rawBalance - gasBuffer);
    }
    const fraction = BigInt(percentage);
    return ethers.formatEther((rawBalance * fraction) / 100n);
}"""
    story.append(create_code_box(code_buffer, code_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>C. Real-Time On-Chain Event Indexing (`useVaultContract.ts`):</b>", h2_style))
    code_events = """// Live On-Chain Event Subscriptions
contract.on('Deposit', (user, amount, timestamp, event) => {
    fetchStats(); // Instantly update balances
    addNewTransactionRecord({ type: 'deposit', user, amount, timestamp, txHash: event.log.transactionHash });
});

contract.on('Withdrawal', (user, amount, timestamp, event) => {
    fetchStats();
    addNewTransactionRecord({ type: 'withdrawal', user, amount, timestamp, txHash: event.log.transactionHash });
});"""
    story.append(create_code_box(code_events, code_style))

    # =========================================================================
    # 6. OPERATIONAL WORKFLOW & VERIFICATION
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Operational Deployment & Execution Guide", h1_style))
    story.append(Paragraph(
        "Follow these concise terminal commands to run, test, and deploy the project:",
        body_style
    ))

    story.append(Paragraph("<b>Step 1: Install Dependencies</b>", h2_style))
    story.append(Paragraph("<code>npm --prefix contracts install</code><br/><code>npm --prefix frontend install</code>", body_style))

    story.append(Paragraph("<b>Step 2: Execute Unit Tests</b>", h2_style))
    story.append(Paragraph("<code>npm --prefix contracts test</code> (All 12 unit tests execute and pass in ~1 second)", body_style))

    story.append(Paragraph("<b>Step 3: Deploy to Ethereum Sepolia</b>", h2_style))
    story.append(Paragraph("Ensure <code>.env</code> contains your <code>SEPOLIA_RPC_URL</code> and <code>PRIVATE_KEY</code>, then run:<br/><code>npm --prefix contracts run deploy:sepolia</code>", body_style))
    story.append(Paragraph(
        "<i>Notice: The deployment script automatically updates <code>frontend/src/lib/deployedContract.json</code> with the newly generated contract address and ABI!</i>",
        ParagraphStyle('Callout', parent=body_style, textColor=colors.HexColor('#0369A1'), fontName='Helvetica-Oblique')
    ))

    story.append(Paragraph("<b>Step 4: Launch Frontend Interface</b>", h2_style))
    story.append(Paragraph("<code>npm run dev</code> (Launches Vite development server on <b>http://localhost:3000</b>)", body_style))

    story.append(Spacer(1, 14))
    story.append(Paragraph("7. Conclusion & Engineering Significance", h1_style))
    story.append(Paragraph(
        "VAULTX successfully demonstrates a production-grade decentralized finance application adhering to the highest standards of Web3 engineering: "
        "checks-effects-interactions state mutation, OpenZeppelin reentrancy protection, zero administrative custody vulnerabilities, "
        "and a high-contrast editorial fintech UI with dual-source real-time blockchain balance synchronization. "
        "The project serves as a comprehensive portfolio showcase for academic viva presentations and production smart contract design.",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_pdf()
