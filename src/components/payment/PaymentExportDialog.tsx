
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Payment, PaymentFilter } from '../../types/payment';

interface PaymentExportDialogProps {
  open: boolean;
  onClose: () => void;
  payments: Payment[];
  filters: PaymentFilter;
}

export const PaymentExportDialog = ({ open, onClose, payments }: PaymentExportDialogProps) => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [includeFields, setIncludeFields] = useState({
    referenceNumber: true,
    customerName: true,
    date: true,
    amount: true,
    paymentMethod: true,
    status: true,
    notes: false
  });

  const handleExport = () => {
    const exportData = {
      format: exportFormat,
      dateRange,
      fields: includeFields,
      data: payments
    };

    console.log('Exporting payment data:', exportData);

    if (exportFormat === 'excel') {
      // Create CSV content
      const headers = Object.entries(includeFields)
        .filter(([_, include]) => include)
        .map(([field]) => field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

      const csvContent = [
        headers.join(','),
        ...payments.map(payment => 
          Object.entries(includeFields)
            .filter(([_, include]) => include)
            .map(([field]) => {
              const value = payment[field as keyof Payment];
              return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            })
            .join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    onClose();
  };

  const toggleField = (field: string) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Payment Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'excel' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel (CSV)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Include Fields</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(includeFields).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={() => toggleField(field)}
                  />
                  <Label htmlFor={field} className="text-sm">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-600">
            Exporting {payments.length} payment records
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="bg-diamond-gradient hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
