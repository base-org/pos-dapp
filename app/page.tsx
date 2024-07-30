'use client';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { isValidAddress, ensLookup, copyToClipboard } from './utils'; // hypothetical utility functions
import Footer from './footer';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; 
const BASE_CHAIN_ID = 8453;

export default function Home({ searchParams }) {
  const [address, setAddress] = useState(searchParams.address || '');
  const [amount, setAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [error, setError] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (address) {
      const timeoutId = setTimeout(async () => {
        const result = await ensLookup(address);
        setResolvedAddress(result);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [address]);

  const generateQrCode = async () => {
    if (!isValidAddress(address) && !resolvedAddress) {
      setError('Invalid address');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Invalid amount');
      return;
    }
    setError('');
    try {
      const eip681Uri = `ethereum:${USDC_ADDRESS}@${BASE_CHAIN_ID}/transfer?value=${amount}e18&address=${resolvedAddress || address}`;
      console.log('EIP-681 URI:', eip681Uri);
      const url = await QRCode.toDataURL(eip681Uri);
      setQrCodeUrl(eip681Uri);
      setQrCodeData(url);
    } catch (err) {
      console.error(err);
      setError('Failed to generate QR code');
    }
  };

  const copyQrCodeImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      QRCode.toCanvas(canvas, qrCodeUrl, (error) => {
        if (error) console.error(error);
      });
      canvas.toBlob((blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          toast.success('QR Code image copied to clipboard!');
        }).catch((err) => {
          console.error('Could not copy image: ', err);
        });
      });
    }
    else {
      console.error('Canvas element not found');
    }
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
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-800 text-white"
          placeholder="To Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {false && resolvedAddress && <p className="text-xs text-gray-400">Resolved to: {resolvedAddress}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <input
          type="text"
          className="mb-4 p-2 border border-gray-300 rounded-md w-full bg-gray-800 text-white"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="mb-4 p-2 bg-blue-500 text-white rounded-md w-full"
          onClick={generateQrCode}
        >
          Generate QR Code
        </button>
        {qrCodeUrl && (
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold mb-2">QR Code:</h2>
            <img src={qrCodeData} alt="EIP-681 QR Code" className="border border-gray-300 rounded-md mb-2 mx-auto" />
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <div className="flex space-x-2 justify-center">
              <button
                className="p-2 bg-green-500 text-white rounded-md"
                onClick={() => copyToClipboard(qrCodeUrl)}
              >
                Copy QR Code URL
              </button>
              <button
                className="p-2 bg-green-500 text-white rounded-md"
                onClick={copyQrCodeImage}
              >
                Copy QR Code Image
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <ToastContainer />
    </main>
  );
}
