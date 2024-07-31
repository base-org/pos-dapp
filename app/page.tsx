'use client';
import { useState, useEffect, useRef, LegacyRef } from 'react';
import QRCode from 'qrcode';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Footer from './component/footer';
import { GeneratePaymentLink } from './util';
import QRCodeFooter from './component/qrCode';

export default function Home({ searchParams }: { searchParams: any }) {
  const [address, setAddress] = useState(searchParams.address || '');
  const [amount, setAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [error, setError] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tippingEnabled, setTippingEnabled] = useState(searchParams.tip1 || searchParams.tip2 || searchParams.tip3 ? true : false);
  const [tipAmounts, setTipAmounts] = useState([searchParams.tip1 || 1, searchParams.tip2 || 2, searchParams.tip3 || 3]);

  useEffect(() => {
    if (address) {
      const timeoutId = setTimeout(async () => {
        const url = `https://api.wallet.coinbase.com/rpc/v2/getPublicProfileByDomain?userDomain=${address}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log('ENS -> 0x lookup:', data);
        if (data && data.result && data.result.address) {
          console.log('Resolved Address:', data.result.address);
          setResolvedAddress(data.result.address);
          const { subdomainProfile, ensDomainProfile } = data.result;
          const profileToUse = ensDomainProfile || subdomainProfile;
          if (profileToUse && profileToUse.profileTextRecords.avatar) {
            setAvatarUrl(profileToUse.profileTextRecords.avatar);
          }
          else {
            setAvatarUrl('');
          }
        } else {
          if (address.startsWith('0x')) {
            const url = `https://api.wallet.coinbase.com/rpc/v2/getPublicProfileByAddress?queryAddress=${address}`;
            const response = await fetch(url);
            const data = await response.json();
            const { subdomainProfile, ensDomainProfile } = data.result;
            const profileToUse = data.result.primaryDomainType === 'cbid' ? subdomainProfile : ensDomainProfile;
            if (profileToUse && profileToUse.name) {
              console.log('0x -> ENS lookup:', profileToUse.name);
              setResolvedAddress(profileToUse.name);
              const textRecords = profileToUse.profileTextRecords;
              if (textRecords && textRecords.avatar) {
                setAvatarUrl(textRecords.avatar);
              }
              else {
                setAvatarUrl('');
              }
            } else {
              console.log('0x -> ENS lookup:', data.result);
              setResolvedAddress(address);
            }
          } else {
            setResolvedAddress(address);
          }
        }
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [address]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('address', address);
    queryParams.set('amount', amount);
    queryParams.set('tip1', tipAmounts[0].toString());
    queryParams.set('tip2', tipAmounts[1].toString());
    queryParams.set('tip3', tipAmounts[2].toString());
    const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [address, amount, tipAmounts]);

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
        ? parseFloat(amount) + tipAmounts.reduce((acc, tip) => acc + parseFloat(tip), 0)
        : parseFloat(amount);
      const paymentUrl = tippingEnabled
        ? `${window.location.origin}/payment?address=${resolvedAddress}&amount=${totalAmount}&tip1=${tipAmounts[0]}&tip2=${tipAmounts[1]}&tip3=${tipAmounts[2]}`
        : eip681Uri;

      const url = await QRCode.toDataURL(eip681Uri);
      setQrCodeUrl(paymentUrl);
      setQrCodeData(url);
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code');
    }
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Text copied to clipboard!');
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleTipChange = (index: number, value: string) => {
    const newTipAmounts = [...tipAmounts];
    newTipAmounts[index] = parseFloat(value) || 0;
    setTipAmounts(newTipAmounts);
    setQrCodeUrl('');
    setQrCodeData('');
  };

  const handleTippingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTippingEnabled(e.target.checked);
    setQrCodeUrl('');
    setQrCodeData('');
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Request Payment</h1>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Enter the recipient address and the amount to <br />generate a QR code to get paid in USDC on base.<br />
          EIP-681 QR Code Generator
        </p>

        <input
          type="text"
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
          placeholder="To Address"
          value={address}
          onChange={handleAddressChange}
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
        />
        <div>
          <input
            type="checkbox"
            className="mb-4 p-2 mr-2"
            checked={tippingEnabled}
            onChange={handleTippingToggle}
          />
          <label>Enable Tipping</label>
        </div>
        {tippingEnabled && (
          <div className="mb-4 w-full">
            <input
              type="number"
              className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
              value={tipAmounts[0]}
              onChange={(e) => handleTipChange(0, e.target.value)}
              placeholder="Enter tip amount 1"
            />
            <input
              type="number"
              className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
              value={tipAmounts[1]}
              onChange={(e) => handleTipChange(1, e.target.value)}
              placeholder="Enter tip amount 2"
            />
            <input
              type="number"
              className="mb-2 p-2 border border-gray-300 rounded-md w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
              value={tipAmounts[2]}
              onChange={(e) => handleTipChange(2, e.target.value)}
              placeholder="Enter tip amount 3"
            />
          </div>
        )}
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          onClick={generateQrCode}
        >
          Generate QR Code
        </button>
        {qrCodeUrl && (
          <QRCodeFooter qrCodeData={qrCodeData} copyToClipboard={copyToClipboard} qrCodeUrl={qrCodeUrl} />
        )}
      </div>
      <Footer />
      <ToastContainer />
    </main>
  );
}