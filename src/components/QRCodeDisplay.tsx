import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import { generateCustomQRCode, downloadCustomQRCode, QRCodeData } from '../utils/qrCodeGenerator';
import { QRCodeFieldConfig } from './QRCodeSettings';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  gemData: QRCodeData;
  fieldConfig?: QRCodeFieldConfig;
  size?: 'small' | 'medium' | 'large';
  showDownload?: boolean;
}

export const QRCodeDisplay = ({ 
  gemData, 
  fieldConfig,
  size = 'medium', 
  showDownload = false 
}: QRCodeDisplayProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  // Default field configuration if none provided
  const defaultConfig: QRCodeFieldConfig = {
    stockId: true,
    gemType: true,
    carat: true,
    color: true,
    cut: true,
    measurements: true,
    certificateNumber: true,
    price: true,
    treatment: true,
    origin: true,
    supplier: false,
    description: false
  };

  const config = fieldConfig || defaultConfig;

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        console.log('Generating QR code with config:', config);
        const url = await generateCustomQRCode(gemData, config);
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast({
          title: "Error",
          description: "Failed to generate QR code",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure config changes are processed
    const timeoutId = setTimeout(() => {
      generateQR();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [gemData, config, toast]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadCustomQRCode(gemData, config);
      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small': return 'w-24 h-24';
      case 'large': return 'w-64 h-64';
      default: return 'w-32 h-32';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className={`${getSize()} border border-slate-200 rounded flex items-center justify-center bg-slate-50`}>
          <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
        </div>
        <p className="text-sm text-slate-500">Generating QR code...</p>
      </div>
    );
  }

  // Generate field list for preview
  const getIncludedFields = () => {
    const fields = [];
    if (config.stockId) fields.push('Stock ID');
    if (config.gemType) fields.push('Gem Type');
    if (config.carat) fields.push('Carat');
    if (config.color) fields.push('Color');
    if (config.cut) fields.push('Cut');
    if (config.measurements) fields.push('Measurements');
    if (config.certificateNumber) fields.push('Certificate Number');
    if (config.price) fields.push('Price');
    if (config.treatment) fields.push('Treatment');
    if (config.origin) fields.push('Origin');
    if (config.supplier) fields.push('Supplier');
    if (config.description) fields.push('Description');
    return fields;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <img 
        src={qrCodeUrl}
        alt={`QR Code for ${gemData.stockId}`}
        className={`${getSize()} border border-slate-200 rounded`}
      />
      <div className="text-center space-y-2">
        <p className="text-xs text-slate-600">
          {gemData.stockId} - {gemData.carat}ct {gemData.gemType}
        </p>
        <div className="bg-slate-50 rounded-lg p-3 max-w-sm">
          <p className="text-xs font-medium text-slate-700 mb-2">QR Code includes:</p>
          <div className="flex flex-wrap gap-1">
            {getIncludedFields().map((field) => (
              <span
                key={field}
                className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>
      {showDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center space-x-1"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Downloading...' : 'Download QR Code'}</span>
        </Button>
      )}
    </div>
  );
};