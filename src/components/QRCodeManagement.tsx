import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSettings } from './QRCodeSettings';
import { BulkQRCodeGenerator } from './BulkQRCodeGenerator';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Gem } from '../types/gem';
import { Diamond } from '../types/diamond';
import { useToast } from '@/hooks/use-toast';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';
import { QrCode } from 'lucide-react';

interface QRCodeManagementProps {
  gems: Gem[];
  diamonds?: Diamond[];
}

export const QRCodeManagement = ({ gems, diamonds = [] }: QRCodeManagementProps) => {
  const { toast } = useToast();
  const { fieldConfig, updateFieldConfig } = useQRCodeSettings();

  const handleSaveTemplate = (templateName: string) => {
    // Save custom template to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('qr-code-templates') || '{}');
    savedTemplates[templateName] = fieldConfig;
    localStorage.setItem('qr-code-templates', JSON.stringify(savedTemplates));
    
    toast({
      title: "Template Saved",
      description: `Template "${templateName}" has been saved successfully`,
    });
  };

  // Get a sample gem or diamond for preview
  const sampleGem = gems.find(gem => gem.status === 'In Stock') || gems[0];
  const sampleDiamond = diamonds.find(diamond => diamond.status === 'In Stock') || diamonds[0];
  
  // Prefer diamond if available, otherwise use gem
  const sampleItem = sampleDiamond || sampleGem;
  
  const sampleQRData = sampleItem ? (
    'stock_number' in sampleItem ? {
      // Diamond data
      stockId: sampleItem.stock_number,
      gemType: 'Diamond',
      carat: sampleItem.weight || 0,
      color: sampleItem.color || '',
      cut: sampleItem.shape || '',
      measurements: sampleItem.measurements || '',
      certificateNumber: sampleItem.report_number || '',
      price: sampleItem.retail_price || 0,
      pricePerCarat: sampleItem.retail_price && sampleItem.weight ? sampleItem.retail_price / sampleItem.weight : 0,
      costPrice: sampleItem.cost_price || 0,
      costPricePerCarat: sampleItem.cost_price && sampleItem.weight ? sampleItem.cost_price / sampleItem.weight : 0,
      description: sampleItem.notes || '',
      origin: sampleItem.origin || '',
      treatment: sampleItem.treatment || '',
      supplier: sampleItem.supplier || '',
      dateAdded: sampleItem.date_added
    } : {
      // Gem data
      stockId: sampleItem.stockId,
      gemType: sampleItem.gemType,
      carat: sampleItem.carat,
      color: sampleItem.color,
      cut: sampleItem.cut,
      measurements: sampleItem.measurements || '',
      certificateNumber: sampleItem.certificateNumber,
      price: sampleItem.price,
      pricePerCarat: sampleItem.price / sampleItem.carat,
      costPrice: sampleItem.costPrice || 0,
      costPricePerCarat: (sampleItem.costPrice || 0) / sampleItem.carat,
      description: sampleItem.description || '',
      origin: sampleItem.origin || '',
      treatment: sampleItem.treatment || '',
      supplier: sampleItem.supplier || '',
      dateAdded: sampleItem.dateAdded
    }
  ) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-6 h-6" />
            <span>QR Code Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Field Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              <QRCodeSettings
                fieldConfig={fieldConfig}
                onConfigChange={updateFieldConfig}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">QR Code Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {sampleQRData ? (
                    <QRCodeDisplay
                      gemData={sampleQRData}
                      fieldConfig={fieldConfig}
                      size="large"
                      showPrint={true}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No gems available for preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bulk" className="space-y-4">
              <BulkQRCodeGenerator
                gems={gems}
                diamonds={diamonds}
                fieldConfig={fieldConfig}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};