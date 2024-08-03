'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Tip() {
  const pathname = usePathname();
  const walletAddress = pathname.split('/').pop();
  const [address, setAddress] = useState(walletAddress || '');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvedEnsName, setResolvedEnsName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const returnIfOxAddress = (address: string) => {
    if (address && address.startsWith('0x') && address.length === 42) {
      return address;
    }
    return undefined;
  }
  
  const returnIfEnsName = (address: string) => {
    if (address && !address.startsWith('0x')) {
      return address;
    }
    return undefined;
  }

  const OxAddress = returnIfOxAddress(address) || returnIfOxAddress(resolvedAddress);

  const startConnect = () => {
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log('Connected account:', accounts[0]);
      window.location.href = `/tip/${accounts[0]}`;
    })
    .catch(error => {
      console.error('User rejected account access', error);
    });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-cover bg-center" style={{ backgroundImage: `url(${avatarUrl})` }}>
      <h1>Lets get to your tip screen</h1>
      <div className="relative z-10 flex flex-col items-start p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-2xl">
        
        <button 
          className="p-2 bg-blue-500 text-white rounded-md w-full mb-4"
          onClick={startConnect}>Click here to connect your wallet and get to your tip screen
        </button>
        <button
          className="p-2 bg-green-500 text-white rounded-md w-full"
          onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
        >
          Need a wallet? Get one here!
        </button>

      </div>
      <ToastContainer />
    </main>
  );
}
