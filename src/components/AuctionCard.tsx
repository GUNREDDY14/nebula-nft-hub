import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ethers } from 'ethers';
import { getIPFSUrl } from '@/lib/pinata';
import { Loader2, Clock, Gavel } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getTokenURI } from '@/lib/marketplace';

interface NFTMetadata { name: string; description: string; image: string; }

interface AuctionCardProps {
  tokenId: number; seller: string; startingPrice: bigint; highestBid: bigint;
  highestBidder: string; endTime: bigint; onBid: (amount: string) => void;
  onEnd: () => void; loading?: boolean;
}

export function AuctionCard({ tokenId, seller, startingPrice, highestBid, highestBidder, endTime, onBid, onEnd, loading }: AuctionCardProps) {
  const { provider, account } = useWeb3();
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  const endTimeNumber = Number(endTime);
  const isEnded = Date.now() / 1000 >= endTimeNumber;
  const isSeller = account?.toLowerCase() === seller.toLowerCase();

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!provider) return;
      try {
        const uri = await getTokenURI(provider, tokenId);
        const url = getIPFSUrl(uri);
        const response = await fetch(url);
        const data = await response.json();
        setMetadata(data);
      } catch (error) { console.error('Failed to fetch metadata:', error); }
      finally { setIsLoading(false); }
    };
    fetchMetadata();
  }, [tokenId, provider]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTimeNumber - now;
      if (remaining <= 0) { setTimeLeft('Ended'); return; }
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      setTimeLeft(hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [endTimeNumber]);

  const imageUrl = metadata?.image ? getIPFSUrl(metadata.image) : '';
  const minBid = highestBid > 0n ? ethers.formatEther(highestBid + ethers.parseEther('0.001')) : ethers.formatEther(startingPrice);

  return (
    <Card className="overflow-hidden border-border/30 bg-gradient-to-br from-secondary/50 to-card">
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        {isLoading ? <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        : imageError || !imageUrl ? <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"><span className="font-display text-4xl text-primary/50">#{tokenId}</span></div>
        : <img src={imageUrl} alt={metadata?.name || `NFT #${tokenId}`} className="h-full w-full object-cover" onError={() => setImageError(true)} />}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2 ${isEnded ? 'bg-destructive/90' : 'bg-primary/90'}`}>
          <Clock className="h-3.5 w-3.5 text-primary-foreground" /><span className="text-sm font-medium text-primary-foreground">{timeLeft}</span>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-display text-lg font-semibold truncate">{metadata?.name || `NFT #${tokenId}`}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-muted-foreground">Starting Price</p><p className="font-semibold">{ethers.formatEther(startingPrice)} ETH</p></div>
          <div><p className="text-xs text-muted-foreground">Current Bid</p><p className="font-semibold text-gradient">{highestBid > 0n ? ethers.formatEther(highestBid) : '0'} ETH</p></div>
        </div>
        {highestBidder && highestBidder !== ethers.ZeroAddress && <p className="text-xs text-muted-foreground">Highest Bidder: {highestBidder.slice(0, 6)}...{highestBidder.slice(-4)}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex-col gap-3">
        {!isEnded && !isSeller && (
          <div className="flex w-full gap-2">
            <Input type="number" step="0.001" placeholder={`Min: ${minBid} ETH`} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="flex-1" />
            <Button className="bg-gradient-to-r from-teal-500 to-teal-400" onClick={() => onBid(bidAmount)} disabled={loading || !bidAmount}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}Bid
            </Button>
          </div>
        )}
        {isEnded && <Button className="w-full" onClick={onEnd} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}End Auction</Button>}
        {!isEnded && isSeller && <p className="text-sm text-muted-foreground text-center">Your auction is active</p>}
      </CardFooter>
    </Card>
  );
}
