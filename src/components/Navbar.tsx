import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/mint', label: 'Mint' },
  { href: '/auctions', label: 'Auctions' },
  { href: '/my-nfts', label: 'My NFTs' },
  { href: '/settings', label: 'Settings' },
];

export function Navbar() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground">N</span>
            </div>
            <span className="font-display text-xl font-bold text-gradient">NexusNFT</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === link.href ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}>{link.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">{formatAddress(account!)}</span>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>Disconnect</Button>
              </div>
            ) : (
              <Button onClick={connectWallet} disabled={isConnecting} className="bg-primary text-primary-foreground shadow-[0_0_20px_hsl(174_72%_45%/0.5)]">
                <Wallet className="h-4 w-4" />{isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
            <button className="md:hidden p-2 rounded-lg hover:bg-secondary/50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setIsMenuOpen(false)}
                  className={cn('px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === link.href ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}>{link.label}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
