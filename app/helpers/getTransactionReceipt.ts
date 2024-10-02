import { ethers } from "ethers";
import { toast } from "react-toastify";

export default async function getTransactionReceipt(txHash: string, maxAttempts = 20, intervalMs = 2000) {
  const provider = new ethers.BrowserProvider(window.ethereum);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        toast.dismiss();
        toast("Transaction confirmed!", { type: 'success' });
        const canVibrate = 'vibrate' in navigator || 'mozVibrate' in navigator;
        if (canVibrate) {
          navigator.vibrate([100, 30, 100, 30, 100]);
        }
        return receipt;
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts) throw error;
    }
  }

  throw new Error(`Transaction receipt not found after ${maxAttempts} attempts`);
}