import { toast } from 'react-toastify';

export const copyToClipboard = (text: string): void => {
  console.log(text);
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Text copied to clipboard!');
  }).catch((err) => {
    console.error('Could not copy text: ', err);
  });
};