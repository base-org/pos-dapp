import { convertToHttpUrl, fetchNftMetadata } from '../util'; // Ensure the path is correct
import { ethers } from 'ethers';

// Custom error to indicate that a provider is required
export class ProviderRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderRequiredError';
  }
}

export async function resolveAvatarUrl(url: string, provider: ethers.BrowserProvider | null): Promise<string> {
  if (url.startsWith('eip155:')) {
    // Example: eip155:1/erc721:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/0
    const parts = url.split(/[:/]+/);
    const chainId = parts[1];
    const contractAddress = parts[3];
    const tokenId = parts[4];

    // Check if the chainId is supported (e.g., Ethereum Mainnet)
    if (chainId !== '1') {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    if (!provider) {
      // Throw a custom error indicating that a provider is required
      throw new ProviderRequiredError('Wallet provider is required to resolve eip155 URL.');
    }

    try {
      // Construct a URI that `fetchNftMetadata` can use
      const nftUri = `eip155:${chainId}/erc721:${contractAddress}/${tokenId}`;

      // Fetch the NFT metadata using the helper function
      const { imageUrl } = await fetchNftMetadata(nftUri, provider);

      // Convert the IPFS URL to an HTTP URL if necessary
      return convertToHttpUrl(imageUrl);
    } catch (error) {
      console.error('Error resolving avatar URL:', error);
      return '';
    }
  }

  // If the URL does not start with eip155:, return it as is
  return convertToHttpUrl(url);
}
