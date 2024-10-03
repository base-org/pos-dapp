import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const BASE_CHAIN_ID = '0x2105'; // Hexadecimal representation of 8453

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);

  useEffect(() => {
    const setupProvider = async () => {
      if (window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);
          
          await checkAndSwitchChain(browserProvider);
          
          const accounts = await browserProvider.send('eth_requestAccounts', []);
          
          if (accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error setting up provider:', error);
        }
      } else {
        console.error('No Ethereum provider found. Install MetaMask.');
      }
    };

    setupProvider();
  }, []);

  const checkAndSwitchChain = async (provider: ethers.BrowserProvider) => {
    try {
      const chainId = await provider.send('eth_chainId', []);
      if (chainId !== BASE_CHAIN_ID) {
        await switchToBaseChain(provider);
      }
      setIsCorrectChain(true);
    } catch (error) {
      console.error('Error checking or switching chain:', error);
      setIsCorrectChain(false);
    }
  };

  const switchToBaseChain = async (provider: ethers.BrowserProvider) => {
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: BASE_CHAIN_ID }]);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [{
            chainId: BASE_CHAIN_ID,
            chainName: 'Base',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]);
        } catch (addError) {
          console.error('Error adding the Base network:', addError);
        }
      } else {
        console.error('Error switching to the Base network:', switchError);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (provider) {
        await checkAndSwitchChain(provider);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const switchWallet = async () => {
    try {
      if (provider) {
        await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
        setIsConnected(false);
        setAccount(null);
        await checkAndSwitchChain(provider);
      }
    } catch (error) {
      console.error('Error switching wallet:', error);
    }
  }

  return {
    provider,
    isConnected,
    account,
    isCorrectChain,
    connectWallet,
    switchWallet,
  };
}