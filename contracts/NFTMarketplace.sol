// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    uint256 private _itemsSold;

    uint256 public listingPrice = 0.0025 ether;
    uint256 public mintingPrice = 0.001 ether;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool isListed;
    }

    struct Auction {
        uint256 tokenId;
        address payable seller;
        uint256 startingPrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool active;
        bool ended;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => Auction) private idToAuction;

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event AuctionCreated(
        uint256 indexed tokenId,
        address seller,
        uint256 startingPrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed tokenId,
        address bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed tokenId,
        address winner,
        uint256 amount
    );

    event NFTTransferred(
        uint256 indexed tokenId,
        address from,
        address to
    );

    constructor() ERC721("NexusNFT", "NNFT") Ownable(msg.sender) {}

    function updateListingPrice(uint256 _listingPrice) public onlyOwner {
        listingPrice = _listingPrice;
    }

    function updateMintingPrice(uint256 _mintingPrice) public onlyOwner {
        mintingPrice = _mintingPrice;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getMintingPrice() public view returns (uint256) {
        return mintingPrice;
    }

    // Mint a new NFT
    function mintNFT(string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintingPrice, "Price must be at least minting price");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        idToMarketItem[newTokenId] = MarketItem(
            newTokenId,
            payable(address(0)),
            payable(msg.sender),
            0,
            false,
            false
        );

        return newTokenId;
    }

    // List NFT for sale
    function listItemForSale(uint256 tokenId, uint256 price) public payable nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Only owner can list item");
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Must pay listing fee");
        require(!idToAuction[tokenId].active, "Item is in auction");

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false,
            true
        );

        _transfer(msg.sender, address(this), tokenId);

        emit MarketItemCreated(tokenId, msg.sender, address(this), price, false);
    }

    // Buy NFT
    function buyItem(uint256 tokenId) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.isListed, "Item not listed for sale");
        require(!item.sold, "Item already sold");
        require(msg.value == item.price, "Please submit the asking price");

        address payable seller = item.seller;
        
        item.owner = payable(msg.sender);
        item.sold = true;
        item.isListed = false;
        item.seller = payable(address(0));
        _itemsSold++;

        _transfer(address(this), msg.sender, tokenId);
        
        payable(owner()).transfer(listingPrice);
        seller.transfer(msg.value);

        emit MarketItemSold(tokenId, seller, msg.sender, item.price);
    }

    // Cancel listing
    function cancelListing(uint256 tokenId) public nonReentrant {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.seller == msg.sender, "Only seller can cancel");
        require(item.isListed, "Item not listed");
        require(!item.sold, "Item already sold");

        item.isListed = false;
        item.owner = payable(msg.sender);
        item.seller = payable(address(0));
        item.price = 0;

        _transfer(address(this), msg.sender, tokenId);
    }

    // Create auction
    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Only owner can create auction");
        require(!idToMarketItem[tokenId].isListed, "Item is listed for sale");
        require(!idToAuction[tokenId].active, "Auction already active");
        require(duration >= 1 hours, "Duration must be at least 1 hour");
        require(duration <= 7 days, "Duration must be at most 7 days");

        uint256 endTime = block.timestamp + duration;

        idToAuction[tokenId] = Auction(
            tokenId,
            payable(msg.sender),
            startingPrice,
            0,
            payable(address(0)),
            endTime,
            true,
            false
        );

        _transfer(msg.sender, address(this), tokenId);

        emit AuctionCreated(tokenId, msg.sender, startingPrice, endTime);
    }

    // Place bid
    function placeBid(uint256 tokenId) public payable nonReentrant {
        Auction storage auction = idToAuction[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest");
        require(msg.value >= auction.startingPrice, "Bid must be at least starting price");

        if (auction.highestBidder != address(0)) {
            // Refund previous highest bidder
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    // End auction
    function endAuction(uint256 tokenId) public nonReentrant {
        Auction storage auction = idToAuction[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        require(!auction.ended, "Auction already ended");

        auction.active = false;
        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Transfer NFT to winner
            _transfer(address(this), auction.highestBidder, tokenId);
            // Transfer funds to seller
            auction.seller.transfer(auction.highestBid);

            idToMarketItem[tokenId].owner = auction.highestBidder;

            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        } else {
            // No bids, return NFT to seller
            _transfer(address(this), auction.seller, tokenId);
            
            emit AuctionEnded(tokenId, auction.seller, 0);
        }
    }

    // Transfer NFT
    function transferNFT(address to, uint256 tokenId) public nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Only owner can transfer");
        require(!idToMarketItem[tokenId].isListed, "Cannot transfer listed item");
        require(!idToAuction[tokenId].active, "Cannot transfer item in auction");
        require(to != address(0), "Cannot transfer to zero address");

        _transfer(msg.sender, to, tokenId);

        idToMarketItem[tokenId].owner = payable(to);

        emit NFTTransferred(tokenId, msg.sender, to);
    }

    // Fetch all listed market items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].isListed && !idToMarketItem[i].sold) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].isListed && !idToMarketItem[i].sold) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }

        return items;
    }

    // Fetch NFTs owned by user
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender && !idToMarketItem[i].isListed) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender && !idToMarketItem[i].isListed) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }

        return items;
    }

    // Fetch NFTs listed by user
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender && idToMarketItem[i].isListed) {
                itemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender && idToMarketItem[i].isListed) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }

        return items;
    }

    // Fetch active auctions
    function fetchActiveAuctions() public view returns (Auction[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 auctionCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToAuction[i].active && !idToAuction[i].ended) {
                auctionCount++;
            }
        }

        Auction[] memory auctions = new Auction[](auctionCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToAuction[i].active && !idToAuction[i].ended) {
                auctions[currentIndex] = idToAuction[i];
                currentIndex++;
            }
        }

        return auctions;
    }

    // Get single item
    function getMarketItem(uint256 tokenId) public view returns (MarketItem memory) {
        return idToMarketItem[tokenId];
    }

    // Get auction details
    function getAuction(uint256 tokenId) public view returns (Auction memory) {
        return idToAuction[tokenId];
    }

    // Get total minted
    function getTotalMinted() public view returns (uint256) {
        return _tokenIds;
    }

    // Withdraw contract balance (owner only)
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
}
