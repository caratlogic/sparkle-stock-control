import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Diamond, CUT_OPTIONS, COLOR_OPTIONS, CLARITY_OPTIONS, STATUS_OPTIONS } from '../types/diamond';
import { ArrowLeft, Save, Diamond as DiamondIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DiamondFormProps {
  diamond?: Diamond | null;
  onSubmit: (diamond: any) => void;
  onCancel: () => void;
}

export const DiamondForm = ({ diamond, onSubmit, onCancel }: DiamondFormProps) => {
  const { isOwner } = useAuth();
  const [formData, setFormData] = useState({
    weight: '',
    cut_grade: '',
    color: '',
    clarity: '',
    retail_price: '',
    cost_price: '',
    report_number: '',
    status: 'In Stock',
    notes: ''
  });

  useEffect(() => {
    if (diamond) {
      setFormData({
        weight: diamond.weight?.toString() || '',
        cut_grade: diamond.cut_grade || '',
        color: diamond.color || '',
        clarity: diamond.clarity || '',
        retail_price: diamond.retail_price.toString(),
        cost_price: diamond.cost_price?.toString() || '',
        report_number: diamond.report_number || '',
        status: diamond.status,
        notes: diamond.notes || ''
      });
    }
  }, [diamond]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const diamondData = {
      ...formData,
      weight: parseFloat(formData.weight),
      retail_price: parseFloat(formData.retail_price),
      cost_price: parseFloat(formData.cost_price) || 0,
      ...(diamond && { id: diamond.id, stock_number: diamond.stock_number, date_added: diamond.date_added })
    };

    onSubmit(diamondData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {diamond ? 'Edit Diamond' : 'Add New Diamond'}
          </h2>
          <p className="text-slate-600">
            {diamond ? 'Update diamond information' : 'Enter the details for the new diamond'}
          </p>
        </div>
      </div>

      <Card className="diamond-sparkle">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DiamondIcon className="w-5 h-5 text-slate-600" />
            <span>Diamond Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Carat Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="1.25"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cut_grade">Cut Grade</Label>
                <Select value={formData.cut_grade} onValueChange={(value) => handleChange('cut_grade', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select cut grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {CUT_OPTIONS.map((cut) => (
                      <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => handleChange('color', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clarity">Clarity</Label>
                <Select value={formData.clarity} onValueChange={(value) => handleChange('clarity', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select clarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {CLARITY_OPTIONS.map((clarity) => (
                      <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retail_price">Selling Price (USD)</Label>
                <Input
                  id="retail_price"
                  type="number"
                  placeholder="12500"
                  value={formData.retail_price}
                  onChange={(e) => handleChange('retail_price', e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              {isOwner && (
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price (USD)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    placeholder="8500"
                    value={formData.cost_price}
                    onChange={(e) => handleChange('cost_price', e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report_number">Certificate Number</Label>
              <Input
                id="report_number"
                placeholder="GIA-1234567890"
                value={formData.report_number}
                onChange={(e) => handleChange('report_number', e.target.value)}
                required
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this diamond..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-diamond-gradient hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                {diamond ? 'Update Diamond' : 'Add Diamond'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
