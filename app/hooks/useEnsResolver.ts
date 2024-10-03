'use client';
import { useState, useEffect } from 'react';
import { ProviderRequiredError, resolveAvatarUrl } from './resolveAvatarUrl'; // Make sure the path is correct
import { ethers } from 'ethers';

export function useEnsResolver(
  address: string,
  provider: ethers.BrowserProvider | null
) {
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [needsProvider, setNeedsProvider] = useState(false);

  const resolveAvatar = async (profileToUse: any, provider: ethers.BrowserProvider | null) => {
    const textRecords = profileToUse.profileTextRecords;
    if (textRecords && textRecords.avatar) {
      const record = profileToUse.profileTextRecords.avatar;
      try {
        const avatar = await resolveAvatarUrl(record, provider);
        setAvatarUrl(avatar);
      } catch (error) {
        if (error instanceof ProviderRequiredError) {
          // Signal to user to connect wallet
          setNeedsProvider(true);
        } else {
          console.error(error);
        }
      }
    } else {
      setAvatarUrl('');
    }
  };

  useEffect(() => {
    if (address) {
      setResolvedAddress('');
      const timeoutId = setTimeout(async () => {
        const url = `https://api.wallet.coinbase.com/rpc/v2/getPublicProfileByDomain?userDomain=${address}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log('ENS -> 0x lookup:', data);
          if (data && data.result && data.result.address) {
            console.log('Resolved Address:', data.result.address);
            setResolvedAddress(data.result.address);
            const { subdomainProfile, ensDomainProfile } = data.result;
            const profileToUse = ensDomainProfile || subdomainProfile;
            await resolveAvatar(profileToUse, provider);
          } else {
            if (address.startsWith('0x')) {
              const url = `https://api.wallet.coinbase.com/rpc/v2/getPublicProfileByAddress?queryAddress=${address}`;
              const response = await fetch(url);
              const data = await response.json();
              const { subdomainProfile, ensDomainProfile } = data.result;
              const profileToUse =
                data.result.primaryDomainType === 'cbid'
                  ? subdomainProfile
                  : ensDomainProfile;
              if (profileToUse && profileToUse.name) {
                console.log('0x -> ENS lookup:', profileToUse.name);
                setResolvedAddress(profileToUse.name);
                await resolveAvatar(profileToUse, provider);
              } else {
                console.log('0x -> ENS lookup:', data.result);
                setResolvedAddress(address);
                setAvatarUrl('');
              }
            } else {
              setResolvedAddress(address);
              setAvatarUrl('');
            }
          }
        } catch (error) {
          console.error('Failed to resolve address:', error);
          setResolvedAddress(address);
          setAvatarUrl('');
        }
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [address, provider]);

  return { resolvedAddress, avatarUrl, needsProvider };
}
