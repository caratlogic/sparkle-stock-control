import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, Package } from 'lucide-react';
import { Gem } from '../types/gem';
import { QRCodeFieldConfig } from '../hooks/useQRCodeSettings';
import { generateCustomQRCode, downloadAllQRCodes } from '../utils/qrCodeGenerator';

interface BulkQRCodeGeneratorProps {
  gems: Gem[];
  fieldConfig: QRCodeFieldConfig;
}

export const BulkQRCodeGenerator = ({ gems, fieldConfig }: BulkQRCodeGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleBulkDownload = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);

      const filteredGems = gems.filter(gem => gem.status === 'In Stock');
      
      if (filteredGems.length === 0) {
        toast({
          title: "No gems available",
          description: "No gems in stock to generate QR codes for",
          variant: "destructive",
        });
        return;
      }

      await downloadAllQRCodes(filteredGems, fieldConfig, (current, total) => {
        setProgress((current / total) * 100);
      });

      toast({
        title: "Success",
        description: `Downloaded ${filteredGems.length} QR codes successfully`,
      });
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR codes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const inStockGems = gems.filter(gem => gem.status === 'In Stock');
  const selectedFieldsCount = Object.values(fieldConfig).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Bulk QR Code Generation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Available Gems:</span>
            <span className="ml-2 text-muted-foreground">{inStockGems.length} in stock</span>
          </div>
          <div>
            <span className="font-medium">Selected Fields:</span>
            <span className="ml-2 text-muted-foreground">{selectedFieldsCount} fields</span>
          </div>
        </div>

        {/* Preview of selected fields */}
        <div className="p-3 bg-muted rounded-md">
          <div className="text-xs font-medium text-muted-foreground mb-2">Fields to include in QR codes:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(fieldConfig)
              .filter(([_, enabled]) => enabled)
              .map(([field]) => (
                <span key={field} className="px-2 py-1 bg-background rounded text-xs">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              ))}
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating QR codes...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button
          onClick={handleBulkDownload}
          disabled={isGenerating || inStockGems.length === 0}
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating 
            ? 'Generating QR Codes...' 
            : `Download All QR Codes (${inStockGems.length} items)`
          }
        </Button>

        {inStockGems.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No gems in stock available for QR code generation
          </p>
        )}
      </CardContent>
    </Card>
  );
};