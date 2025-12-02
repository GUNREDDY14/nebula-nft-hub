import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Wallet, Palette, Gavel, Send, ShoppingCart, Shield } from 'lucide-react';

export default function Index() {
  const features = [
    { icon: Palette, title: 'Mint NFTs', description: 'Create unique digital assets and upload to IPFS with Pinata integration.' },
    { icon: ShoppingCart, title: 'Buy & Sell', description: 'List your NFTs for sale or purchase from the marketplace.' },
    { icon: Gavel, title: 'Auctions', description: 'Create timed auctions and let bidders compete for your NFTs.' },
    { icon: Send, title: 'Transfer', description: 'Send NFTs directly to any wallet address instantly.' },
    { icon: Wallet, title: 'MetaMask', description: 'Connect seamlessly with MetaMask for secure transactions.' },
    { icon: Shield, title: 'Secure', description: 'Built on Ethereum with audited smart contracts.' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="text-gradient">GunreddyGudem</span><br />
              <span className="text-foreground">shopping arena</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
              Discover, create, and trade unique digital assets. Mint, buy, sell, auction, and transfer NFTs on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/marketplace">
                <Button className="bg-gradient-to-r from-teal-500 to-teal-400 text-primary-foreground shadow-lg hover:shadow-[0_4px_25px_hsl(174_72%_45%/0.5)] hover:scale-105 h-14 px-10 text-lg font-semibold rounded-xl">
                  Explore Marketplace <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/mint">
                <Button variant="outline" size="lg">Create NFT</Button>
              </Link>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[{ value: '10K+', label: 'NFTs Created' }, { value: '5K+', label: 'Artists' }, { value: '25K+', label: 'Transactions' }, { value: '500+', label: 'ETH Volume' }].map((stat, i) => (
              <Card key={i} className="p-6 text-center border-primary/30 shadow-[0_0_20px_hsl(174_72%_45%/0.2)]">
                <p className="font-display text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete NFT marketplace with all the features you need.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 group border-border/30 bg-gradient-to-br from-secondary/50 to-card hover:border-primary/50 hover:shadow-[0_8px_32px_hsl(174_72%_45%/0.2)] hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-br from-card to-background">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Connect your wallet and start exploring the world of NFTs today.</p>
              <Link to="/mint">
                <Button className="bg-primary text-primary-foreground shadow-[0_0_20px_hsl(174_72%_45%/0.5)] hover:shadow-[0_0_30px_hsl(174_72%_45%/0.7)] h-14 px-10 text-lg font-semibold rounded-xl">
                  Create Your First NFT <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground">N</span>
            </div>
            <span className="font-display font-bold">gunreddygudem</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 gunreddygudem. Built with Solidity & React.</p>
        </div>
      </footer>
    </div>
  );
}
