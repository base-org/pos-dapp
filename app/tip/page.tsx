'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEnsResolver } from '../hooks/useEnsResolver';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GeneratePaymentLink } from '@/app/util';
import { useWallet } from '@/app/hooks/useWallet';
import QRCode from 'qrcode';
import QRCodeFooter from '@/app/component/qrCode';

import useRealtimeDb from '@/app/hooks/useRealtimeDb';
import Link from 'next/link';
import { ArrowLeft02Icon, CheckmarkCircle02Icon, Loading02Icon, QrCodeIcon, SmartphoneWifiIcon } from 'hugeicons-react';
import shortenAddress from '../helpers/shortenAddress';
import { generateEip712Payload } from '../utils';
import { PaymentMethod } from '../types/payments';
import { ethers, isAddress } from 'ethers';
import { GradientAvatar } from '../component/gradientAvatar';

export default function Tip({ searchParams }: { searchParams: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const address = searchParams.address as string;
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [resolvedEnsName, setResolvedEnsName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uuid, setUuid] = useState('');
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);
  
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

  const baseAmount = parseFloat(searchParams.baseAmount || '0');
  const totalAmount = useMemo(() => {
    return baseAmount + tipAmount;
  }, [baseAmount, tipAmount]);

  const fixedTipType = baseAmount > 10 ? 'percent' : 'currency';
  const fixedTips = fixedTipType === 'percent' ? [.1, .15, .2] : [1, 3, 5];
  const isSelectedFixedTip = (i: number) => {
    if (fixedTipType === 'percent') {
      return tipAmount === baseAmount * fixedTips[i];
    }
    return tipAmount === fixedTips[i];
  }

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const { provider, isConnected, connectWallet } = useWallet();
  const { resolvedAddress: ensResolvedAddress, avatarUrl: ensAvatarUrl, needsProvider } = useEnsResolver(address, provider);

  const returnIfOxAddress = (address: string) => {
    if (address && address.startsWith('0x') && address.length === 42) {
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
    if (fixedTipType === 'percent') {
      amount = baseAmount * amount;
    }
    if (amount === tipAmount) {
      amount = 0;
    }
    setTipAmount(amount);
  };

  const createPaymentLink = async (txType: PaymentMethod) => {
    const body = txType === 'eip681' ? {
      payloadType: 'eip681',
      toAddress: resolvedAddress,
      value: totalAmount,
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

    setUuid(uuid);
    window.ethereum.request({
      method: 'requestContactlessPayment',
      params: [{
        type: 2,
        uri: `${process.env.NEXT_PUBLIC_NFC_RELAYER_URL as string}/api/paymentTxParams/${uuid}`
      }],
    });
  }

  const handleTransaction = async ({ useQrCode }: { useQrCode: boolean }) => {
    console.log(`Transaction of ${totalAmount} USDC to ${OxAddress} ${resolvedAddress}`);
    if (!OxAddress) {
      toast.error('Invalid address');
      return;
    }

    setIsLoading(true);

    const eip681Uri = GeneratePaymentLink(totalAmount, resolvedAddress);
    console.log('EIP-681 URI:', eip681Uri);

    window.location.href = eip681Uri;
    setTimeout(async function () {
      if (useQrCode) {
        setShowQRCode(true);
        setQrCodeUrl(eip681Uri);
        const url = await QRCode.toDataURL(eip681Uri);
        setQrCodeData(url);
        setIsLoading(false);
        createPaymentLink('eip712');
        return;
      }
      if (confirm('It looks like this device doesn\'t know how to handle EIP-681 links.  Would you like to get a wallet?')) {
        window.location.href = `https://go.cb-w.com/dapp?cb_url=${window.location.origin}/tip/${OxAddress}`;
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-cover bg-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex flex-col items-start p-6 bg-base-100 shadow-md rounded-md w-full max-w-2xl">
        <Link href="/" className="btn btn-ghost btn-sm mb-6">
          <ArrowLeft02Icon />
          Back
        </Link>
        <div className={`mb-2 font-bold text-6xl text-center w-full`}>
          Add tip
        </div>
        <div className="flex items-center w-full justify-center mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="rounded-full w-12 h-12 mr-3"
            />
          ) : (
            <GradientAvatar address={resolvedAddress} className="rounded-full w-12 h-12 mr-3" />
          )}
          <div>
            <h1 className="text-lg font-bold">{isAddress(resolvedEnsName) ? shortenAddress(resolvedEnsName) : resolvedEnsName}</h1>
            {address !== resolvedAddress && <p className="text-sm opacity-50">{shortenAddress(resolvedAddress)}</p>}
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
        <div className={`grid grid-cols-2 place-content-center w-full gap-6 ${isCustomTip ? 'mb-2' : 'mb-4'}`}>
          {fixedTips.map((tip, i) => (
            <button
              key={tip}
              className={`btn w-full ${isSelectedFixedTip(i) ? "btn-primary" : ""}`}
              onClick={() => handleTipClick(tip)}
            >
              {tip.toLocaleString([], {
                style: fixedTipType,
                currency: "usd",
                maximumFractionDigits: 0,
              })}
            </button>
          ))}
          <button
            className={`btn w-full ${isCustomTip ? "btn-primary" : ""}`}
            onClick={() => {
              if (!isCustomTip) {
                setTipAmount(0);
              }
              setIsCustomTip(!isCustomTip)
            }}
          >
            Custom
          </button>
        </div>
        {isCustomTip && (
          <label className="form-control w-full mb-4">
            <div className="label">
              <span className="label-text">Custom tip</span>
            </div>
            <input 
              type="text" 
              placeholder="" 
              value={tipAmount}
              className="input input-bordered input-lg w-full text-center" 
              onChange={(e) => {
                const { value } = e.target;
                setTipAmount(isNaN(Number(value)) ? 0 : Number(value));
              }}
            />
          </label>
        )}
        {!transactionSubmitted && (
          <div className="flex flex-col items-center w-full gap-2 mt-4">
            <button
              onClick={() => handleTransaction({ useQrCode: false })}
              className="mb-4 btn btn-primary btn-block btn-lg"
              disabled={isLoading}
            >
              <SmartphoneWifiIcon className="w-10 h-10" />
              Tap to Tip
            </button>
            <button
              onClick={() => handleTransaction({ useQrCode: true })}
              className="mb-4 btn btn-secondary btn-block btn-lg"
              disabled={isLoading}
            >
              <QrCodeIcon className="w-10 h-10" />
              Scan to Tip
            </button>
          </div>
        )}
        {transactionSubmitted && !transactionConfirmed && (
          <div className="flex flex-col w-full gap-4">
            <div className="font-bold text-xl w-full flex justify-center">Transaction Processing...</div>
            <Loading02Icon className="w-24 h-24 mx-auto animate-spin" />
          </div>
        )}
        {transactionConfirmed && (
          <div className="flex flex-col w-full gap-4">
            <div className="font-bold text-xl w-full flex justify-center">Transaction Confirmed!</div>
            <CheckmarkCircle02Icon className="w-24 h-24 mx-auto text-success" />
          </div>
        )}
        {showQRCode && !isLoading && (
          <div className="w-full mx-auto mb-8">
            <QRCodeFooter
              qrCodeData={qrCodeData}
              qrCodeUrl={qrCodeUrl}
              hideFooter
              hideHeader
            />
          </div>
        )}
        {isLoading && (
          <div className="h-full w-full min-h-72 items-center flex justify-center">
            <div className="loading loading-spinner loading-lg" />
          </div>
        )}
        {txHash && (
          <div className="w-full flex justify-center">
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link"
            >
              View on Basescan
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

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