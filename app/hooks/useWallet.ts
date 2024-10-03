import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const setupProvider = async () => {
      if (window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);
          
          const accounts = await browserProvider.send('eth_requestAccounts', []);
          
          if (accounts.length > 0) {
            setIsConnected(true);
            setAccount(accounts[0]); // Store the connected account
          }
        } catch (error) {
          console.error('User denied account access:', error);
        }
      } else {
        console.error('No Ethereum provider found. Install MetaMask.');
      }
    };

    setupProvider();
  }, []);

  const connectWallet = async () => {
    try {
      if (provider) {
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]); // Store the connected account
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
      }
    } catch (error) {
      console.error('Error switching wallet:', error);
    }
  }

  return {
    provider,
    isConnected,
    account,
    connectWallet,
    switchWallet,
  };
}
