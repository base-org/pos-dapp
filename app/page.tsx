'use client';
import { useMemo, useState } from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { useEnsResolver } from './hooks/useEnsResolver';
import { useWallet } from './hooks/useWallet';
import shortenAddress from './helpers/shortenAddress';
import { GradientAvatar } from './component/gradientAvatar';
import { isAddress } from 'ethers';

export default function Home({ searchParams }: { searchParams: any }) {
  const { provider, account, connectWallet, switchWallet } = useWallet();
  const [address, setAddress] = useState(searchParams.address || account || '');
  const [amount, setAmount] = useState('');

  const { resolvedAddress } = useEnsResolver(address, provider);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const checkoutUrl = useMemo(() => {
    if (resolvedAddress && amount) {
      const url = new URL('/checkout', window.location.origin);
      url.searchParams.set('address', resolvedAddress);
      url.searchParams.set('baseAmount', amount);
      return url.toString();
    }
    return '';
  }, [resolvedAddress, amount]);

  const goToCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }

  const { resolvedAddress: connectedEnsResolvedAddress, avatarUrl: connectedEnsAvatarUrl } = useEnsResolver(account || '', provider);

  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-base-200">
      {!account ? (
        <button
          className="btn btn-secondary"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : (
        <button
          className="btn btn-neutral"
          onClick={switchWallet}
        >
          {connectedEnsAvatarUrl ? (
            <img
              src={connectedEnsAvatarUrl}
              alt="Avatar"
              className="rounded-full w-8 h-8 mr-1"
            />
          ) : (
            <GradientAvatar address={account} className="rounded-full w-8 h-8 mr-1" />
          )}
          {isAddress(connectedEnsResolvedAddress) ? shortenAddress(connectedEnsResolvedAddress) : connectedEnsResolvedAddress}
        </button>
      )}
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
              value={address}
              className="input input-bordered input-lg w-full max-w-xs" 
              onChange={handleAddressChange} 
            />
              <div className="label">
                {(address.length > 0 && resolvedAddress) ? (
                  <span className={`label-text-alt ${!isAddress(resolvedAddress) && 'text-error'}`}>
                    {!isAddress(resolvedAddress) ? 'Invalid address' : shortenAddress(resolvedAddress)}
                  </span>
                ) : <span className="label-text-alt"></span>}
                <span className="label-text-alt">
                  <button
                    className="btn btn-xs"
                    onClick={() => setAddress(account || '')}
                  >
                    My Address
                  </button>
                </span>
              </div>
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
          <button
            onClick={goToCheckout}
            disabled={!isAddress(resolvedAddress) || !amount}
            className="btn btn-primary btn-lg mt-4"
          >
            Check out
          </button>
        </div>
      </div>
    </main>
  );
}