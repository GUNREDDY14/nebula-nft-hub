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

export const getContractAddress = (): string => {
  const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddress) return envAddress;
  return contractAddress?.NFTMarketplace || '';
};

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  const address = getContractAddress();
  if (!address) {
    throw new Error('Contract address not found. Please deploy the contract first.');
  }
  return new ethers.Contract(address, NFTMarketplaceABI.abi, signerOrProvider);
};

export const getReadOnlyContract = (provider: ethers.Provider) => {
  return getContract(provider);
};

export const getSignerContract = (signer: ethers.Signer) => {
  return getContract(signer);
};

// Minting
export const mintNFT = async (signer: ethers.Signer, tokenURI: string) => {
  const contract = getSignerContract(signer);
  const mintingPrice = await contract.getMintingPrice();
  const tx = await contract.mintNFT(tokenURI, { value: mintingPrice });
  const receipt = await tx.wait();
  
  // Get token ID from event
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

// Listing
export const listItem = async (
  signer: ethers.Signer,
  tokenId: number,
  price: string
) => {
  const contract = getSignerContract(signer);
  const listingPrice = await contract.getListingPrice();
  const priceInWei = ethers.parseEther(price);
  const tx = await contract.listItemForSale(tokenId, priceInWei, { value: listingPrice });
  return tx.wait();
};

// Buying
export const buyItem = async (
  signer: ethers.Signer,
  tokenId: number,
  price: bigint
) => {
  const contract = getSignerContract(signer);
  const tx = await contract.buyItem(tokenId, { value: price });
  return tx.wait();
};

// Cancel listing
export const cancelListing = async (signer: ethers.Signer, tokenId: number) => {
  const contract = getSignerContract(signer);
  const tx = await contract.cancelListing(tokenId);
  return tx.wait();
};

// Auction
export const createAuction = async (
  signer: ethers.Signer,
  tokenId: number,
  startingPrice: string,
  duration: number
) => {
  const contract = getSignerContract(signer);
  const priceInWei = ethers.parseEther(startingPrice);
  const tx = await contract.createAuction(tokenId, priceInWei, duration);
  return tx.wait();
};

export const placeBid = async (
  signer: ethers.Signer,
  tokenId: number,
  bidAmount: string
) => {
  const contract = getSignerContract(signer);
  const bidInWei = ethers.parseEther(bidAmount);
  const tx = await contract.placeBid(tokenId, { value: bidInWei });
  return tx.wait();
};

export const endAuction = async (signer: ethers.Signer, tokenId: number) => {
  const contract = getSignerContract(signer);
  const tx = await contract.endAuction(tokenId);
  return tx.wait();
};

// Transfer
export const transferNFT = async (
  signer: ethers.Signer,
  to: string,
  tokenId: number
) => {
  const contract = getSignerContract(signer);
  const tx = await contract.transferNFT(to, tokenId);
  return tx.wait();
};

// Fetch functions
export const fetchMarketItems = async (provider: ethers.Provider): Promise<MarketItem[]> => {
  const contract = getReadOnlyContract(provider);
  return contract.fetchMarketItems();
};

export const fetchMyNFTs = async (signer: ethers.Signer): Promise<MarketItem[]> => {
  const contract = getSignerContract(signer);
  return contract.fetchMyNFTs();
};

export const fetchItemsListed = async (signer: ethers.Signer): Promise<MarketItem[]> => {
  const contract = getSignerContract(signer);
  return contract.fetchItemsListed();
};

export const fetchActiveAuctions = async (provider: ethers.Provider): Promise<Auction[]> => {
  const contract = getReadOnlyContract(provider);
  return contract.fetchActiveAuctions();
};

export const getMarketItem = async (
  provider: ethers.Provider,
  tokenId: number
): Promise<MarketItem> => {
  const contract = getReadOnlyContract(provider);
  return contract.getMarketItem(tokenId);
};

export const getAuction = async (
  provider: ethers.Provider,
  tokenId: number
): Promise<Auction> => {
  const contract = getReadOnlyContract(provider);
  return contract.getAuction(tokenId);
};

export const getTokenURI = async (
  provider: ethers.Provider,
  tokenId: number
): Promise<string> => {
  const contract = getReadOnlyContract(provider);
  return contract.tokenURI(tokenId);
};

export const getListingPrice = async (provider: ethers.Provider): Promise<bigint> => {
  const contract = getReadOnlyContract(provider);
  return contract.getListingPrice();
};

export const getMintingPrice = async (provider: ethers.Provider): Promise<bigint> => {
  const contract = getReadOnlyContract(provider);
  return contract.getMintingPrice();
};
