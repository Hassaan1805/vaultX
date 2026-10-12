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
            # Running Header
            self.drawString(54, 755, "VAULTX — Complete Plain-English Project Guide & End-to-End Workflow")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)

            # Running Footer
            self.line(54, 45, 558, 45)
            self.setFont("Helvetica", 8)
            self.drawString(54, 32, "VAULTX Project Guide • Computer Engineering Blockchain Demonstration")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 32, page_text)
            
        self.restoreState()

def create_code_box(code_text, style, bg="#F8FAFC", border="#CBD5E1"):
    pre = Preformatted(code_text.strip(), style)
    t = Table([[pre]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border)),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return t

def create_callout_box(title, text, style_title, style_text, bg="#F0FDF4", border="#86EFAC"):
    content = [
        Paragraph(f"<b>{title}</b>", style_title),
        Spacer(1, 2),
        Paragraph(text, style_text)
    ]
    t = Table([[content]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border)),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
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
        fontSize=24,
        leading=30,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11.5,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=16,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=5,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
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

    callout_title = ParagraphStyle(
        'CalloutTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#166534'),
    )

    callout_body = ParagraphStyle(
        'CalloutBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#14532D'),
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER & BIG PICTURE (PLAIN ENGLISH)
    # =========================================================================
    story.append(Paragraph("VAULTX PROTOCOL • DECENTRALIZED FINANCE VAULT", ParagraphStyle('SuperTitle', fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=colors.HexColor('#4D7C0F'), spaceAfter=4)))
    story.append(Paragraph("The Complete Plain-English Project Guide & Workflow", title_style))
    story.append(Paragraph("An intuitive, end-to-end walkthrough of architecture, smart contract security, and key codes", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor('#84CC16'), spaceAfter=12))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Project Name:</b>", body_style), Paragraph("<b>VAULTX</b> — Self-Custody Finance Vault", body_style)],
        [Paragraph("<b>Live Network:</b>", body_style), Paragraph("Ethereum Sepolia Testnet (Chain ID: 11155111)", body_style)],
        [Paragraph("<b>Deployed Contract:</b>", body_style), Paragraph("<b>0xc105C3d4006d546D9eB92b72FEC2A1C18BcF027e</b>", body_style)],
        [Paragraph("<b>Etherscan Link:</b>", body_style), Paragraph("https://sepolia.etherscan.io/address/0xc105C3d4006d546D9eB92b72FEC2A1C18BcF027e", body_style)],
        [Paragraph("<b>GitHub Code:</b>", body_style), Paragraph("https://github.com/Hassaan1805/vaultX", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[120, 384])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1. The Big Picture: What is VAULTX in Plain English?", h1_style))
    story.append(Paragraph(
        "Imagine a modern <b>digital Swiss bank vault</b>. In a traditional bank, you give your money to a teller. The bank can freeze your account, lend your money out, or go bankrupt (as happened with FTX or Silicon Valley Bank).",
        body_style
    ))
    story.append(Paragraph(
        "<b>VAULTX is completely different:</b> It is a program that runs on the Ethereum blockchain (a <i>Smart Contract</i>). "
        "When you deposit your Ether (ETH) into VAULTX, <b>no human, no company, and no government can ever touch or freeze it</b>. "
        "The only person on Earth who can unlock your funds is <b>you</b>, using the private key in your MetaMask wallet. "
        "That is called <b>Self-Custody</b>.",
        body_style
    ))

    analogy_box = create_callout_box(
        "💡 The Real-World Analogy",
        "Think of VAULTX like a wall of transparent, unpickable glass lockers. Each locker has an unbreakable digital lock that only your MetaMask key can open. Anyone can see how much money is inside (transparency), but only the rightful owner can unlock their individual locker (self-custody).",
        callout_title, callout_body
    )
    story.append(analogy_box)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Why We Built VAULTX (The 3 Core Pillars):", h2_style))
    story.append(Paragraph("1. <b>100% Self-Custody:</b> 'Your Assets. Your Control.' No accounts, passwords, or emails. You authenticate with your wallet.", bullet_style))
    story.append(Paragraph("2. <b>Transparent Accounting:</b> Every deposit and withdrawal prints an immutable digital receipt on Ethereum (Events).", bullet_style))
    story.append(Paragraph("3. <b>Unhackable Logic:</b> The smart contract follows strict security rules (CEI and ReentrancyGuard) to prevent theft.", bullet_style))

    # =========================================================================
    # PAGE 2: THE END-TO-END WORKFLOW (STEP-BY-STEP)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("2. The Whole Workflow (Step-by-Step)", h1_style))
    story.append(Paragraph(
        "Here is the complete journey of how funds and data move from the user's screen all the way into the Ethereum blockchain:",
        body_style
    ))

    flowchart = """[Step 1: Connect]  User clicks 'Connect' -> MetaMask signs handshake -> Wallet address detected
       |
[Step 2: Deposit]  User enters 0.01 ETH -> Gas estimated -> MetaMask approval prompt
       |
[Step 3: Escrow]   Contract receives ETH -> Updates balances[user] -> Emits 'Deposit' event
       |
[Step 4: Custody]  ETH is securely held in contract on Sepolia; only user can withdraw
       |
[Step 5: Withdraw] User enters amount -> Contract checks balance -> Deducts state -> Sends ETH
       |
[Step 6: Activity] Live event listener catches tx -> Updates table with Sepolia Etherscan link"""
    story.append(create_code_box(flowchart, code_style, bg="#F0FDF4", border="#86EFAC"))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Detailed Walkthrough of Each Step:", h2_style))

    story.append(Paragraph("<b>Step 1: Connecting MetaMask (The Cryptographic Handshake)</b>", body_style))
    story.append(Paragraph(
        "There are no username/password sign-up forms in Web3. When you click <b>'Connect MetaMask'</b>, the dApp requests your public address (`0xBdA3A...775B9`). "
        "The dApp reads your current network (Ethereum Sepolia, Chain ID `11155111`). If you are accidentally on Mainnet or Polygon, the app displays a single-click button to automatically switch networks.",
        body_style
    ))

    story.append(Paragraph("<b>Step 2: Depositing ETH into the Vault</b>", body_style))
    story.append(Paragraph(
        "1. You type an amount (e.g., `0.01 ETH`) or click quick percentages (`25%`, `50%`, `MAX`).<br/>"
        "2. <b>The Gas Buffer Safety Feature:</b> In normal dApps, clicking 'MAX' uses 100% of your ETH, causing MetaMask to error because you have no money left to pay the network gas fee. VAULTX automatically holds back <b>0.003 ETH</b> as a gas cushion so your deposit always succeeds!<br/>"
        "3. You click <b>'DEPOSIT ETH TO VAULT'</b>. MetaMask pops up showing the transaction details.<br/>"
        "4. You click <b>Confirm</b>. MetaMask sends the transaction to Ethereum Sepolia validators.<br/>"
        "5. Once included in a block, the smart contract updates your balance, confetti bursts on your screen, and your vault balance updates live!",
        body_style
    ))

    story.append(Paragraph("<b>Step 3: Secure Escrow (Where the Money Lives)</b>", body_style))
    story.append(Paragraph(
        "The deposited ETH is held directly inside the <code>FinanceVault</code> smart contract address on the Sepolia blockchain. "
        "The contract stores your balance in an internal ledger: <code>balances[your_address] = 0.01 ETH</code>. "
        "There are no owner backdoors. The contract code has no function that allows the creator to touch your money.",
        body_style
    ))

    story.append(Paragraph("<b>Step 4: Withdrawing Your ETH</b>", body_style))
    story.append(Paragraph(
        "Whenever you want your money back, you enter the amount and click <b>'WITHDRAW ETH'</b>. "
        "The smart contract performs the <b>Checks-Effects-Interactions (CEI)</b> security pattern: it checks that you have enough funds, "
        "<b>deducts your balance first</b>, and only then transfers the native ETH back to your MetaMask wallet. This makes it impossible for hackers to steal funds via reentrancy.",
        body_style
    ))

    story.append(Paragraph("<b>Step 5: Live Activity Tracking</b>", body_style))
    story.append(Paragraph(
        "Every deposit and withdrawal emits an on-chain event. The frontend listens for these events in real-time, instantly adding each transaction to the <b>Transaction Activity</b> table with its block number, timestamp, and a direct link to view it on Sepolia Etherscan.",
        body_style
    ))

    # =========================================================================
    # PAGE 3: KEY SMART CONTRACT CODES (EASY BREAKDOWN)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Key Smart Contract Code (`FinanceVault.sol`)", h1_style))
    story.append(Paragraph(
        "Here are the most critical lines of Solidity code in the smart contract, explained simply:",
        body_style
    ))

    story.append(Paragraph("<b>Code Snippet 1: How the Contract Remembers Balances (State Storage)</b>", h2_style))
    code_storage = """// Maps each user's wallet address to their current vault balance in wei
mapping(address => uint256) public balances;

// Keeps track of the total lifetime ETH ever deposited by each user
mapping(address => uint256) public userDeposited;

// Keeps track of the total lifetime ETH ever withdrawn by each user
mapping(address => uint256) public userWithdrawn;

// Global counter for total ETH ever deposited across all users
uint256 public totalVaultDeposited;"""
    story.append(create_code_box(code_storage, code_style))
    story.append(Paragraph(
        "<b>In Simple Words:</b> A <code>mapping</code> in Solidity is like a digital spreadsheet. "
        "The first column is the wallet address (e.g. `0xBdA3A...`), and the second column is how much ETH that address owns. "
        "Because each person has their own row, User A can never see or modify User B's balance.",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Code Snippet 2: The Deposit Function (`deposit`)</b>", h2_style))
    code_deposit = """function deposit() external payable nonReentrant {
    // 1. Make sure the user didn't send 0 ETH
    if (msg.value == 0) {
        revert ZeroAmount();
    }

    uint256 amount = msg.value;

    // 2. Add the deposited ETH to the user's vault balance
    balances[msg.sender] += amount;
    userDeposited[msg.sender] += amount;
    totalVaultDeposited += amount;

    // 3. Emit an on-chain event so the frontend knows immediately
    emit Deposit(msg.sender, amount, block.timestamp);
}"""
    story.append(create_code_box(code_deposit, code_style))
    story.append(Paragraph(
        "<b>In Simple Words:</b> The keyword <code>payable</code> means this function can accept real cryptocurrency. "
        "<code>msg.value</code> is the exact amount of ETH sent in the transaction. "
        "<code>msg.sender</code> is the wallet address making the deposit. "
        "The contract adds the amount to <code>balances[msg.sender]</code> and emits a receipt (`Deposit` event).",
        body_style
    ))

    # =========================================================================
    # PAGE 4: WITHDRAWAL & SECURITY CODE (EASY BREAKDOWN)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. The Withdrawal Code & Security Architecture", h1_style))
    story.append(Paragraph(
        "Withdrawals are the most dangerous part of any Web3 vault. If written incorrectly, a hacker can drain all user funds in seconds (like the famous $60M DAO hack). "
        "Here is how VAULTX makes withdrawals 100% safe:",
        body_style
    ))

    story.append(Paragraph("<b>Code Snippet 3: The Safe Withdrawal Function (`withdraw`)</b>", h2_style))
    code_withdraw = """function withdraw(uint256 amount) external nonReentrant {
    // STEP 1: CHECKS - Validate the request
    if (amount == 0) revert ZeroAmount();
    uint256 currentBalance = balances[msg.sender];
    if (amount > currentBalance) {
        revert InsufficientBalance(amount, currentBalance);
    }

    // STEP 2: EFFECTS - Update our ledger BEFORE sending money
    balances[msg.sender] = currentBalance - amount;
    userWithdrawn[msg.sender] += amount;
    totalVaultWithdrawn += amount;

    emit Withdrawal(msg.sender, amount, block.timestamp);

    // STEP 3: INTERACTIONS - Safely transfer the ETH back to user
    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) {
        revert TransferFailed();
    }
}"""
    story.append(create_code_box(code_withdraw, code_style))
    story.append(Spacer(1, 4))

    cei_box = create_callout_box(
        "🛡️ What is Checks-Effects-Interactions (CEI)?",
        "Notice that in Step 2, we subtract the user's balance BEFORE sending the ETH in Step 3! "
        "Why? If a hacker creates a malicious contract that calls withdraw() over and over in a loop (a Reentrancy attack), "
        "their balance is ALREADY zero on the second loop, so the attack immediately fails! "
        "Combined with OpenZeppelin's nonReentrant lock, the vault cannot be drained.",
        callout_title, callout_body
    )
    story.append(cei_box)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Code Snippet 4: The Fallback Function (`receive`)</b>", h2_style))
    code_receive = """// If someone sends ETH directly to the vault address without clicking deposit,
// this function catches it and automatically credits their account!
receive() external payable {
    if (msg.value == 0) revert ZeroAmount();
    balances[msg.sender] += msg.value;
    userDeposited[msg.sender] += msg.value;
    totalVaultDeposited += msg.value;
    emit Deposit(msg.sender, msg.value, block.timestamp);
}"""
    story.append(create_code_box(code_receive, code_style))

    # =========================================================================
    # PAGE 5: FRONTEND WEB3 CODES (EASY BREAKDOWN)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Key Frontend Web3 Codes (React + ethers.js v6)", h1_style))
    story.append(Paragraph(
        "The frontend has two smart innovations that make the user experience silky smooth:",
        body_style
    ))

    story.append(Paragraph("<b>Code Snippet 5: Dual-Source Balance Fetching (`useWallet.ts`)</b>", h2_style))
    code_dual = """// 1. Ask MetaMask what balance it sees
const hexBal = await window.ethereum.request({
    method: 'eth_getBalance',
    params: [account, 'latest'],
});
if (hexBal) activeRaw = BigInt(hexBal);

// 2. Also check Sepolia public RPC directly!
const sepProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
const sepoliaRaw = await sepProvider.getBalance(account);

// If MetaMask is accidentally on Mainnet (0 ETH), the app detects your 0.0500 SepoliaETH
// and gives you a 1-click button to switch to Sepolia!"""
    story.append(create_code_box(code_dual, code_style))
    story.append(Paragraph(
        "<b>In Simple Words:</b> In MetaMask's new interface, you might see 0.0500 SepoliaETH in your token list, "
        "but MetaMask is still connected to Ethereum Mainnet (where you have 0 ETH). "
        "Our code queries the Sepolia network directly so the app always knows your real testnet balance, preventing confusion!",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Code Snippet 6: The 0.003 ETH Gas Buffer (`calculatePercentageAmount`)</b>", h2_style))
    code_gas = """export function calculatePercentageAmount(rawBalance, percentage, isDeposit) {
    if (rawBalance <= 0n) return '0';
    if (isDeposit && percentage === 100) {
        // Reserve 0.003 ETH so MetaMask doesn't reject for 'insufficient gas'
        const gasBuffer = ethers.parseEther('0.003');
        if (rawBalance <= gasBuffer) return '0';
        return ethers.formatEther(rawBalance - gasBuffer);
    }
    return ethers.formatEther((rawBalance * BigInt(percentage)) / 100n);
}"""
    story.append(create_code_box(code_gas, code_style))
    story.append(Paragraph(
        "<b>In Simple Words:</b> In Ethereum, sending a transaction costs a small gas fee. "
        "If you have 0.0500 ETH and click 'MAX', trying to deposit all 0.0500 ETH will fail because you have 0 ETH left for gas. "
        "This function reserves 0.003 ETH for the gas fee, letting you deposit the maximum possible amount seamlessly.",
        body_style
    ))

    # =========================================================================
    # PAGE 6: VIVA QUESTIONS & TESTING PROOF
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Security Testing & Viva / Exam Questions", h1_style))
    story.append(Paragraph(
        "This section prepares you for project presentations, viva questions, and technical evaluations:",
        body_style
    ))

    story.append(Paragraph("<b>Automated Test Suite Summary (12/12 Tests Passing):</b>", h2_style))
    test_data = [
        [Paragraph("<b>Category</b>", body_style), Paragraph("<b>What was tested</b>", body_style), Paragraph("<b>Result</b>", body_style)],
        [Paragraph("1. Initial State", body_style), Paragraph("Vault starts with 0 TVL and 0 user balances.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("2. Deposits", body_style), Paragraph("Single and multiple deposits update user and global stats correctly.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("3. Zero Check", body_style), Paragraph("Depositing or withdrawing 0 ETH reverts with <code>ZeroAmount()</code>.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("4. Withdrawals", body_style), Paragraph("Partial and full withdrawals transfer the exact native Ether.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("5. Overdraft", body_style), Paragraph("Withdrawing more than deposited balance reverts immediately.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("6. Isolation", body_style), Paragraph("User A cannot withdraw User B's funds even if contract has balance.", body_style), Paragraph("<b>PASSED</b>", body_style)],
        [Paragraph("7. Reentrancy", body_style), Paragraph("Malicious attack contract attempting recursive drain is blocked.", body_style), Paragraph("<b>PASSED</b>", body_style)],
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

    story.append(Paragraph("<b>Top 4 Viva Questions & Exact Answers:</b>", h2_style))

    story.append(Paragraph("<b>Q1: Why did you use Ethereum Sepolia instead of Mainnet?</b>", body_style))
    story.append(Paragraph("<i>Answer:</i> Sepolia is the official Ethereum Proof-of-Stake testnet. It mimics Ethereum Mainnet exactly (EVM, gas mechanics, consensus), but uses testnet ETH with zero financial cost, making it safe for educational development and live demonstrations.", body_style))

    story.append(Paragraph("<b>Q2: What is a Reentrancy attack and how did you prevent it?</b>", body_style))
    story.append(Paragraph("<i>Answer:</i> A reentrancy attack occurs when an external contract calls back into the withdraw function before the first execution updates the user's balance, draining the vault. We prevent this using two layers: the <b>Checks-Effects-Interactions (CEI)</b> pattern and OpenZeppelin's <b>ReentrancyGuard</b> (<code>nonReentrant</code>).", body_style))

    story.append(Paragraph("<b>Q3: What happens if the website frontend crashes? Can users still get their money?</b>", body_style))
    story.append(Paragraph("<i>Answer:</i> Yes, 100%! The money is held by the smart contract on the Ethereum blockchain, not by the website server. Any user can open Sepolia Etherscan, connect MetaMask, and call <code>withdraw()</code> directly on the smart contract to get their funds.", body_style))

    story.append(Paragraph("<b>Q4: Does the contract owner have a secret backdoor to withdraw user funds?</b>", body_style))
    story.append(Paragraph("<i>Answer:</i> No. There is intentionally no <code>onlyOwner</code> withdrawal function, pause lever, or admin role. The contract is completely self-custodial and trustless.", body_style))

    # =========================================================================
    # PAGE 7: HOW TO RUN & CONCLUSION
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("7. How to Run the Project (Cheat Sheet)", h1_style))
    story.append(Paragraph(
        "Here are the exact terminal commands to install, test, and run VAULTX on any machine:",
        body_style
    ))

    run_commands = """# 1. Clone repository from GitHub
git clone https://github.com/Hassaan1805/vaultX.git
cd vaultX

# 2. Install dependencies for smart contracts and frontend
npm --prefix contracts install
npm --prefix frontend install

# 3. Run smart contract unit tests (Verifies all 12 security tests)
npm --prefix contracts test

# 4. Start the frontend development server
npm run dev
# -> Open your browser at http://localhost:3000

# 5. (Optional) Re-deploy to Sepolia with your own wallet
# Put your PRIVATE_KEY in .env, then run:
npm --prefix contracts run deploy:sepolia"""
    story.append(create_code_box(run_commands, code_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("8. Summary & Conclusion", h1_style))
    story.append(Paragraph(
        "VAULTX proves that a decentralized application can combine high-security cryptographic guarantees with an ultra-clean, intuitive user experience. "
        "By enforcing <b>Checks-Effects-Interactions</b>, employing <b>OpenZeppelin's ReentrancyGuard</b>, building an <b>editorial fintech UI</b> with Tailwind CSS, "
        "and implementing <b>dual-source balance detection</b>, the project bridges the gap between complex blockchain mechanics and accessible, real-world finance. "
        "It stands as a complete, working computer engineering final-year blockchain project.",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_pdf()
