
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_CHAIN_ID = 8453;

export const GeneratePaymentLink = (amount: number, address: string) : string => {
  return `ethereum:${USDC_ADDRESS}@${BASE_CHAIN_ID}/transfer?value=${amount}e18&address=${address}`;
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
