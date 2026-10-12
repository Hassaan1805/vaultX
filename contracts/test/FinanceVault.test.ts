import { expect } from "chai";
import { ethers } from "hardhat";
import { FinanceVault, ReentrancyAttacker } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FinanceVault (VAULTX)", function () {
  let vault: FinanceVault;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let attackerUser: HardhatEthersSigner;

  const ONE_ETH = ethers.parseEther("1.0");
  const TWO_ETH = ethers.parseEther("2.0");
  const HALF_ETH = ethers.parseEther("0.5");

  beforeEach(async function () {
    [owner, user1, user2, attackerUser] = await ethers.getSigners();

    const FinanceVaultFactory = await ethers.getContractFactory("FinanceVault");
    vault = (await FinanceVaultFactory.deploy()) as FinanceVault;
    await vault.waitForDeployment();
  });

  describe("1. Deployment & Initial State", function () {
    it("should initialize with zero TVL and balances", async function () {
      expect(await vault.getContractBalance()).to.equal(0n);
      expect(await vault.getTotalDeposited()).to.equal(0n);
      expect(await vault.getTotalWithdrawn()).to.equal(0n);
      expect(await vault.getUserBalance(user1.address)).to.equal(0n);
    });
  });

  describe("2. Deposit Functionality", function () {
    it("should allow a user to deposit ETH and update balances correctly", async function () {
      const tx = await vault.connect(user1).deposit({ value: ONE_ETH });
      await expect(tx)
        .to.emit(vault, "Deposit")
        .withArgs(user1.address, ONE_ETH, (val: bigint) => val > 0n);

      expect(await vault.connect(user1).getMyBalance()).to.equal(ONE_ETH);
      expect(await vault.getUserBalance(user1.address)).to.equal(ONE_ETH);
      expect(await vault.getContractBalance()).to.equal(ONE_ETH);
      expect(await vault.getTotalDeposited()).to.equal(ONE_ETH);
      expect(await vault.userDeposited(user1.address)).to.equal(ONE_ETH);
    });

    it("should accumulate multiple deposits for the same user", async function () {
      await vault.connect(user1).deposit({ value: ONE_ETH });
      await vault.connect(user1).deposit({ value: TWO_ETH });

      const totalExpected = ethers.parseEther("3.0");
      expect(await vault.getUserBalance(user1.address)).to.equal(totalExpected);
      expect(await vault.userDeposited(user1.address)).to.equal(totalExpected);
      expect(await vault.getTotalDeposited()).to.equal(totalExpected);
    });

    it("should revert with ZeroAmount if deposit value is 0", async function () {
      await expect(vault.connect(user1).deposit({ value: 0n })).to.be.revertedWithCustomError(
        vault,
        "ZeroAmount"
      );
    });

    it("should accept direct ETH transfers via receive() fallback", async function () {
      const tx = await user1.sendTransaction({
        to: await vault.getAddress(),
        value: ONE_ETH,
      });
      await tx.wait();

      expect(await vault.getUserBalance(user1.address)).to.equal(ONE_ETH);
      expect(await vault.getContractBalance()).to.equal(ONE_ETH);
    });
  });

  describe("3. Withdrawal Functionality", function () {
    beforeEach(async function () {
      await vault.connect(user1).deposit({ value: TWO_ETH });
    });

    it("should allow a user to partially withdraw their funds", async function () {
      const initialWalletBal = await ethers.provider.getBalance(user1.address);

      const tx = await vault.connect(user1).withdraw(HALF_ETH);
      const receipt = await tx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(vault, "Withdrawal")
        .withArgs(user1.address, HALF_ETH, (val: bigint) => val > 0n);

      expect(await vault.getUserBalance(user1.address)).to.equal(ethers.parseEther("1.5"));
      expect(await vault.getContractBalance()).to.equal(ethers.parseEther("1.5"));
      expect(await vault.userWithdrawn(user1.address)).to.equal(HALF_ETH);
      expect(await vault.getTotalWithdrawn()).to.equal(HALF_ETH);

      const finalWalletBal = await ethers.provider.getBalance(user1.address);
      expect(finalWalletBal).to.equal(initialWalletBal + HALF_ETH - gasSpent);
    });

    it("should allow a user to withdraw their entire balance", async function () {
      await vault.connect(user1).withdraw(TWO_ETH);
      expect(await vault.getUserBalance(user1.address)).to.equal(0n);
      expect(await vault.getContractBalance()).to.equal(0n);
      expect(await vault.userWithdrawn(user1.address)).to.equal(TWO_ETH);
    });

    it("should revert with ZeroAmount when attempting to withdraw 0 ETH", async function () {
      await expect(vault.connect(user1).withdraw(0n)).to.be.revertedWithCustomError(
        vault,
        "ZeroAmount"
      );
    });

    it("should revert with InsufficientBalance when requested amount exceeds user balance", async function () {
      const excessAmount = ethers.parseEther("2.5");
      await expect(vault.connect(user1).withdraw(excessAmount))
        .to.be.revertedWithCustomError(vault, "InsufficientBalance")
        .withArgs(excessAmount, TWO_ETH);
    });
  });

  describe("4. Multi-User Isolation & Security", function () {
    it("should guarantee that User A cannot withdraw User B funds", async function () {
      // User1 deposits 1 ETH, User2 deposits 5 ETH -> Total TVL = 6 ETH
      await vault.connect(user1).deposit({ value: ONE_ETH });
      await vault.connect(user2).deposit({ value: ethers.parseEther("5.0") });

      expect(await vault.getContractBalance()).to.equal(ethers.parseEther("6.0"));

      // User1 tries to withdraw 2 ETH (exceeds their 1 ETH balance, even though contract holds 6 ETH)
      await expect(
        vault.connect(user1).withdraw(TWO_ETH)
      ).to.be.revertedWithCustomError(vault, "InsufficientBalance");

      // User2 withdraws 5 ETH successfully
      await vault.connect(user2).withdraw(ethers.parseEther("5.0"));
      expect(await vault.getUserBalance(user2.address)).to.equal(0n);

      // User1's 1 ETH remains completely safe and withdrawable
      expect(await vault.getUserBalance(user1.address)).to.equal(ONE_ETH);
      await vault.connect(user1).withdraw(ONE_ETH);
      expect(await vault.getUserBalance(user1.address)).to.equal(0n);
      expect(await vault.getContractBalance()).to.equal(0n);
    });

    it("should return correct account stats via getUserStats", async function () {
      await vault.connect(user1).deposit({ value: TWO_ETH });
      await vault.connect(user1).withdraw(HALF_ETH);

      const [currentBalance, depositedTotal, withdrawnTotal] = await vault.getUserStats(
        user1.address
      );

      expect(currentBalance).to.equal(ethers.parseEther("1.5"));
      expect(depositedTotal).to.equal(TWO_ETH);
      expect(withdrawnTotal).to.equal(HALF_ETH);
    });
  });

  describe("5. Reentrancy Protection", function () {
    it("should defend against reentrancy attacks via ReentrancyGuard", async function () {
      // User1 provides liquidity
      await vault.connect(user1).deposit({ value: ethers.parseEther("5.0") });

      // Deploy Attacker contract
      const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = (await AttackerFactory.connect(attackerUser).deploy(
        await vault.getAddress()
      )) as ReentrancyAttacker;
      await attacker.waitForDeployment();

      // Attacker attempts reentrancy
      await expect(
        attacker.connect(attackerUser).initiateAttack({ value: ONE_ETH })
      ).to.be.reverted;

      // Contract funds remain intact (User1 funds not drained)
      expect(await vault.getUserBalance(user1.address)).to.equal(ethers.parseEther("5.0"));
      expect(await vault.getContractBalance()).to.equal(ethers.parseEther("5.0"));
    });
  });
});
