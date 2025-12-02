import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const SUPPORTED_CHAINS: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  80001: "Mumbai Testnet",
  31337: "Localhost",
};

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(
    null
  );
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!account;

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected! Please install MetaMask.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);

    try {
      const web3Provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );

      const accounts = await web3Provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) throw new Error("No accounts found");

      const signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);

      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error(error);
      if (error.code === 4001) toast.error("User rejected connection");
      else toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    toast.info("Wallet disconnected");
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return toast.error("MetaMask not detected");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        toast.error("Network not added to MetaMask.");
      } else toast.error("Failed to switch network");
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else setAccount(accounts[0]);
    };

    const handleChainChanged = (chainIdHex: string) => {
      const id = parseInt(chainIdHex, 16);
      setChainId(id);
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // auto-connect if wallet already connected
    window.ethereum.request({ method: "eth_accounts" }).then((accs: any) => {
      if (accs.length > 0) connectWallet();
    });

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context)
    throw new Error("useWeb3 must be used within a Web3Provider");
  return context;
}
