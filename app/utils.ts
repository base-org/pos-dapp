import { toast } from 'react-toastify';

/**
 * Validates if the provided string is a valid Ethereum address.
 * @param address - The Ethereum address to validate.
 * @returns True if the address is valid, otherwise false.
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Resolves an ENS name to its Ethereum address.
 * @param ensName - The ENS name to resolve.
 * @returns The resolved Ethereum address, or the original input if resolution fails.
 */
export const ensLookup = async (ensName: string): Promise<string> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');
    const resolvedAddress = await provider.resolveName(ensName);
    return resolvedAddress || ensName;
  } catch {
    return ensName;
  }
};

export const copyToClipboard = (text: string): void => {
  console.log(text);
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Text copied to clipboard!');
  }).catch((err) => {
    console.error('Could not copy text: ', err);
  });
};