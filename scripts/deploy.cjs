const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");

  // Deploy NFTMarketplace
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  console.log("Deploying NFTMarketplace...");

  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed(); // <-- CORRECT for ethers v5

  const contractAddress = nftMarketplace.address; // <-- CORRECT for ethers v5
  console.log("NFTMarketplace deployed to:", contractAddress);

  // Save contract address and ABI to frontend
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save contract address
  const addressesPath = path.join(contractsDir, "contract-address.json");
  fs.writeFileSync(
    addressesPath,
    JSON.stringify({ NFTMarketplace: contractAddress }, null, 2)
  );
  console.log("Contract address saved to:", addressesPath);

  // Save ABI
  const artifact = await hre.artifacts.readArtifact("NFTMarketplace");
  const abiPath = path.join(contractsDir, "NFTMarketplace.json");
  fs.writeFileSync(
    abiPath,
    JSON.stringify({ abi: artifact.abi }, null, 2)
  );
  console.log("Contract ABI saved to:", abiPath);

  console.log("\n=== Deployment Complete ===");
  console.log("Contract Address:", contractAddress);
  console.log("\nNext steps:");
  console.log("1. Update VITE_CONTRACT_ADDRESS in your .env file");
  console.log("2. Start the frontend with: npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
