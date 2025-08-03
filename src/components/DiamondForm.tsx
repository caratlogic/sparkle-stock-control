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
    stock_number: '',
    weight: '',
    shape: '',
    cut_grade: '',
    color: '',
    clarity: '',
    polish: '',
    symmetry: '',
    fluorescence_intensity: '',
    lab: '',
    retail_price: '',
    cost_price: '',
    cash_price: '',
    report_number: '',
    measurements: '',
    depth_percent: '',
    table_percent: '',
    supplier: '',
    origin: '',
    status: 'In Stock',
    notes: '',
    availability: 'In Stock',
    eye_clean: false,
    in_stock: 1,
    reserved: 0,
    sold: 0,
    stock_type: 'single',
    ownership_status: 'O',
    associated_entity: 'Self',
    partner_percentage: 0
  });

  useEffect(() => {
    if (diamond) {
      setFormData({
        stock_number: diamond.stock_number || '',
        weight: diamond.weight?.toString() || '',
        shape: diamond.shape || '',
        cut_grade: diamond.cut_grade || '',
        color: diamond.color || '',
        clarity: diamond.clarity || '',
        polish: diamond.polish || '',
        symmetry: diamond.symmetry || '',
        fluorescence_intensity: diamond.fluorescence_intensity || '',
        lab: diamond.lab || '',
        retail_price: diamond.retail_price.toString(),
        cost_price: diamond.cost_price?.toString() || '',
        cash_price: diamond.cash_price?.toString() || '',
        report_number: diamond.report_number || '',
        measurements: diamond.measurements || '',
        depth_percent: diamond.depth_percent?.toString() || '',
        table_percent: diamond.table_percent?.toString() || '',
        supplier: diamond.supplier || '',
        origin: diamond.origin || '',
        status: diamond.status,
        notes: diamond.notes || '',
        availability: diamond.availability || 'In Stock',
        eye_clean: diamond.eye_clean || false,
        in_stock: diamond.in_stock || 1,
        reserved: diamond.reserved || 0,
        sold: diamond.sold || 0,
        stock_type: diamond.stock_type || 'single',
        ownership_status: diamond.ownership_status || 'O',
        associated_entity: diamond.associated_entity || 'Self',
        partner_percentage: diamond.partner_percentage || 0
      });
    } else {
      // Generate stock number for new diamonds
      const timestamp = Date.now();
      const stockNumber = `DM${timestamp.toString().slice(-8)}`;
      setFormData(prev => ({ ...prev, stock_number: stockNumber }));
    }
  }, [diamond]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const diamondData = {
      ...formData,
      weight: parseFloat(formData.weight) || 0,
      retail_price: parseFloat(formData.retail_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      cash_price: parseFloat(formData.cash_price) || 0,
      depth_percent: parseFloat(formData.depth_percent) || null,
      table_percent: parseFloat(formData.table_percent) || null,
      date_added: diamond?.date_added || new Date().toISOString().split('T')[0],
      ...(diamond && { id: diamond.id })
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
                <Label htmlFor="stock_number">Stock Number</Label>
                <Input
                  id="stock_number"
                  placeholder="DM12345678"
                  value={formData.stock_number}
                  onChange={(e) => handleChange('stock_number', e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200"
                />
              </div>

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
                <Label htmlFor="shape">Shape</Label>
                <Select value={formData.shape} onValueChange={(value) => handleChange('shape', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select shape" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {CUT_OPTIONS.map((shape) => (
                      <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cut_grade">Cut Grade</Label>
                <Select value={formData.cut_grade} onValueChange={(value) => handleChange('cut_grade', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select cut grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map((cut) => (
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
                <Label htmlFor="polish">Polish</Label>
                <Select value={formData.polish} onValueChange={(value) => handleChange('polish', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select polish" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map((polish) => (
                      <SelectItem key={polish} value={polish}>{polish}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symmetry">Symmetry</Label>
                <Select value={formData.symmetry} onValueChange={(value) => handleChange('symmetry', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select symmetry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map((symmetry) => (
                      <SelectItem key={symmetry} value={symmetry}>{symmetry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fluorescence_intensity">Fluorescence</Label>
                <Select value={formData.fluorescence_intensity} onValueChange={(value) => handleChange('fluorescence_intensity', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select fluorescence" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {['None', 'Faint', 'Medium', 'Strong', 'Very Strong'].map((fluor) => (
                      <SelectItem key={fluor} value={fluor}>{fluor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lab">Lab</Label>
                <Select value={formData.lab} onValueChange={(value) => handleChange('lab', value)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select lab" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {['GIA', 'IGI', 'SSEF', 'Gübelin', 'AGL', 'Lotus'].map((lab) => (
                      <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurements">Measurements</Label>
                <Input
                  id="measurements"
                  placeholder="6.50 x 6.48 x 4.02 mm"
                  value={formData.measurements}
                  onChange={(e) => handleChange('measurements', e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depth_percent">Depth %</Label>
                <Input
                  id="depth_percent"
                  type="number"
                  step="0.1"
                  placeholder="61.8"
                  value={formData.depth_percent}
                  onChange={(e) => handleChange('depth_percent', e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="table_percent">Table %</Label>
                <Input
                  id="table_percent"
                  type="number"
                  step="0.1"
                  placeholder="57.0"
                  value={formData.table_percent}
                  onChange={(e) => handleChange('table_percent', e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
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
                <Label htmlFor="cash_price">Cash Price (USD)</Label>
                <Input
                  id="cash_price"
                  type="number"
                  placeholder="11000"
                  value={formData.cash_price}
                  onChange={(e) => handleChange('cash_price', e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Diamond Source Inc"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  placeholder="Botswana"
                  value={formData.origin}
                  onChange={(e) => handleChange('origin', e.target.value)}
                  className="bg-slate-50 border-slate-200"
                />
              </div>

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
