'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEnsResolver } from '../../hooks/useEnsResolver';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GeneratePaymentLink } from '@/app/util';
import { useWallet } from '@/app/hooks/useWallet';

export default function Tip() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const walletAddress = pathname.split('/').pop();
  const [address, setAddress] = useState(walletAddress || '');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvedEnsName, setResolvedEnsName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [copyText, setCopyText] = useState('Copy this URL');
  
  const baseAmount = parseFloat(searchParams.get('baseAmount') || '0');
  const totalAmount = useMemo(() => baseAmount + tipAmount, [baseAmount, tipAmount]);

  const fixedTips = [1, 3, 5];
  const { provider, isConnected, connectWallet } = useWallet();
  const { resolvedAddress: ensResolvedAddress, avatarUrl: ensAvatarUrl, needsProvider } = useEnsResolver(address, provider);

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

  useEffect(() => {
    if (returnIfOxAddress(address)) {
      if (ensResolvedAddress) {
        setResolvedEnsName(ensResolvedAddress);
        setResolvedAddress(address);
        setAvatarUrl(ensAvatarUrl);
        const currentSearchParams = new URLSearchParams(window.location.search);
        router.replace(`${pathname}?${currentSearchParams.toString()}`);
      }
    } else {
      setResolvedEnsName(address);
      setResolvedAddress(ensResolvedAddress);
      setAvatarUrl(ensAvatarUrl);
    }
  }, [address, ensResolvedAddress, ensAvatarUrl, router]);

  const handleTipClick = (amount: number) => {
    if (amount === tipAmount) {
      setTipAmount(0);
      return;
    }
    setTipAmount(amount);
  };

  const handleTransaction = () => {
    console.log(`Transaction of ${totalAmount} USDC to ${OxAddress} ${resolvedAddress}`);
    if (!OxAddress) {
      toast.error('Invalid address');
      return;
    }

    const eip681Uri = GeneratePaymentLink(totalAmount, resolvedAddress);
    console.log('EIP-681 URI:', eip681Uri);

    window.location.href = eip681Uri;
    setTimeout(async function () {
      if (confirm('It looks like this device doesn\'t know how to handle EIP-681 links.  Would you like to get a wallet?')) {
        window.location.href = `https://go.cb-w.com/dapp?cb_url=${window.location.origin}/tip/${OxAddress}`;
      }
    }, 1000);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-cover bg-center" style={{ backgroundImage: `url(${avatarUrl})` }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex flex-col items-start p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-2xl">
        <div className="flex items-center mb-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="rounded-full w-24 h-24 mr-4"
            />
          )}
          <div>
            <h1 className="text-lg font-bold">{resolvedEnsName}</h1>
            {address !== resolvedAddress && <p className="text-sm text-gray-500">{resolvedAddress}</p>}
          </div>
        </div>
        {!isConnected && needsProvider && !avatarUrl && (
          <button
            onClick={connectWallet}
            className="mb-4 p-2 bg-blue-500 text-white rounded-md"
            disabled={isConnected}
          >
            Connect Wallet to Load Avatar
          </button>
        )}
        <div className="mb-4 font-bold text-xl">
          Total: {totalAmount.toLocaleString([], { style: "currency", currency: "usd" })}
        </div>
        <p className="text-sm text-gray-500 mb-4">Select an amount to tip:</p>
        <div className="flex justify-around mb-4 w-full">
          {fixedTips.map((tip) => (
            <button
              key={tip}
              className={`p-2 m-1 rounded-md w-1/3 ${tipAmount === tip ? 'bg-blue-500 text-white border' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
              onClick={() => handleTipClick(tip)}
            >
              ${tip}
            </button>
          ))}
        </div>
        <label className="mb-1 dark:bg-gray-800 text-black dark:text-gray-500">Custom Tip:</label>
        <input
          type="number"
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          placeholder="Custom tip amount"
          value={tipAmount}
          onChange={(e) => setTipAmount(parseFloat(e.target.value))}
          min="0"
        />
        <textarea
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          placeholder="Enter a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          onClick={handleTransaction}
        >
          Send Tip
        </button>
        <button
          className="p-2 bg-blue-500 text-gray-300 rounded-md w-full mb-4"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopyText('Copied!');
          }}>{copyText}
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
