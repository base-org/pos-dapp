'use client';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Footer from './component/footer';
import { GeneratePaymentLink } from './util';
import QRCodeFooter from './component/qrCode';
import { useEnsResolver } from './hooks/useEnsResolver';
import { useTipHandler } from './hooks/useTipHandler';
import TipInput from './component/tipInput';
import { useWallet } from './hooks/useWallet';
import { useRouter } from 'next/navigation';

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

  const createPaymentLink = async () => {
    const createUuidRes = await fetch(`${process.env.NEXT_PUBLIC_NFC_RELAYER_URL}/api/paymentTxParams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        payloadType: 'eip681',
        toAddress: resolvedAddress,
        value: amount,
        chainId: '8453',
        contractAddress: resolvedAddress,
      }),
    });
    const { uuid } = await createUuidRes.json() as { uuid: string };
    router.push(`/tip/${resolvedAddress}?baseAmount=${amount}&uuid=${uuid}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
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
          onClick={createPaymentLink}
        >
          Accept Tip
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
      <ToastContainer />
    </main>
  );
}
