import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("====================================================");
  console.log("  VAULTX - FinanceVault Deployment");
  console.log("====================================================");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Network:          ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log(`Deployer:         ${deployer.address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n && network.name !== "hardhat") {
    console.warn("WARNING: Deployer account has 0 ETH. Deployment will fail if gas is needed!");
  }

  console.log("\nDeploying FinanceVault...");
  const FinanceVaultFactory = await ethers.getContractFactory("FinanceVault");
  const vault = await FinanceVaultFactory.deploy();
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log(`\nSUCCESS: FinanceVault deployed at: ${vaultAddress}`);

  // Automatically export ABI and address for Frontend consumption
  const frontendConfigDir = path.resolve(__dirname, "../../frontend/src/lib");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/FinanceVault.sol/FinanceVault.json"
  );

  let abi = [];
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    abi = artifact.abi;
  }

  const exportData = {
    address: vaultAddress,
    network: network.name,
    chainId: network.config.chainId || 11155111,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    abi,
  };

  const exportFilePath = path.join(frontendConfigDir, "deployedContract.json");
  fs.writeFileSync(exportFilePath, JSON.stringify(exportData, null, 2));
  console.log(`Contract config exported to: ${exportFilePath}`);

  console.log("\n----------------------------------------------------");
  console.log("To verify this contract on Etherscan (Sepolia):");
  console.log(`npx hardhat verify --network sepolia ${vaultAddress}`);
  console.log("----------------------------------------------------\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
