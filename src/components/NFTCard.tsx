import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';
import { getIPFSUrl } from '@/lib/pinata';
import { Loader2, ShoppingCart, Gavel, Send } from 'lucide-react';

interface NFTMetadata { name: string; description: string; image: string; }

interface NFTCardProps {
  tokenId: number; tokenURI: string; price?: bigint; seller?: string;
  isListed?: boolean; isOwned?: boolean; onBuy?: () => void;
  onList?: () => void; onAuction?: () => void; onTransfer?: () => void; loading?: boolean;
}

export function NFTCard({ tokenId, tokenURI, price, seller, isListed, isOwned, onBuy, onList, onAuction, onTransfer, loading }: NFTCardProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenURI) { setIsLoading(false); return; }
      try {
        const url = getIPFSUrl(tokenURI);
        const response = await fetch(url);
        const data = await response.json();
        setMetadata(data);
      } catch (error) { console.error('Failed to fetch metadata:', error); }
      finally { setIsLoading(false); }
    };
    fetchMetadata();
  }, [tokenURI]);

  const imageUrl = metadata?.image ? getIPFSUrl(metadata.image) : '';

  return (
    <Card className="overflow-hidden group border-border/30 bg-gradient-to-br from-secondary/50 to-card hover:border-primary/50 hover:shadow-[0_8px_32px_hsl(174_72%_45%/0.2)] hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : imageError || !imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="font-display text-4xl text-primary/50">#{tokenId}</span>
          </div>
        ) : (
          <img src={imageUrl} alt={metadata?.name || `NFT #${tokenId}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImageError(true)} />
        )}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/50">
          <span className="text-xs font-medium">#{tokenId}</span>
        </div>
        {isListed && <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-primary/90 backdrop-blur-sm"><span className="text-xs font-medium text-primary-foreground">For Sale</span></div>}
      </div>
      <CardContent className="p-4">
        <h3 className="font-display text-lg font-semibold truncate">{metadata?.name || `NFT #${tokenId}`}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{metadata?.description || 'No description available'}</p>
        {price && price > 0n && (<div className="mt-3 flex items-baseline gap-1"><span className="text-2xl font-bold text-gradient">{ethers.formatEther(price)}</span><span className="text-sm text-muted-foreground">ETH</span></div>)}
        {seller && <p className="mt-2 text-xs text-muted-foreground">Seller: {seller.slice(0, 6)}...{seller.slice(-4)}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        {isListed && onBuy && (<Button className="flex-1 bg-gradient-to-r from-teal-500 to-teal-400" onClick={onBuy} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}Buy Now</Button>)}
        {isOwned && !isListed && (<>
          {onList && <Button variant="default" size="sm" onClick={onList} disabled={loading}><ShoppingCart className="h-3 w-3" />List</Button>}
          {onAuction && <Button variant="outline" size="sm" onClick={onAuction} disabled={loading}><Gavel className="h-3 w-3" />Auction</Button>}
          {onTransfer && <Button variant="ghost" size="sm" onClick={onTransfer} disabled={loading}><Send className="h-3 w-3" />Send</Button>}
        </>)}
      </CardFooter>
    </Card>
  );
}
