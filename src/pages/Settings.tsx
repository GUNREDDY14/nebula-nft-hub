import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isPinataConfigured } from '@/lib/pinata';
import { getContractAddress } from '@/lib/marketplace';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Key, Globe, Wallet, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';

export default function Settings() {
  const { account, chainId, isConnected, switchNetwork } = useWeb3();
  const [pinataStatus, setPinataStatus] = useState(false);
  const [contractAddress, setContractAddress] = useState('');

  useEffect(() => {
    setPinataStatus(isPinataConfigured());
    try {
      setContractAddress(getContractAddress());
    } catch {
      setContractAddress('');
    }
  }, []);

  const networks = [
    { id: 31337, name: 'Localhost (Hardhat)', color: 'bg-yellow-500' },
    { id: 11155111, name: 'Sepolia Testnet', color: 'bg-blue-500' },
    { id: 80001, name: 'Mumbai Testnet', color: 'bg-purple-500' },
    { id: 1, name: 'Ethereum Mainnet', color: 'bg-green-500' },
  ];

  const currentNetwork = networks.find(n => n.id === chainId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your NFT marketplace settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Wallet Status */}
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet Status
              </CardTitle>
              <CardDescription>
                Your connected wallet and network information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Connection Status</p>
                  <p className="font-medium flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        Not Connected
                      </>
                    )}
                  </p>
                </div>
              </div>

              {isConnected && account && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Address</p>
                    <p className="font-mono text-sm">{account}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(account)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {currentNetwork && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Network</p>
                    <p className="font-medium flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${currentNetwork.color}`} />
                      {currentNetwork.name}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Switch Network</p>
                <div className="flex flex-wrap gap-2">
                  {networks.map((network) => (
                    <Button
                      key={network.id}
                      variant={chainId === network.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchNetwork(network.id)}
                    >
                      <span className={`h-2 w-2 rounded-full ${network.color} mr-2`} />
                      {network.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Address */}
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Smart Contract
              </CardTitle>
              <CardDescription>
                NFT Marketplace contract address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Address</p>
                  <p className="font-mono text-sm">
                    {contractAddress || 'Not deployed yet'}
                  </p>
                </div>
                {contractAddress && (
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(contractAddress)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Set via <code className="px-1 py-0.5 bg-secondary rounded">VITE_CONTRACT_ADDRESS</code> in .env or auto-generated after deployment
              </p>
            </CardContent>
          </Card>

          {/* Pinata Configuration */}
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Pinata IPFS Configuration
              </CardTitle>
              <CardDescription>
                API keys for uploading files to IPFS via Pinata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Configuration Status</p>
                  <p className="font-medium flex items-center gap-2">
                    {pinataStatus ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Configured
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        Not Configured
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card">
                <h4 className="font-medium mb-3">Required Environment Variables</h4>
                <div className="space-y-2 font-mono text-sm">
                  <p><code className="px-1 py-0.5 bg-secondary rounded">VITE_PINATA_API_KEY</code></p>
                  <p><code className="px-1 py-0.5 bg-secondary rounded">VITE_PINATA_SECRET_API_KEY</code></p>
                  <p>Or use JWT:</p>
                  <p><code className="px-1 py-0.5 bg-secondary rounded">VITE_PINATA_JWT</code></p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href="https://app.pinata.cloud/keys" target="_blank" rel="noopener noreferrer">
                    Get Pinata API Keys
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>Copy <code className="px-1 py-0.5 bg-secondary rounded">.env.example</code> to <code className="px-1 py-0.5 bg-secondary rounded">.env</code></li>
                <li>Get Pinata API keys from <a href="https://app.pinata.cloud/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Pinata Dashboard</a></li>
                <li>Add your Pinata keys to the <code className="px-1 py-0.5 bg-secondary rounded">.env</code> file</li>
                <li>Deploy the smart contract using <code className="px-1 py-0.5 bg-secondary rounded">npx hardhat run scripts/deploy.cjs --network localhost</code></li>
                <li>The contract address will be auto-saved or set it manually in <code className="px-1 py-0.5 bg-secondary rounded">.env</code></li>
                <li>Connect MetaMask to the appropriate network</li>
                <li>Start minting and trading NFTs!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
