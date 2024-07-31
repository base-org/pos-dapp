'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GeneratePaymentLink } from '../util';

export default function Payment() {
  const searchParams = useSearchParams();
  const address = searchParams.get('address') || '';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const tip1 = parseFloat(searchParams.get('tip1') || '0');
  const tip2 = parseFloat(searchParams.get('tip2') || '0');
  const tip3 = parseFloat(searchParams.get('tip3') || '0');
  const [customTip, setCustomTip] = useState(0);
  const [activeTip, setActiveTip] = useState(0);

  const handlePayment = () => {
    const total = amount + activeTip;
    console.log(`Payment triggered! Total amount: ${formatCurrency(total)}`);

    const eip681Uri = GeneratePaymentLink(amount, address);
    console.log('EIP-681 URI:', eip681Uri);

    window.location.href = eip681Uri;
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

  const total = amount + activeTip;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Payment Information</h1>
        <div className="mb-4 w-full">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">To:</span>
            <span>{address}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Amount:</span>
            <span>{formatCurrency(amount)}</span>
          </div>
          <div className="font-semibold mb-2">Add a tip:</div>
          <div className="flex justify-between mb-2">
            <div className="flex space-x-2 w-full">
              {tip1 > 0 && (
                <button
                  className={`flex items-center justify-center p-2 rounded-md w-1/3 ${activeTip === tip1 ? 'bg-blue-500 text-white border border-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
                  onClick={() => handleTipClick(tip1)}
                >
                  <span>{formatCurrency(tip1)}</span>
                </button>
              )}
              {tip2 > 0 && (
                <button
                  className={`flex items-center justify-center p-2 rounded-md w-1/3 ${activeTip === tip2 ? 'bg-blue-500 text-white border border-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
                  onClick={() => handleTipClick(tip2)}
                >
                  <span>{formatCurrency(tip2)}</span>
                </button>
              )}
              {tip3 > 0 && (
                <button
                  className={`flex items-center justify-center p-2 rounded-md w-1/3 ${activeTip === tip3 ? 'bg-blue-500 text-white border border-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}`}
                  onClick={() => handleTipClick(tip3)}
                >
                  <span>{formatCurrency(tip3)}</span>
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
      </div>
    </main>
  );
}
