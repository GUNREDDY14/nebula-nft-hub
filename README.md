# NexusNFT Marketplace

A full-stack NFT marketplace built with Solidity, Hardhat, React, and TypeScript. Features include minting, buying, selling, auctioning, and transferring NFTs.

![NexusNFT Marketplace](https://img.shields.io/badge/NFT-Marketplace-teal)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- 🎨 **Mint NFTs** - Create unique NFTs with metadata stored on IPFS via Pinata
- 🛒 **Buy & Sell** - List NFTs for fixed-price sales
- ⚡ **Auctions** - Create timed auctions with bidding
- 🔄 **Transfer** - Send NFTs directly to any wallet
- 🦊 **MetaMask Integration** - Secure wallet connection
- 📱 **Responsive Design** - Works on desktop and mobile

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MetaMask Browser Extension** - [Install](https://metamask.io/download/)
- **Git** - [Download](https://git-scm.com/)

## Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Hardhat and Solidity dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Now edit the `.env` file and add your configuration:

```env
# Contract address (will be auto-generated after deployment)
VITE_CONTRACT_ADDRESS=

# Network to use: "localhost" or "sepolia" or "mumbai"
VITE_NETWORK=localhost

# Pinata IPFS Configuration (Required for minting)
# Get your keys from: https://app.pinata.cloud/keys
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key
# OR use JWT (recommended):
VITE_PINATA_JWT=your_pinata_jwt_token

# For testnet deployment (optional)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key
PRIVATE_KEY=your_wallet_private_key
```

### Step 4: Get Pinata API Keys

1. Go to [Pinata Cloud](https://app.pinata.cloud/)
2. Create a free account
3. Navigate to **API Keys** section
4. Click **New Key**
5. Enable all permissions and create the key
6. Copy the API Key and Secret to your `.env` file

### Step 5: Start Local Blockchain

Open a **new terminal window** and run:

```bash
npx hardhat node
```

Keep this terminal running! This starts a local Ethereum blockchain.

You'll see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

### Step 6: Deploy Smart Contract

In a **new terminal window**, run:

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

You should see:
```
Starting deployment...
Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
NFTMarketplace deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract address saved to: src/contracts/contract-address.json
```

The contract address is automatically saved to the frontend!

### Step 7: Configure MetaMask

1. Open MetaMask extension
2. Click on the network dropdown (top center)
3. Click **Add Network** → **Add a network manually**
4. Enter these details:
   - **Network Name**: Localhost 8545
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
5. Click **Save**

**Import Test Account (for local testing):**

1. In MetaMask, click on your account icon
2. Click **Import Account**
3. Paste one of the private keys from the Hardhat node output
4. Click **Import**

Now you have 10,000 test ETH!

### Step 8: Start the Frontend

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Usage Guide

### Connecting Wallet

1. Click **Connect Wallet** in the navbar
2. MetaMask will prompt you to connect
3. Approve the connection

### Minting an NFT

1. Navigate to **Mint** page
2. Upload an image (PNG, JPG, GIF, WEBP)
3. Enter a name and description
4. Add optional attributes
5. Click **Mint NFT**
6. Confirm the transaction in MetaMask
7. Wait for confirmation

### Listing an NFT for Sale

1. Go to **My NFTs** page
2. Find the NFT you want to sell
3. Click **List**
4. Enter the price in ETH
5. Confirm the transaction (includes listing fee)

### Buying an NFT

1. Browse the **Marketplace**
2. Click **Buy Now** on any NFT
3. Confirm the transaction in MetaMask

### Creating an Auction

1. Go to **My NFTs** page
2. Click **Auction** on your NFT
3. Set starting price and duration
4. Confirm the transaction

### Bidding on Auctions

1. Visit the **Auctions** page
2. Enter your bid amount (must be higher than current highest)
3. Click **Bid**
4. Confirm transaction

### Transferring an NFT

1. Go to **My NFTs**
2. Click **Send** on the NFT
3. Enter recipient wallet address
4. Confirm transaction

## Deploying to Testnet (Sepolia)

### Step 1: Get Testnet ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get free test ETH.

### Step 2: Get RPC URL

1. Create account at [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
2. Create a new app for Sepolia network
3. Copy the HTTPS URL

### Step 3: Update Environment

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
PRIVATE_KEY=your_metamask_private_key
VITE_NETWORK=sepolia
```

⚠️ **NEVER commit your private key to git!**

### Step 4: Deploy

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

### Step 5: Update Frontend

Add the deployed contract address to your `.env`:

```env
VITE_CONTRACT_ADDRESS=0x...your_deployed_address
```

## Project Structure

```
├── contracts/              # Solidity smart contracts
│   └── NFTMarketplace.sol  # Main marketplace contract
├── scripts/
│   └── deploy.cjs          # Deployment script
├── src/
│   ├── components/         # React components
│   │   ├── Navbar.tsx
│   │   ├── NFTCard.tsx
│   │   └── AuctionCard.tsx
│   ├── contexts/
│   │   └── Web3Context.tsx # Web3/MetaMask provider
│   ├── contracts/          # Contract ABIs and addresses
│   ├── lib/
│   │   ├── marketplace.ts  # Contract interaction functions
│   │   └── pinata.ts       # IPFS upload functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Mint.tsx
│   │   ├── Auctions.tsx
│   │   ├── MyNFTs.tsx
│   │   └── Settings.tsx
│   └── App.tsx
├── hardhat.config.cjs      # Hardhat configuration
├── .env.example            # Environment template
└── README.md
```

## Smart Contract Functions

| Function | Description |
|----------|-------------|
| `mintNFT(tokenURI)` | Mint a new NFT |
| `listItemForSale(tokenId, price)` | List NFT for fixed price |
| `buyItem(tokenId)` | Purchase listed NFT |
| `cancelListing(tokenId)` | Cancel your listing |
| `createAuction(tokenId, startingPrice, duration)` | Start auction |
| `placeBid(tokenId)` | Place bid on auction |
| `endAuction(tokenId)` | End expired auction |
| `transferNFT(to, tokenId)` | Transfer NFT to address |

## Troubleshooting

### "Contract address not found"
- Make sure you've deployed the contract: `npx hardhat run scripts/deploy.cjs --network localhost`
- Check that Hardhat node is running

### "MetaMask not detected"
- Install MetaMask extension
- Refresh the page

### "Transaction failed"
- Check you have enough ETH
- Make sure you're on the correct network
- Try increasing gas limit in MetaMask

### "Failed to upload to Pinata"
- Verify your Pinata API keys in `.env`
- Check Pinata dashboard for API key status
- Make sure you're using the correct format (API Key + Secret OR JWT)

### "Network mismatch"
- Switch to the correct network in MetaMask
- Use the network switcher in Settings page

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Development**: Hardhat, ethers.js
- **Storage**: Pinata IPFS
- **Wallet**: MetaMask

## License

MIT License - feel free to use this project for learning and building!

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console for error messages
3. Ensure all environment variables are set correctly
4. Verify MetaMask is connected to the right network

Happy Building! 🚀
