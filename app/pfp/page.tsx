'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '../hooks/useWallet'; // Import the custom hook
import { fetchNftMetadata } from '../util';

function NFTProfileImage() {
  const { provider, isConnected, connectWallet } = useWallet();
  const [imageUrl, setImageUrl] = useState('');
  const searchParams = useSearchParams(); // Hook to get the search parameters
  const uri = searchParams.get('uri') || '';
  console.log(uri);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isConnected || !provider || !uri) {
        if (!uri || !provider || !isConnected) {
          console.log('No URI or provider or not connected');
        }
        return;
      }

      try {
        const { imageUrl } = await fetchNftMetadata(uri, provider);
        setImageUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, [uri, isConnected, provider]);

  if (!uri) {
    return <p className="text-center text-red-500 font-bold mt-8">No URI provided</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
        >
          Connect Wallet
        </button>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="NFT Profile"
          className="rounded-full w-48 h-48 mb-6 shadow-lg border-4 border-blue-500"
        />
      ) : (
        <p className="text-gray-500 font-medium">Loading...</p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
      <NFTProfileImage />
      </Suspense>
    </div>
  );
}