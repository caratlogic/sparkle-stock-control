import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { QRCodeFieldConfig } from '../hooks/useQRCodeSettings';

interface QRCodeSettingsProps {
  fieldConfig: QRCodeFieldConfig;
  onConfigChange: (config: QRCodeFieldConfig) => void;
}

export const QRCodeSettings = ({ fieldConfig, onConfigChange }: QRCodeSettingsProps) => {
  const fieldLabels = {
    stockId: 'Stock ID',
    gemType: 'Gem Type',
    carat: 'Carat Weight',
    color: 'Color',
    cut: 'Cut/Shape',
    measurements: 'Measurements',
    certificateNumber: 'Certificate Number',
    price: 'Price',
    treatment: 'Treatment',
    origin: 'Origin',
    supplier: 'Supplier',
    description: 'Description'
  };

  const handleFieldToggle = (field: keyof QRCodeFieldConfig, checked: boolean) => {
    onConfigChange({
      ...fieldConfig,
      [field]: checked
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>QR Code Field Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 mb-4">
          Select which fields to include in generated QR codes. These settings will be saved permanently for your account.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(fieldLabels).map(([field, label]) => (
            <div key={field} className="flex items-center space-x-2">
              <Checkbox
                id={field}
                checked={fieldConfig[field as keyof QRCodeFieldConfig]}
                onCheckedChange={(checked) => 
                  handleFieldToggle(field as keyof QRCodeFieldConfig, checked as boolean)
                }
                disabled={field === 'stockId'} // Stock ID is always included
              />
              <Label 
                htmlFor={field} 
                className={`text-sm ${field === 'stockId' ? 'text-slate-500' : 'text-slate-700'}`}
              >
                {label} {field === 'stockId' && '(Always included)'}
              </Label>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Selected Fields: {Object.values(fieldConfig).filter(Boolean).length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allEnabled = Object.keys(fieldLabels).reduce((acc, field) => {
                  acc[field as keyof QRCodeFieldConfig] = true;
                  return acc;
                }, {} as QRCodeFieldConfig);
                onConfigChange(allEnabled);
              }}
            >
              Select All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};