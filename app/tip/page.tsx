'use client';

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Tip() {
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      setIsWalletInstalled(true);
    }
  }, []);

  const startConnect = () => {
    window.ethereum.request({ method: 'eth_requestAccounts' })
      .then((accounts: any[]) => {
        console.log('Connected account:', accounts[0]);
        window.location.href = `/tip/${accounts[0]}`;
      })
      .catch((error: any) => {
        console.error('User rejected account access', error);
        toast.error('Failed to connect wallet. Please try again.');
      });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1722482457553-17a3fdec1036?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}>
      <div className="relative z-10 flex flex-col items-center p-6 bg-white dark:bg-gray-800 shadow-md rounded-md w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to PayMe / Tips</h1>
        <p className="text-sm text-gray-500 mb-4">
          Connect your wallet to start receiving tips. If you don&#39;t have a wallet, get one now!
        </p>

        <p className="text-lg font-semibold mb-8">
          Join thousands of users in receiving tips securely and effortlessly.
        </p>
        
        {isWalletInstalled ? (
          <button
            className="p-2 bg-blue-500 text-white rounded-md w-full mb-4"
            onClick={startConnect}
          >
            Connect Wallet
          </button>
        ) : (
          <button
            className="p-2 bg-green-500 text-white rounded-md w-full mb-4"
            onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
          >
            Install Coinbase Wallet
          </button>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-left">
            <li>Secure and Private Transactions</li>
            <li>Easy to Use Interface</li>
            <li>Trusted by Thousands</li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">What Our Users Say</h2>
          <blockquote className="text-sm text-gray-500 italic">
          &#34;This platform has made tipping so much easier and secure!&#34; - Jane D.
          </blockquote>
          <blockquote className="text-sm text-gray-500 italic mt-4">
          &#34;Connecting my wallet was a breeze. Highly recommended!&#34; - John S.
          </blockquote>
        </div>
      </div>
      <ToastContainer />

      <footer className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">
          © 2024 Built with ChatGPT.
        </p>
        <p className="text-sm text-gray-500">
          <a href="/privacy" className="hover:underline">Privacy Policy</a> | <a href="/terms" className="hover:underline">Terms of Service</a> | <a href="/contact" className="hover:underline">Contact Us</a>
        </p>
      </footer>

      <style jsx>{`
        main {
          background-image: url('https://images.unsplash.com/photo-1722482457553-17a3fdec1036?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
          background-size: cover;
          background-position: center;
        }
      `}</style>
    </main>
  );
}
