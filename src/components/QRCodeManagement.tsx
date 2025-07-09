import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSettings, QRCodeFieldConfig } from './QRCodeSettings';
import { BulkQRCodeGenerator } from './BulkQRCodeGenerator';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Gem } from '../types/gem';
import { useToast } from '@/hooks/use-toast';
import { QrCode } from 'lucide-react';

interface QRCodeManagementProps {
  gems: Gem[];
}

export const QRCodeManagement = ({ gems }: QRCodeManagementProps) => {
  const { toast } = useToast();
  
  // Default configuration
  const [fieldConfig, setFieldConfig] = useState<QRCodeFieldConfig>({
    stockId: true,
    gemType: true,
    carat: true,
    color: true,
    cut: true,
    measurements: false,
    certificateNumber: true,
    price: false,
    treatment: false,
    origin: false,
    supplier: false,
    description: false
  });

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

  // Get a sample gem for preview
  const sampleGem = gems.find(gem => gem.status === 'In Stock') || gems[0];
  
  const sampleQRData = sampleGem ? {
    stockId: sampleGem.stockId,
    gemType: sampleGem.gemType,
    carat: sampleGem.carat,
    color: sampleGem.color,
    cut: sampleGem.cut,
    measurements: sampleGem.measurements || '',
    certificateNumber: sampleGem.certificateNumber,
    price: sampleGem.price,
    pricePerCarat: sampleGem.price / sampleGem.carat,
    description: sampleGem.description || '',
    origin: sampleGem.origin || '',
    treatment: sampleGem.treatment || '',
    supplier: sampleGem.supplier || '',
    dateAdded: sampleGem.dateAdded
  } : null;

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
                config={fieldConfig}
                onConfigChange={setFieldConfig}
                onSaveTemplate={handleSaveTemplate}
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
                      showDownload={true}
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
                fieldConfig={fieldConfig}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};