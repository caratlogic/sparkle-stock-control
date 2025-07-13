import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BulkGemUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface GemRow {
  row: number;
  data: any;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export const BulkGemUpload = ({ isOpen, onClose, onSuccess }: BulkGemUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [csvData, setCsvData] = useState<GemRow[]>([]);
  const [uploadResults, setUploadResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });

  const downloadTemplate = () => {
    const headers = [
      'gemType', 'carat', 'cut', 'color', 'description', 'measurements',
      'price', 'costPrice', 'certificateNumber', 'status', 'treatment',
      'colorComment', 'certificateType', 'supplier', 'purchaseDate',
      'origin', 'inStock', 'notes'
    ];

    const sampleRow = [
      'Diamond', '1.25', 'Round Brilliant', 'D', 'Beautiful diamond',
      '7.5 x 7.5 x 4.6 mm', '15000', '10000', 'GIA-1234567890',
      'In Stock', 'none', 'none', 'GIA', 'Bangkok Gems Ltd',
      '2024-01-15', 'Sri Lanka', '1', 'High quality stone'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gem-upload-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully"
    });
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const data: any = {};
      
      headers.forEach((header, i) => {
        data[header] = values[i] || '';
      });

      return {
        row: index + 2, // +2 because we start from row 2 (after header)
        data,
        status: 'pending' as const
      };
    });
  };

  const validateGemData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!data.gemType) errors.push('Gem Type is required');
    if (!data.carat || isNaN(parseFloat(data.carat))) errors.push('Valid Carat weight is required');
    if (!data.cut) errors.push('Cut is required');
    if (!data.color) errors.push('Color is required');
    if (!data.description) errors.push('Description is required');
    if (!data.measurements) errors.push('Measurements are required');
    if (!data.price || isNaN(parseFloat(data.price))) errors.push('Valid Price is required');
    if (!data.certificateNumber) errors.push('Certificate Number is required');

    // Valid status
    const validStatuses = ['In Stock', 'Sold', 'Reserved'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status must be one of: In Stock, Sold, Reserved');
    }

    // Valid gem types
    const validGemTypes = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Tanzanite', 'Tsavorite', 'Spinel', 'Tourmaline', 'Peridot', 'Amethyst', 'Citrine', 'Topaz', 'Garnet', 'Aquamarine', 'Opal', 'Jade', 'Pearl', 'Other'];
    if (data.gemType && !validGemTypes.includes(data.gemType)) {
      errors.push(`Invalid gem type. Must be one of: ${validGemTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);
        setCsvData(parsedData);
        setUploadResults({ success: 0, errors: 0 });
        
        toast({
          title: "File Uploaded",
          description: `Parsed ${parsedData.length} rows from CSV`
        });
      } catch (error) {
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  const processUpload = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    const updatedData = [...csvData];

    for (let i = 0; i < updatedData.length; i++) {
      const item = updatedData[i];
      
      try {
        // Validate data
        const validation = validateGemData(item.data);
        if (!validation.isValid) {
          item.status = 'error';
          item.error = validation.errors.join('; ');
          errorCount++;
          continue;
        }

        // Prepare gem data
        const gemData = {
          stock_id: `GEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          gem_type: item.data.gemType,
          carat: parseFloat(item.data.carat),
          color: item.data.color,
          certificate_number: item.data.certificateNumber,
          cost_price: parseFloat(item.data.costPrice) || 0,
          description: item.data.description,
          measurements: item.data.measurements,
          price: parseFloat(item.data.price),
          status: item.data.status || 'In Stock',
          notes: item.data.notes || null,
          image_url: item.data.imageUrl || null,
          treatment: item.data.treatment || null,
          color_comment: item.data.colorComment || null,
          certificate_type: item.data.certificateType || null,
          supplier: item.data.supplier || null,
          purchase_date: item.data.purchaseDate || null,
          origin: item.data.origin || null,
          in_stock: parseInt(item.data.inStock) || 1,
          reserved: 0,
          sold: 0
        };

        // Insert into database
        const { error } = await supabase
          .from('gems')
          .insert(gemData);

        if (error) throw error;

        item.status = 'success';
        successCount++;
      } catch (error: any) {
        item.status = 'error';
        item.error = error.message || 'Failed to insert gem';
        errorCount++;
      }

      // Update UI
      setCsvData([...updatedData]);
      setUploadResults({ success: successCount, errors: errorCount });
    }

    setProcessing(false);

    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${successCount} gems. ${errorCount} errors.`,
      variant: errorCount > 0 ? "destructive" : "default"
    });

    if (successCount > 0) {
      onSuccess();
    }
  };

  const resetUpload = () => {
    setCsvData([]);
    setUploadResults({ success: 0, errors: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Gem Upload
          </DialogTitle>
          <DialogDescription>
            Upload multiple gems at once using a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Download the CSV template to see the required format</p>
              <p>2. Fill in your gem data following the template structure</p>
              <p>3. Upload your completed CSV file</p>
              <p>4. Review the parsed data and click "Process Upload"</p>
              
              <div className="mt-4">
                <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload CSV File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading || processing}
                />
                
                {csvData.length > 0 && (
                  <div className="flex items-center gap-4 text-sm">
                    <span>Loaded {csvData.length} rows</span>
                    <Button variant="outline" size="sm" onClick={resetUpload}>
                      Clear Data
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Data */}
          {csvData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Data Preview & Status</CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Success: {uploadResults.success}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Errors: {uploadResults.errors}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-left p-2 border-b">Row</th>
                        <th className="text-left p-2 border-b">Gem Type</th>
                        <th className="text-left p-2 border-b">Carat</th>
                        <th className="text-left p-2 border-b">Color</th>
                        <th className="text-left p-2 border-b">Price</th>
                        <th className="text-left p-2 border-b">Status</th>
                        <th className="text-left p-2 border-b">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row.row}</td>
                          <td className="p-2">{row.data.gemType}</td>
                          <td className="p-2">{row.data.carat}</td>
                          <td className="p-2">{row.data.color}</td>
                          <td className="p-2">${row.data.price}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                row.status === 'success' ? 'default' :
                                row.status === 'error' ? 'destructive' : 'secondary'
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-red-600 text-xs">
                            {row.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {csvData.length > 0 && (
              <Button
                onClick={processUpload}
                disabled={processing || uploadResults.success === csvData.length}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process Upload
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};