import { useState, useEffect } from 'react';

export function useEnsResolver(address: string) {
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

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
              setAvatarUrl('');
            }
          } else {
            setResolvedAddress(address);
            setAvatarUrl('');
          }
        }
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [address]);

  return { resolvedAddress, avatarUrl };
}
