import { USDC_ADDRESS, BASE_CHAIN_ID } from './constants/index';

export const formatUsdcAmount = (amount: number) => {
  // Convert to 6 decimal places, remove decimal point
  const rawAmount = Math.round(amount * 1_000_000);
  // Convert to scientific notation if it ends in zeros
  const trailingZeros = (rawAmount.toString().match(/0+$/) || [''])[0].length;
  if (trailingZeros > 0) {
    return `${rawAmount/10**trailingZeros}e${trailingZeros}`;
  }
  return rawAmount.toString();
}

export const GeneratePaymentLink = (amount: number, address: string) : string => {
  const amountAsUsdc = formatUsdcAmount(amount);
  return `ethereum:${USDC_ADDRESS}@${BASE_CHAIN_ID}/transfer?value=${amountAsUsdc}&address=${address}`;
}

export const copyToClipboard = (text: string, toast:any): void => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Text copied to clipboard!');
  }).catch((err) => {
    console.error('Could not copy text: ', err);
  });
};

import { ethers } from 'ethers';


// Helper function to convert IPFS URLs to HTTP URLs
export function convertToHttpUrl(ipfsUrl:string) {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return ipfsUrl;
}

// Helper function to fetch NFT metadata
export async function fetchNftMetadata(uri:string, provider:ethers.BrowserProvider) {
  const [chainId, contractType, contractAddress, tokenId] = uri.split(/[:/]+/).slice(1);

  if (chainId !== '1' || contractType !== 'erc721') {
    throw new Error('Unsupported chain or contract type');
  }

  const contract = new ethers.Contract(contractAddress, [
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
  ], provider);

  let tokenURI = await contract.tokenURI(tokenId);
  tokenURI = convertToHttpUrl(tokenURI);

  const response = await fetch(tokenURI);
  const metadata = await response.json();

  const imageUrl = convertToHttpUrl(metadata.image);

  return { tokenURI, metadata, imageUrl };
}
