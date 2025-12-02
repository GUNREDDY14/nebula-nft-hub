import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { NFTCard } from '@/components/NFTCard';
import { fetchMarketItems, buyItem, getTokenURI, MarketItem } from '@/lib/marketplace';
import { toast } from 'sonner';
import { Loader2, ShoppingBag } from 'lucide-react';

interface NFTWithURI extends MarketItem {
  tokenURI: string;
}

export default function Marketplace() {
  const { provider, signer, isConnected } = useWeb3();
  const [nfts, setNfts] = useState<NFTWithURI[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);

  const loadMarketItems = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      const items = await fetchMarketItems(provider);
      
      const itemsWithURI = await Promise.all(
        items.map(async (item) => {
          const tokenURI = await getTokenURI(provider, Number(item.tokenId));
          return { ...item, tokenURI };
        })
      );

      setNfts(itemsWithURI);
    } catch (error: any) {
      console.error('Failed to load market items:', error);
      if (!error.message?.includes('Contract address not found')) {
        toast.error('Failed to load marketplace items');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketItems();
  }, [provider]);

  const handleBuy = async (tokenId: number, price: bigint) => {
    if (!signer) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setBuying(tokenId);
      await buyItem(signer, tokenId, price);
      toast.success('NFT purchased successfully!');
      await loadMarketItems();
    } catch (error: any) {
      console.error('Failed to buy NFT:', error);
      toast.error(error.reason || 'Failed to purchase NFT');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and buy NFTs from other creators
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No NFTs Listed</h3>
            <p className="text-muted-foreground max-w-md">
              The marketplace is empty. Be the first to list an NFT for sale!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NFTCard
                key={Number(nft.tokenId)}
                tokenId={Number(nft.tokenId)}
                tokenURI={nft.tokenURI}
                price={nft.price}
                seller={nft.seller}
                isListed={true}
                onBuy={() => handleBuy(Number(nft.tokenId), nft.price)}
                loading={buying === Number(nft.tokenId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
