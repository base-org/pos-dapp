import { useRef } from 'react';
import QRCode from 'qrcode';

import {toast } from 'react-toastify';

interface QRCodeFooterProps {
  qrCodeData: string;
  qrCodeUrl: string;
}

export default function QRCodeFooter({
  qrCodeData,
  qrCodeUrl,
}: QRCodeFooterProps) {
  const canvasRef = useRef(null);

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Text copied to clipboard!');
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const copyQrCodeImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      QRCode.toCanvas(canvas, qrCodeUrl, (error) => {
        if (error) console.error(error);
      });
      (canvas as HTMLCanvasElement).toBlob((blob: any) => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          toast.success('QR Code image copied to clipboard!');
        }).catch((err) => {
          console.error('Could not copy image: ', err);
        });
      });
    } else {
      console.error('Canvas element not found');
    }
  };
  return (
    <div className="mt-4 text-center">
      <h2 className="text-lg font-semibold mb-2">QR Code:</h2>
      <img src={qrCodeData} alt="EIP-681 QR Code" className="border border-gray-300 rounded-md mb-2 mx-auto" />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <div className="flex space-x-2 justify-center">
        <button
          className="p-2 bg-green-500 text-white rounded-md"
          onClick={() => copyToClipboard(qrCodeUrl)}
        >
          Copy QR Code URL
        </button>
        <button
          className="p-2 bg-green-500 text-white rounded-md"
          onClick={copyQrCodeImage}
        >
          Copy QR Code Image
        </button>
      </div>
    </div>
  );
}
