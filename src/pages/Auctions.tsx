import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { AuctionCard } from '@/components/AuctionCard';
import { fetchActiveAuctions, placeBid, endAuction, Auction } from '@/lib/marketplace';
import { toast } from 'sonner';
import { Loader2, Gavel } from 'lucide-react';

export default function Auctions() {
  const { provider, signer, isConnected } = useWeb3();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadAuctions = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      const items = await fetchActiveAuctions(provider);
      setAuctions(items);
    } catch (error: any) {
      console.error('Failed to load auctions:', error);
      if (!error.message?.includes('Contract address not found')) {
        toast.error('Failed to load auctions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, [provider]);

  const handleBid = async (tokenId: number, amount: string) => {
    if (!signer) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    try {
      setActionLoading(tokenId);
      await placeBid(signer, tokenId, amount);
      toast.success('Bid placed successfully!');
      await loadAuctions();
    } catch (error: any) {
      console.error('Failed to place bid:', error);
      toast.error(error.reason || 'Failed to place bid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndAuction = async (tokenId: number) => {
    if (!signer) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setActionLoading(tokenId);
      await endAuction(signer, tokenId);
      toast.success('Auction ended successfully!');
      await loadAuctions();
    } catch (error: any) {
      console.error('Failed to end auction:', error);
      toast.error(error.reason || 'Failed to end auction');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Live Auctions</h1>
          <p className="text-muted-foreground">
            Place bids on active NFT auctions
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading auctions...</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gavel className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Active Auctions</h3>
            <p className="text-muted-foreground max-w-md">
              There are no active auctions at the moment. Create one from your NFTs!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard
                key={Number(auction.tokenId)}
                tokenId={Number(auction.tokenId)}
                seller={auction.seller}
                startingPrice={auction.startingPrice}
                highestBid={auction.highestBid}
                highestBidder={auction.highestBidder}
                endTime={auction.endTime}
                onBid={(amount) => handleBid(Number(auction.tokenId), amount)}
                onEnd={() => handleEndAuction(Number(auction.tokenId))}
                loading={actionLoading === Number(auction.tokenId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
