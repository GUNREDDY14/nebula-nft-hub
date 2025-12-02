import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { uploadToPinata, uploadMetadataToPinata, isPinataConfigured, getIPFSUrl } from '@/lib/pinata';
import { mintNFT, getMintingPrice } from '@/lib/marketplace';
import { toast } from 'sonner';
import { Loader2, Upload, Image, Sparkles, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

export default function Mint() {
  const { signer, provider, isConnected, connectWallet } = useWeb3();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const pinataConfigured = isPinataConfigured();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const addAttribute = () => setAttributes([...attributes, { trait_type: '', value: '' }]);
  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const updated = [...attributes]; updated[index][field] = value; setAttributes(updated);
  };
  const removeAttribute = (index: number) => setAttributes(attributes.filter((_, i) => i !== index));

  const handleMint = async () => {
    if (!isConnected) { toast.error('Please connect your wallet first'); return; }
    if (!signer || !provider) { toast.error('Wallet not properly connected'); return; }
    if (!file || !name) { toast.error('Please provide a name and image'); return; }
    if (!pinataConfigured) { toast.error('Pinata API keys not configured. Check Settings page.'); return; }
    try {
      setLoading(true);
      setStep('Uploading image to IPFS...');
      const imageUri = await uploadToPinata(file);
      toast.success('Image uploaded to IPFS');
      setStep('Uploading metadata to IPFS...');
      const metadata = { name, description, image: imageUri, attributes: attributes.filter(attr => attr.trait_type && attr.value) };
      const tokenURI = await uploadMetadataToPinata(metadata);
      toast.success('Metadata uploaded to IPFS');
      setStep('Minting NFT on blockchain...');
      const mintingPrice = await getMintingPrice(provider);
      toast.info(`Minting fee: ${ethers.formatEther(mintingPrice)} ETH`);
      const tokenId = await mintNFT(signer, tokenURI);
      toast.success(`NFT Minted! Token ID: ${tokenId?.toString()}`);
      setName(''); setDescription(''); setFile(null); setPreview(null); setAttributes([]);
      navigate('/my-nfts');
    } catch (error: unknown) {
      console.error('Minting failed:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to mint NFT');
    } finally { setLoading(false); setStep(''); }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Create NFT</h1>
          <p className="text-muted-foreground">Upload your artwork and mint it as an NFT on the blockchain</p>
        </div>
        {!pinataConfigured && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div><p className="font-medium text-destructive">Pinata API Keys Required</p><p className="text-sm text-muted-foreground">Please configure your Pinata API keys in the Settings page.</p></div>
            </CardContent>
          </Card>
        )}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-primary/30 shadow-[0_0_20px_hsl(174_72%_45%/0.2)]">
            <CardHeader><CardTitle>NFT Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="image">Image *</Label>
                <div className="mt-2">
                  <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
                    {preview ? <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" /> : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WEBP (Max 10MB)</p>
                      </div>
                    )}
                    <input id="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div><Label htmlFor="name">Name *</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter NFT name" className="mt-2" /></div>
              <div><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your NFT" rows={4} className="mt-2" /></div>
              <div>
                <div className="flex justify-between items-center mb-2"><Label>Attributes</Label><Button variant="ghost" size="sm" onClick={addAttribute}>+ Add Attribute</Button></div>
                <div className="space-y-2">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <Input placeholder="Trait type" value={attr.trait_type} onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)} className="flex-1" />
                      <Input placeholder="Value" value={attr.value} onChange={(e) => updateAttribute(index, 'value', e.target.value)} className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => removeAttribute(index)}>×</Button>
                    </div>
                  ))}
                </div>
              </div>
              {isConnected ? (
                <Button size="lg" className="w-full bg-gradient-to-r from-teal-500 to-teal-400" onClick={handleMint} disabled={loading || !file || !name || !pinataConfigured}>
                  {loading ? <><Loader2 className="h-5 w-5 animate-spin" />{step}</> : <><Sparkles className="h-5 w-5" />Mint NFT</>}
                </Button>
              ) : (
                <Button size="lg" className="w-full bg-primary shadow-[0_0_20px_hsl(174_72%_45%/0.5)]" onClick={connectWallet}>Connect Wallet to Mint</Button>
              )}
            </CardContent>
          </Card>
          <div>
            <Card className="sticky top-24 border-border/30 bg-gradient-to-br from-secondary/50 to-card">
              <div className="aspect-square overflow-hidden rounded-t-xl bg-secondary/30">
                {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Image className="h-16 w-16 text-muted-foreground/30" /></div>}
              </div>
              <CardContent className="p-4">
                <h3 className="font-display text-xl font-semibold">{name || 'Untitled NFT'}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{description || 'No description provided'}</p>
                {attributes.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{attributes.filter(a => a.trait_type && a.value).map((attr, i) => (<span key={i} className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary">{attr.trait_type}: {attr.value}</span>))}</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
