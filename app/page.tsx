'use client';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Footer from './component/footer';
import { GeneratePaymentLink } from './util';
import QRCodeFooter from './component/qrCode';
import { useEnsResolver } from './hooks/useEnsResolver';
import { useTipHandler } from './hooks/useTipHandler';
import TipInput from './component/tipInput';
import { useWallet } from './hooks/useWallet';
import { useRouter } from 'next/navigation';
import { type PaymentMethod } from '@/app/types/payments';
import { generateEip712Payload } from '@/app/utils';
import useRealtimeDb from './hooks/useRealtimeDb';
import { ethers } from 'ethers';
import Link from 'next/link';
import shortenAddress from './helpers/shortenAddress';

export default function Home({ searchParams }: { searchParams: any }) {
  const router = useRouter();
  const { provider, isConnected, account, connectWallet } = useWallet(); // Use the useWallet hook
  const [address, setAddress] = useState(searchParams.address || account || '');
  const [amount, setAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [error, setError] = useState('');

  const { resolvedAddress, avatarUrl, needsProvider } = useEnsResolver(address, provider); // Pass provider to useEnsResolver
  const initialTips = [searchParams.tip1 || 1, searchParams.tip2 || 2, searchParams.tip3 || 3];
  const initialPercentageTips = [searchParams.pct1 || 10, searchParams.pct2 || 15, searchParams.pct3 || 20];
  const initialPctMode = searchParams.usePct === 'true';
  const enableTips = searchParams.useTips === 'true';
  const { tippingEnabled, tipAmounts, percentageMode, percentageTips, handleTipChange, handleTippingToggle, handlePercentageToggle } = useTipHandler(enableTips, initialTips, initialPercentageTips, initialPctMode);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('address', address);
    queryParams.set('tip1', tipAmounts[0].toString());
    queryParams.set('tip2', tipAmounts[1].toString());
    queryParams.set('tip3', tipAmounts[2].toString());
    queryParams.set('pct1', percentageTips[0].toString());
    queryParams.set('pct2', percentageTips[1].toString());
    queryParams.set('pct3', percentageTips[2].toString());
    queryParams.set('usePct', percentageMode.toString());
    queryParams.set('useTips', tippingEnabled.toString());
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [address, tipAmounts, percentageTips, percentageMode, tippingEnabled]);

  const [uuid, setUuid] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const dbUpdates = useRealtimeDb({
    event: 'UPDATE',
    channel: 'ContactlessPaymentTxOrMsg',
    table: 'ContactlessPaymentTxOrMsg',
    filter: `uuid=eq.${uuid}`,
  });
  useEffect(() => {
    const lastUpdate = dbUpdates[dbUpdates.length - 1];
    if (lastUpdate?.txHash) {
      setTxHash(lastUpdate.txHash);
      toast("Transaction submitted!", { type: 'success' });
      const canVibrate = 'vibrate' in navigator || 'mozVibrate' in navigator;
      if (canVibrate) {
        navigator.vibrate([100, 30, 100, 30, 100]);
      }
      getTransactionReceipt(lastUpdate.txHash);
    }
  }, [dbUpdates]);

  async function getTransactionReceipt(txHash: string, maxAttempts = 20, intervalMs = 2000) {
    const provider = new ethers.BrowserProvider(window.ethereum);
  
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          toast.dismiss();
          toast("Transaction confirmed!", { type: 'success' });
          const canVibrate = 'vibrate' in navigator || 'mozVibrate' in navigator;
          if (canVibrate) {
            navigator.vibrate([100, 30, 100, 30, 100]);
          }
          return receipt;
        }
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error);
        // If it's the last attempt, throw the error
        if (attempt === maxAttempts) throw error;
      }
    }
  
    throw new Error(`Transaction receipt not found after ${maxAttempts} attempts`);
  }

  const generateQrCode = async () => {
    if (!resolvedAddress) {
      setError('Invalid address');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Invalid amount');
      return;
    }
    setError('');
    try {
      const eip681Uri = GeneratePaymentLink(parseFloat(amount), resolvedAddress);
      console.log('EIP-681 URI:', eip681Uri);

      const totalAmount = tippingEnabled
        ? parseFloat(amount) + (percentageMode
          ? percentageTips.reduce((acc, tip) => acc + parseFloat(amount) * (tip / 100), 0)
          : tipAmounts.reduce((acc, tip) => acc + tip, 0))
        : parseFloat(amount);
      const paymentUrl = tippingEnabled
        ? `${window.location.origin}/payment?address=${resolvedAddress}&amount=${amount}&totalAmount=${totalAmount}&tip1=${tipAmounts[0]}&tip2=${tipAmounts[1]}&tip3=${tipAmounts[2]}&pct1=${percentageTips[0]}&pct2=${percentageTips[1]}&pct3=${percentageTips[2]}&usePct=${percentageMode}&useTips=${tippingEnabled}`
        : eip681Uri;
      
      const url = await QRCode.toDataURL(eip681Uri);
      setQrCodeUrl(paymentUrl);
      setQrCodeData(url);
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setQrCodeUrl('');
    setQrCodeData('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setQrCodeUrl('');
    setQrCodeData('');
  };

  const createPaymentLink = async (txType: PaymentMethod) => {
    const body = txType === 'eip681' ? {
      payloadType: 'eip681',
      toAddress: resolvedAddress,
      value: amount,
      chainId: '8453',
      contractAddress: resolvedAddress,
    } : generateEip712Payload();

    const createUuidRes = await fetch(`${process.env.NEXT_PUBLIC_NFC_RELAYER_URL}/api/paymentTxParams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(body),
    });
    const { uuid } = await createUuidRes.json() as { uuid: string };

    if (txType === 'eip681') {
      router.push(`/tip/${resolvedAddress}?baseAmount=${amount}&uuid=${uuid}`);
    } else {
      setUuid(uuid);
      window.ethereum.request({
        method: 'requestContactlessPayment',
        params: [{
          type: 2,
          uri: `${process.env.NEXT_PUBLIC_NFC_RELAYER_URL as string}/api/paymentTxParams/${uuid}`
        }],
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-base-200">
      <div className="card bg-base-100 shadow-xl p-8">
        <div className="card-title mb-0">Check out</div>
        <div className="card-body p-4">
          <div className="prose max-w-xs text-xs">
            Enter the recipient address and the amount to
            generate a QR code to get paid in USDC on base.
          </div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Recipient</span>
            </div>
            <input 
              type="text" 
              placeholder="ENS or address" 
              className="input input-bordered input-lg w-full max-w-xs" 
              onChange={handleAddressChange} 
            />
            {address.length > 0 && (
              <div className="label">
                <span className="label-text-alt">
                  {shortenAddress(resolvedAddress || address)}
                </span>
              </div>
            )}
          </label>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Amount</span>
            </div>
            <input 
              type="text" 
              placeholder="" 
              className="input input-bordered input-lg w-full max-w-xs" 
              onChange={handleAmountChange}
            />
          </label>
          <Link
            href={`/checkout?address=${address}&baseAmount=${amount}`}
            className="btn btn-primary btn-lg mt-4"
          >
            Check out
          </Link>
        </div>
      </div>
      <div className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Request Payment</h1>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Enter the recipient address and the amount to <br />generate a QR code to get paid in USDC on base.<br />
          EIP-681 QR Code Generator
        </p>

        {!isConnected && needsProvider && (
          <button
            onClick={connectWallet}
            className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          >
            Connect Wallet to resolve Avatar NFT
          </button>
        )}

        <input
          type="text"
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          placeholder="To Address"
          value={address}
          onChange={handleAddressChange}
          disabled={!isConnected}
        />
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="rounded-full w-24 h-24 mb-4"
          />
        )}
        {resolvedAddress && resolvedAddress !== address && <p className="text-xs text-gray-500 mb-4">Resolved Address: {resolvedAddress}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <input
          type="number"
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          placeholder="Amount"
          value={amount}
          onChange={handleAmountChange}
          disabled={!isConnected}
        />
        <TipInput
          tippingEnabled={tippingEnabled}
          tipAmounts={tipAmounts}
          percentageMode={percentageMode}
          percentageTips={percentageTips}
          handleTipChange={handleTipChange}
          handleTippingToggle={handleTippingToggle}
          handlePercentageToggle={handlePercentageToggle}
        />
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          disabled={!isConnected}
          onClick={() => createPaymentLink('eip681')}
        >
          Accept Tip EIP681
        </button>
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          disabled={!isConnected}
          onClick={() => createPaymentLink('eip712')}
        >
          Accept Tip EIP712
        </button>
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          onClick={generateQrCode}
          disabled={!isConnected}
        >
          Generate QR Code
        </button>
        {qrCodeUrl && (
          <QRCodeFooter qrCodeData={qrCodeData} qrCodeUrl={qrCodeUrl} />
        )}
      </div>
      <Footer />
    </main>
  );
}