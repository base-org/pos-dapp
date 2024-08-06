'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Client } from '@xmtp/xmtp-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { copyToClipboard } from '../util';


export default function XMTPForChatbot() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [xmtpKeys, setXmtpKeys] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
          }
        })
        .catch((error: any) => {
          console.error('Error fetching accounts', error);
        });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      } catch (error) {
        console.error('User rejected account access', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    } else {
      toast.error('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const connectXMTP = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      //const xmtp = await Client.create(signer, { env: 'production' });
      
      const keys:Uint8Array = await Client.getKeys(signer, { env: 'production' });
      console.log(keys);

      for (const k in window.localStorage) {
        if (k.startsWith("xmtp:production:keys")) {
          console.log(k);
        }
      }

      // Convert Uint8Array to a binary string
      const binaryString = new TextDecoder().decode(keys);

      const base64String = Buffer.from(binaryString).toString('base64');

      setXmtpKeys(base64String);
    } catch (error) {
      console.error('Failed to connect to XMTP', error);
      toast.error('Failed to connect to XMTP. Please try again.');
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-cover bg-center">
      <div className="relative z-10 flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">XMTP for Chatbot</h1>
        <p className="text-sm text-gray-500 mb-4">
          Connect your wallet and retrieve your XMTP production keys.
        </p>

        {!isWalletConnected ? (
          <button
            className="p-2 bg-blue-500 text-white rounded-md w-full mb-4"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : (
          <button
            className="p-2 bg-green-500 text-white rounded-md w-full mb-4"
            onClick={connectXMTP}
          >
            Connect to XMTP
          </button>
        )}

        {xmtpKeys && (
          <div className="bg-red-900 p-4 rounded-md mt-4">
            <h2 className="text-xl font-semibold mb-2">Warning!</h2>
            <p>
              Be careful with sharing this key with anyone! Giving this key to anyone will let them access and send your messages on XMTP!
            </p>
            <textarea
              className="w-full h-40 mt-4 p-2 border border-gray-300 rounded-md bg-red-900"
              readOnly
              value={xmtpKeys}
              onClick={() => copyToClipboard(xmtpKeys, toast)}
            />
          </div>
        )}
      </div>
      <ToastContainer />

      <style jsx>{`
        main {
          background-image: url('/path/to/your/background.jpg');
          background-size: cover;
          background-position: center;
        }
      `}</style>
    </main>
  );
}
