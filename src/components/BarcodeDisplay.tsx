
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateBarcode, downloadBarcode } from '../utils/barcodeGenerator';

interface BarcodeDisplayProps {
  stockId: string;
  gemType: string;
  size?: 'small' | 'medium' | 'large';
  showDownload?: boolean;
}

export const BarcodeDisplay = ({ 
  stockId, 
  gemType, 
  size = 'medium', 
  showDownload = false 
}: BarcodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const barcodeDataUrl = generateBarcode(stockId);
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          const sizeMultiplier = size === 'small' ? 0.6 : size === 'large' ? 1.4 : 1;
          canvasRef.current.width = img.width * sizeMultiplier;
          canvasRef.current.height = img.height * sizeMultiplier;
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
      img.src = barcodeDataUrl;
    }
  }, [stockId, size]);

  const handleDownload = () => {
    downloadBarcode(stockId, gemType);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas 
        ref={canvasRef}
        className="border border-slate-200 rounded"
      />
      {showDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center space-x-1"
        >
          <Download className="w-4 h-4" />
          <span>Download Barcode</span>
        </Button>
      )}
    </div>
  );
};
