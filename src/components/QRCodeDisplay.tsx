import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, QrCode } from 'lucide-react';
import { generateCustomQRCode, printCustomQRCode, QRCodeData } from '../utils/qrCodeGenerator';
import { QRCodeFieldConfig } from '../hooks/useQRCodeSettings';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  gemData: QRCodeData;
  fieldConfig?: QRCodeFieldConfig;
  size?: 'small' | 'medium' | 'large';
  showPrint?: boolean;
}

export const QRCodeDisplay = ({ 
  gemData, 
  fieldConfig,
  size = 'medium', 
  showPrint = false 
}: QRCodeDisplayProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
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
    sellingPrice: true,
    costPrice: false,
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

  const handlePrint = async () => {
    try {
      setPrinting(true);
      await printCustomQRCode(gemData, config);
      toast({
        title: "Success",
        description: "QR code printed successfully",
      });
    } catch (error) {
      console.error('Error printing QR code:', error);
      toast({
        title: "Error",
        description: "Failed to print QR code",
        variant: "destructive",
      });
    } finally {
      setPrinting(false);
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
    if (config.sellingPrice) fields.push('Selling Price/Carat');
    if (config.costPrice) fields.push('Cost Price/Carat');
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
      <div className="text-center">
        <p className="text-xs text-slate-600">
          {gemData.stockId} - {gemData.carat}ct {gemData.gemType}
        </p>
      </div>
      {showPrint && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={printing}
          className="flex items-center space-x-1"
        >
          <Printer className="w-4 h-4" />
          <span>{printing ? 'Printing...' : 'Print QR Code'}</span>
        </Button>
      )}
    </div>
  );
};