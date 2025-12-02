import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { NFTCard } from '@/components/NFTCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchMyNFTs, fetchItemsListed, listItem, cancelListing, createAuction, transferNFT, getTokenURI, MarketItem } from '@/lib/marketplace';
import { toast } from 'sonner';
import { Loader2, Wallet, Image } from 'lucide-react';
import { ethers } from 'ethers';

interface NFTWithURI extends MarketItem { tokenURI: string; }

export default function MyNFTs() {
  const { provider, signer, account, isConnected, connectWallet } = useWeb3();
  const [ownedNFTs, setOwnedNFTs] = useState<NFTWithURI[]>([]);
  const [listedNFTs, setListedNFTs] = useState<NFTWithURI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'listed'>('owned');
  const [listDialog, setListDialog] = useState<{ open: boolean; tokenId: number | null }>({ open: false, tokenId: null });
  const [auctionDialog, setAuctionDialog] = useState<{ open: boolean; tokenId: number | null }>({ open: false, tokenId: null });
  const [transferDialog, setTransferDialog] = useState<{ open: boolean; tokenId: number | null }>({ open: false, tokenId: null });
  const [listPrice, setListPrice] = useState('');
  const [auctionPrice, setAuctionPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('24');
  const [transferAddress, setTransferAddress] = useState('');

  const loadNFTs = async () => {
    if (!signer || !provider) return;
    try {
      setLoading(true);
      const [owned, listed] = await Promise.all([fetchMyNFTs(signer), fetchItemsListed(signer)]);
      const ownedWithURI = await Promise.all(owned.map(async (item) => ({ ...item, tokenURI: await getTokenURI(provider, Number(item.tokenId)) })));
      const listedWithURI = await Promise.all(listed.map(async (item) => ({ ...item, tokenURI: await getTokenURI(provider, Number(item.tokenId)) })));
      setOwnedNFTs(ownedWithURI); setListedNFTs(listedWithURI);
    } catch (error: unknown) { console.error('Failed to load NFTs:', error); const err = error as { message?: string }; if (!err.message?.includes('Contract address not found')) toast.error('Failed to load your NFTs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isConnected && signer) loadNFTs(); }, [isConnected, signer, account]);

  const handleList = async () => {
    if (!signer || !listDialog.tokenId) return;
    if (!listPrice || parseFloat(listPrice) <= 0) { toast.error('Please enter a valid price'); return; }
    try { setActionLoading(listDialog.tokenId); await listItem(signer, listDialog.tokenId, listPrice); toast.success('NFT listed for sale!'); setListDialog({ open: false, tokenId: null }); setListPrice(''); await loadNFTs(); }
    catch (error: unknown) { const err = error as { reason?: string }; toast.error(err.reason || 'Failed to list NFT'); }
    finally { setActionLoading(null); }
  };

  const handleCancelListing = async (tokenId: number) => {
    if (!signer) return;
    try { setActionLoading(tokenId); await cancelListing(signer, tokenId); toast.success('Listing cancelled'); await loadNFTs(); }
    catch (error: unknown) { const err = error as { reason?: string }; toast.error(err.reason || 'Failed to cancel listing'); }
    finally { setActionLoading(null); }
  };

  const handleCreateAuction = async () => {
    if (!signer || !auctionDialog.tokenId) return;
    if (!auctionPrice || parseFloat(auctionPrice) <= 0) { toast.error('Please enter a valid starting price'); return; }
    try { setActionLoading(auctionDialog.tokenId); const duration = parseInt(auctionDuration) * 3600; await createAuction(signer, auctionDialog.tokenId, auctionPrice, duration); toast.success('Auction created successfully!'); setAuctionDialog({ open: false, tokenId: null }); setAuctionPrice(''); setAuctionDuration('24'); await loadNFTs(); }
    catch (error: unknown) { const err = error as { reason?: string }; toast.error(err.reason || 'Failed to create auction'); }
    finally { setActionLoading(null); }
  };

  const handleTransfer = async () => {
    if (!signer || !transferDialog.tokenId) return;
    if (!ethers.isAddress(transferAddress)) { toast.error('Please enter a valid wallet address'); return; }
    try { setActionLoading(transferDialog.tokenId); await transferNFT(signer, transferAddress, transferDialog.tokenId); toast.success('NFT transferred successfully!'); setTransferDialog({ open: false, tokenId: null }); setTransferAddress(''); await loadNFTs(); }
    catch (error: unknown) { const err = error as { reason?: string }; toast.error(err.reason || 'Failed to transfer NFT'); }
    finally { setActionLoading(null); }
  };

  if (!isConnected) return (
    <div className="min-h-screen pt-24 pb-12 px-4"><div className="container mx-auto"><div className="flex flex-col items-center justify-center py-20 text-center">
      <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" /><h3 className="font-display text-xl font-semibold mb-2">Connect Your Wallet</h3>
      <p className="text-muted-foreground max-w-md mb-6">Connect your wallet to view and manage your NFTs</p>
      <Button className="bg-primary shadow-[0_0_20px_hsl(174_72%_45%/0.5)]" onClick={connectWallet}>Connect Wallet</Button>
    </div></div></div>
  );

  const currentNFTs = activeTab === 'owned' ? ownedNFTs : listedNFTs;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8"><h1 className="font-display text-4xl font-bold mb-2">My NFTs</h1><p className="text-muted-foreground">Manage your NFT collection</p></div>
        <div className="flex gap-2 mb-8">
          <Button variant={activeTab === 'owned' ? 'default' : 'secondary'} onClick={() => setActiveTab('owned')}>Owned ({ownedNFTs.length})</Button>
          <Button variant={activeTab === 'listed' ? 'default' : 'secondary'} onClick={() => setActiveTab('listed')}>Listed ({listedNFTs.length})</Button>
        </div>
        {loading ? <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary mb-4" /><p className="text-muted-foreground">Loading your NFTs...</p></div>
        : currentNFTs.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><Image className="h-16 w-16 text-muted-foreground/50 mb-4" /><h3 className="font-display text-xl font-semibold mb-2">{activeTab === 'owned' ? 'No NFTs Owned' : 'No NFTs Listed'}</h3><p className="text-muted-foreground max-w-md">{activeTab === 'owned' ? "You don't own any NFTs yet. Mint or buy some!" : "You haven't listed any NFTs for sale."}</p></div>
        : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{currentNFTs.map((nft) => (
          <NFTCard key={Number(nft.tokenId)} tokenId={Number(nft.tokenId)} tokenURI={nft.tokenURI} price={nft.price} isOwned={activeTab === 'owned'} isListed={activeTab === 'listed'}
            onList={activeTab === 'owned' ? () => setListDialog({ open: true, tokenId: Number(nft.tokenId) }) : undefined}
            onAuction={activeTab === 'owned' ? () => setAuctionDialog({ open: true, tokenId: Number(nft.tokenId) }) : undefined}
            onTransfer={activeTab === 'owned' ? () => setTransferDialog({ open: true, tokenId: Number(nft.tokenId) }) : undefined}
            onBuy={activeTab === 'listed' ? () => handleCancelListing(Number(nft.tokenId)) : undefined}
            loading={actionLoading === Number(nft.tokenId)} />
        ))}</div>}
        <Dialog open={listDialog.open} onOpenChange={(open) => setListDialog({ open, tokenId: open ? listDialog.tokenId : null })}>
          <DialogContent><DialogHeader><DialogTitle>List NFT for Sale</DialogTitle><DialogDescription>Set a price for your NFT.</DialogDescription></DialogHeader>
            <div className="space-y-4"><div><Label htmlFor="price">Price (ETH)</Label><Input id="price" type="number" step="0.001" placeholder="0.1" value={listPrice} onChange={(e) => setListPrice(e.target.value)} className="mt-2" /></div>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-400" onClick={handleList} disabled={actionLoading !== null}>{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'List NFT'}</Button></div>
          </DialogContent>
        </Dialog>
        <Dialog open={auctionDialog.open} onOpenChange={(open) => setAuctionDialog({ open, tokenId: open ? auctionDialog.tokenId : null })}>
          <DialogContent><DialogHeader><DialogTitle>Create Auction</DialogTitle><DialogDescription>Set a starting price and duration.</DialogDescription></DialogHeader>
            <div className="space-y-4"><div><Label htmlFor="startingPrice">Starting Price (ETH)</Label><Input id="startingPrice" type="number" step="0.001" placeholder="0.1" value={auctionPrice} onChange={(e) => setAuctionPrice(e.target.value)} className="mt-2" /></div>
              <div><Label htmlFor="duration">Duration</Label><Select value={auctionDuration} onValueChange={setAuctionDuration}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 Hour</SelectItem><SelectItem value="6">6 Hours</SelectItem><SelectItem value="12">12 Hours</SelectItem><SelectItem value="24">24 Hours</SelectItem><SelectItem value="72">3 Days</SelectItem><SelectItem value="168">7 Days</SelectItem></SelectContent></Select></div>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-400" onClick={handleCreateAuction} disabled={actionLoading !== null}>{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Auction'}</Button></div>
          </DialogContent>
        </Dialog>
        <Dialog open={transferDialog.open} onOpenChange={(open) => setTransferDialog({ open, tokenId: open ? transferDialog.tokenId : null })}>
          <DialogContent><DialogHeader><DialogTitle>Transfer NFT</DialogTitle><DialogDescription>Send this NFT to another wallet.</DialogDescription></DialogHeader>
            <div className="space-y-4"><div><Label htmlFor="address">Recipient Address</Label><Input id="address" placeholder="0x..." value={transferAddress} onChange={(e) => setTransferAddress(e.target.value)} className="mt-2" /></div>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-400" onClick={handleTransfer} disabled={actionLoading !== null}>{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Transfer NFT'}</Button></div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
