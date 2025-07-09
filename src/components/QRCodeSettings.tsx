import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export interface QRCodeFieldConfig {
  stockId: boolean; // Always true, can't be disabled
  gemType: boolean;
  carat: boolean;
  color: boolean;
  cut: boolean;
  measurements: boolean;
  certificateNumber: boolean;
  price: boolean;
  treatment: boolean;
  origin: boolean;
  supplier: boolean;
  description: boolean;
}

interface QRCodeSettingsProps {
  config: QRCodeFieldConfig;
  onConfigChange: (config: QRCodeFieldConfig) => void;
  onSaveTemplate: (templateName: string) => void;
}

export const QRCodeSettings = ({ 
  config, 
  onConfigChange, 
  onSaveTemplate 
}: QRCodeSettingsProps) => {
  const [templateName, setTemplateName] = useState('');

  const handleFieldChange = (field: keyof QRCodeFieldConfig, value: boolean) => {
    if (field === 'stockId') return; // Stock ID is always required
    
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const fieldLabels = {
    stockId: 'Stock ID (Required)',
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

  const presetTemplates = [
    {
      name: 'Basic Info',
      config: {
        stockId: true,
        gemType: true,
        carat: true,
        color: true,
        cut: true,
        measurements: false,
        certificateNumber: true,
        price: true,
        treatment: false,
        origin: false,
        supplier: false,
        description: false
      }
    },
    {
      name: 'With Treatment',
      config: {
        stockId: true,
        gemType: true,
        carat: true,
        color: true,
        cut: true,
        measurements: true,
        certificateNumber: true,
        price: false,
        treatment: true,
        origin: false,
        supplier: false,
        description: false
      }
    },
    {
      name: 'With Supplier',
      config: {
        stockId: true,
        gemType: true,
        carat: true,
        color: true,
        cut: true,
        measurements: true,
        certificateNumber: true,
        price: false,
        treatment: false,
        origin: false,
        supplier: true,
        description: false
      }
    },
    {
      name: 'Complete Details',
      config: {
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
        supplier: true,
        description: true
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>QR Code Field Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Templates */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Quick Templates</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetTemplates.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => onConfigChange(template.config)}
                className="justify-start"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Field Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Select Fields to Include</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={config[field as keyof QRCodeFieldConfig]}
                  onCheckedChange={(checked) => 
                    handleFieldChange(field as keyof QRCodeFieldConfig, !!checked)
                  }
                  disabled={field === 'stockId'}
                />
                <Label 
                  htmlFor={field} 
                  className={`text-sm ${field === 'stockId' ? 'text-muted-foreground' : ''}`}
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Save Custom Template */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Save as Custom Template</Label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
            />
            <Button 
              size="sm"
              onClick={() => {
                if (templateName.trim()) {
                  onSaveTemplate(templateName.trim());
                  setTemplateName('');
                }
              }}
              disabled={!templateName.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};