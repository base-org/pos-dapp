'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import { useEnsResolver } from '../hooks/useEnsResolver';
import { GeneratePaymentLink } from '../util';
import QRCode from 'qrcode';

import 'react-toastify/dist/ReactToastify.css';
import QRCodeFooter from '../component/qrCode';

// users arriving on this page should already be on their target device, so we don't need to ever show a QR code here

export default function Payment() {
  const searchParams = useSearchParams();
  const addressParam = searchParams.get('address') || '';
  const amountParam = parseFloat(searchParams.get('amount') || '0');
  const tip1Param = parseFloat(searchParams.get('tip1') || '0');
  const tip2Param = parseFloat(searchParams.get('tip2') || '0');
  const tip3Param = parseFloat(searchParams.get('tip3') || '0');
  const [customTip, setCustomTip] = useState(0);
  const [activeTip, setActiveTip] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');

  const { resolvedAddress, avatarUrl } = useEnsResolver(addressParam);

  const handlePayment = () => {
    try {
      const total = amountParam + activeTip;
      console.log(`Payment triggered! Total amount: ${formatCurrency(total)}`);

      const bestGuessAt0xAddress = addressParam && addressParam.startsWith('0x') && addressParam.length == 42 ? addressParam : (resolvedAddress || addressParam);
      const eip681Uri = GeneratePaymentLink(total, bestGuessAt0xAddress);
      console.log('EIP-681 URI:', eip681Uri);

      window.location.href = eip681Uri;
      setTimeout(async function(){
        if(confirm('It looks like this computer doesn\'t know how to handle EIP-681 links.  Would you like to see a QR Code to scan with your phone?')) {
          setShowQRCode(true);
          setQrCodeUrl(eip681Uri);
          const url = await QRCode.toDataURL(eip681Uri);
          setQrCodeData(url);
        }
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again on your target device.');
    }
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value >= 0) {
      setCustomTip(value);
      setActiveTip(value);
    } else {
      setCustomTip(0);
      setActiveTip(0);
    }
  };

  const handleTipClick = (tip: number) => {
    setActiveTip(tip);
    setCustomTip(0); // Reset custom tip when a predefined tip is selected
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const total = amountParam + activeTip;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Payment Information</h1>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="rounded-full w-24 h-24 mb-4"
          />
        )}
        {addressParam && (
          <div className="flex justify-between mb-2">
            <span>{addressParam}</span>
          </div>
        )}

        <div className="mb-4 w-full">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">To:</span>
            <span>{resolvedAddress}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Amount:</span>
            <span>{formatCurrency(amountParam)}</span>
          </div>
          <div className="font-semibold mb-2">Add a tip:</div>
          <div className="flex justify-between mb-2">
            <div className="flex space-x-2 w-full">
              {tip1Param > 0 && (
                <button
                  className={`flex items-center justify-center p-2 rounded-md w-1/3 ${activeTip === tip1Param ? 'bg-blue-500 text-white border border-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
                  onClick={() => handleTipClick(tip1Param)}
                >
                  <span>{formatCurrency(tip1Param)}</span>
                </button>
              )}
              {tip2Param > 0 && (
                <button
                  className={`flex items-center justify-center p-2 rounded-md w-1/3 ${activeTip === tip2Param ? 'bg-blue-500 text-white border border-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
                  onClick={() => handleTipClick(tip2Param)}
                >
                  <span>{formatCurrency(tip2Param)}</span>
                </button>
              )}
              {tip3Param > 0 && (
                <button
                  className={`flex items-center justify-center p-2 rounded-md w-1/3 ${activeTip === tip3Param ? 'bg-blue-500 text-white border border-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
                  onClick={() => handleTipClick(tip3Param)}
                >
                  <span>{formatCurrency(tip3Param)}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col mb-2">
            <label className="font-semibold mb-1">Custom Tip:</label>
            <input
              type="number"
              className="p-2 border border-gray-300 rounded-md bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
              value={customTip}
              onChange={handleCustomTipChange}
              placeholder="Enter custom tip amount"
              min="0"
            />
          </div>
        </div>
        <button
          className="p-2 bg-blue-500 text-white rounded-md w-full"
          onClick={handlePayment}
        >
          Pay {formatCurrency(total)}
        </button>
        {showQRCode && (
          <QRCodeFooter
            qrCodeData={qrCodeData}
            qrCodeUrl={qrCodeUrl} />
        )}
      </div>
      <ToastContainer />
    </main>
  );
}
