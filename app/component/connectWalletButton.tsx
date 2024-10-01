import React, { useState } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';

const ConnectWalletButton = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  const APP_NAME = 'Your App Name';
  const APP_LOGO_URL = 'https://example.com/logo.png';  // Replace with your logo URL
  const DEFAULT_ETH_JSONRPC_URL = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';  // Replace with your Infura project ID
  const DEFAULT_CHAIN_ID = 1; // Mainnet chain ID

  const connectWallet = async () => {
    try {
      // Initialize Coinbase Wallet SDK
      const wallet = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
      });

      const preference = {
        appName: 'SDK Playground',
        appChainIds: [8453],
        options: 'all' as const,
      }

      const ethereum = wallet.makeWeb3Provider(preference);

      // Request accounts from wallet
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        setConnected(true);
        setAddress(accounts[0]);

        // Optionally, you can set up a provider using ethers.js
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log('Signer:', signer);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
      {connected ? `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connect Wallet'}
    </button>
  );
};

export default ConnectWalletButton;
