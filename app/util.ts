
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

