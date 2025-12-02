import { ethers } from 'ethers';
import NFTMarketplaceABI from '@/contracts/NFTMarketplace.json';
import contractAddress from '@/contracts/contract-address.json';

export interface MarketItem {
  tokenId: bigint;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
  isListed: boolean;
}

export interface Auction {
  tokenId: bigint;
  seller: string;
  startingPrice: bigint;
  highestBid: bigint;
  highestBidder: string;
  endTime: bigint;
  active: boolean;
  ended: boolean;
}

// -----------------------------
// Helpers: Convert BigNumber → bigint
// -----------------------------
const toBigIntItem = (item: any): MarketItem => ({
  tokenId: BigInt(item.tokenId.toString()),
  seller: item.seller,
  owner: item.owner,
  price: BigInt(item.price.toString()),
  sold: item.sold,
  isListed: item.isListed,
});

const toBigIntAuction = (a: any): Auction => ({
  tokenId: BigInt(a.tokenId.toString()),
  seller: a.seller,
  startingPrice: BigInt(a.startingPrice.toString()),
  highestBid: BigInt(a.highestBid.toString()),
  highestBidder: a.highestBidder,
  endTime: BigInt(a.endTime.toString()),
  active: a.active,
  ended: a.ended,
});

// -----------------------------
// Contract Helpers
// -----------------------------
export const getContractAddress = (): string => {
  const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddress) return envAddress;
  return contractAddress?.NFTMarketplace || '';
};

export const getContract = (
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const address = getContractAddress();
  if (!address) {
    throw new Error('Contract address not found. Please deploy the contract first.');
  }
  return new ethers.Contract(address, NFTMarketplaceABI.abi, signerOrProvider);
};

export const getReadOnlyContract = (provider: ethers.providers.Provider) =>
  getContract(provider);

export const getSignerContract = (signer: ethers.Signer) =>
  getContract(signer);

// -----------------------------
// Minting
// -----------------------------
export const mintNFT = async (signer: ethers.Signer, tokenURI: string) => {
  const contract = getSignerContract(signer);
  const mintingPrice: ethers.BigNumber = await contract.getMintingPrice();

  const tx = await contract.mintNFT(tokenURI, { value: mintingPrice });
  const receipt = await tx.wait();

  // Extract tokenId from Transfer event
  const transferEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'Transfer';
    } catch {
      return false;
    }
  });

  if (transferEvent) {
    const parsed = contract.interface.parseLog(transferEvent);
    return parsed?.args[2]; // tokenId
  }

  return null;
};

// -----------------------------
// Listing
// -----------------------------
export const listItem = async (
  signer: ethers.Signer,
  tokenId: number,
  price: string
) => {
  const contract = getSignerContract(signer);
  const listingPrice: ethers.BigNumber = await contract.getListingPrice();
  const priceInWei = ethers.utils.parseEther(price);

  const tx = await contract.listItemForSale(tokenId, priceInWei, {
    value: listingPrice,
  });
  return tx.wait();
};

// -----------------------------
// Buying
// -----------------------------
export const buyItem = async (
  signer: ethers.Signer,
  tokenId: number,
  price: bigint
) => {
  const contract = getSignerContract(signer);

  const tx = await contract.buyItem(tokenId, {
    value: ethers.BigNumber.from(price.toString()),
  });

  return tx.wait();
};

// -----------------------------
// Cancel Listing
// -----------------------------
export const cancelListing = async (signer: ethers.Signer, tokenId: number) => {
  const contract = getSignerContract(signer);
  const tx = await contract.cancelListing(tokenId);
  return tx.wait();
};

// -----------------------------
// Auctions
// -----------------------------
export const createAuction = async (
  signer: ethers.Signer,
  tokenId: number,
  startingPrice: string,
  duration: number
) => {
  const contract = getSignerContract(signer);
  const priceInWei = ethers.utils.parseEther(startingPrice);

  const tx = await contract.createAuction(tokenId, priceInWei, duration);
  return tx.wait();
};

export const placeBid = async (
  signer: ethers.Signer,
  tokenId: number,
  bidAmount: string
) => {
  const contract = getSignerContract(signer);
  const bidInWei = ethers.utils.parseEther(bidAmount);

  const tx = await contract.placeBid(tokenId, { value: bidInWei });
  return tx.wait();
};

export const endAuction = async (signer: ethers.Signer, tokenId: number) => {
  const contract = getSignerContract(signer);
  const tx = await contract.endAuction(tokenId);
  return tx.wait();
};

// -----------------------------
// Transfer
// -----------------------------
export const transferNFT = async (
  signer: ethers.Signer,
  to: string,
  tokenId: number
) => {
  const contract = getSignerContract(signer);
  const tx = await contract.transferNFT(to, tokenId);
  return tx.wait();
};

// -----------------------------
// Fetch Functions (AUTOMATIC BIGINT FIX)
// -----------------------------
export const fetchMarketItems = async (
  provider: ethers.providers.Provider
): Promise<MarketItem[]> => {
  const contract = getReadOnlyContract(provider);
  const items = await contract.fetchMarketItems();
  return items.map(toBigIntItem);
};

export const fetchMyNFTs = async (
  signer: ethers.Signer
): Promise<MarketItem[]> => {
  const contract = getSignerContract(signer);
  const items = await contract.fetchMyNFTs();
  return items.map(toBigIntItem);
};

export const fetchItemsListed = async (
  signer: ethers.Signer
): Promise<MarketItem[]> => {
  const contract = getSignerContract(signer);
  const items = await contract.fetchItemsListed();
  return items.map(toBigIntItem);
};

export const fetchActiveAuctions = async (
  provider: ethers.providers.Provider
): Promise<Auction[]> => {
  const contract = getReadOnlyContract(provider);
  const items = await contract.fetchActiveAuctions();
  return items.map(toBigIntAuction);
};

export const getMarketItem = async (
  provider: ethers.providers.Provider,
  tokenId: number
): Promise<MarketItem> => {
  const contract = getReadOnlyContract(provider);
  return toBigIntItem(await contract.getMarketItem(tokenId));
};

export const getAuction = async (
  provider: ethers.providers.Provider,
  tokenId: number
): Promise<Auction> => {
  const contract = getReadOnlyContract(provider);
  return toBigIntAuction(await contract.getAuction(tokenId));
};

// -----------------------------
// Token URI + Prices
// -----------------------------
export const getTokenURI = async (
  provider: ethers.providers.Provider,
  tokenId: number
): Promise<string> => {
  const contract = getReadOnlyContract(provider);
  return contract.tokenURI(tokenId);
};

export const getListingPrice = async (
  provider: ethers.providers.Provider
): Promise<bigint> => {
  const contract = getReadOnlyContract(provider);
  return BigInt((await contract.getListingPrice()).toString());
};

export const getMintingPrice = async (
  provider: ethers.providers.Provider
): Promise<bigint> => {
  const contract = getReadOnlyContract(provider);
  return BigInt((await contract.getMintingPrice()).toString());
};
