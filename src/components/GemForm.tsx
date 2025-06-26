
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, GEM_TYPES, STATUS_OPTIONS, GEM_COLORS } from '../types/gem';
import { ArrowLeft, Save, Gem as GemIcon, Image, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarcodeDisplay } from './BarcodeDisplay';

interface GemFormProps {
  gem?: Gem | null;
  onSubmit: (gem: any) => void;
  onCancel: () => void;
}

export const GemForm = ({ gem, onSubmit, onCancel }: GemFormProps) => {
  const { isOwner } = useAuth();
  const [formData, setFormData] = useState({
    gemType: 'Diamond',
    carat: '',
    color: '',
    price: '',
    costPrice: '',
    certificateNumber: '',
    status: 'In Stock',
    notes: '',
    imageUrl: '',
    // Updated fields
    measurementsMm: '',
    priceInLetters: '',
    totalInLetters: '',
    purchaseDate: '',
    oldCode: '',
    stoneDescription: '',
    shapeDetail: '',
    boxNumber: ''
  });

  useEffect(() => {
    if (gem) {
      setFormData({
        gemType: gem.gemType,
        carat: gem.carat.toString(),
        color: gem.color,
        price: gem.price.toString(),
        costPrice: gem.costPrice.toString(),
        certificateNumber: gem.certificateNumber,
        status: gem.status,
        notes: gem.notes || '',
        imageUrl: gem.imageUrl || '',
        // Updated fields
        measurementsMm: gem.measurementsMm || '',
        priceInLetters: gem.priceInLetters || '',
        totalInLetters: gem.totalInLetters || '',
        purchaseDate: gem.purchaseDate || '',
        oldCode: gem.oldCode || '',
        stoneDescription: gem.stoneDescription || '',
        shapeDetail: gem.shapeDetail || '',
        boxNumber: gem.boxNumber || ''
      });
    }
  }, [gem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const gemData = {
      ...formData,
      carat: parseFloat(formData.carat),
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice) || 0,
      ...(gem && { id: gem.id, stockId: gem.stockId, dateAdded: gem.dateAdded })
    };

    onSubmit(gemData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset color when gem type changes
      if (field === 'gemType') {
        newData.color = '';
      }
      return newData;
    });
  };

  const availableColors = GEM_COLORS[formData.gemType as keyof typeof GEM_COLORS] || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {gem ? 'Edit Gem' : 'Add New Gem'}
          </h2>
          <p className="text-slate-600">
            {gem ? 'Update gem information' : 'Enter the details for the new gem'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="diamond-sparkle">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GemIcon className="w-5 h-5 text-slate-600" />
                <span>Gem Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gemType">Gem Type</Label>
                    <Select value={formData.gemType} onValueChange={(value) => handleChange('gemType', value)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select gem type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {GEM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carat">Carat Weight</Label>
                    <Input
                      id="carat"
                      type="number"
                      step="0.01"
                      placeholder="1.25"
                      value={formData.carat}
                      onChange={(e) => handleChange('carat', e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select value={formData.color} onValueChange={(value) => handleChange('color', value)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {availableColors.map((color) => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurementsMm">Measurements (mm)</Label>
                    <Input
                      id="measurementsMm"
                      placeholder="7.5 x 5.2 x 3.1"
                      value={formData.measurementsMm}
                      onChange={(e) => handleChange('measurementsMm', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shapeDetail">Shape Detail</Label>
                    <Input
                      id="shapeDetail"
                      placeholder="Modified brilliant cut"
                      value={formData.shapeDetail}
                      onChange={(e) => handleChange('shapeDetail', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="boxNumber">Box Number</Label>
                    <Input
                      id="boxNumber"
                      placeholder="Box-A-001"
                      value={formData.boxNumber}
                      onChange={(e) => handleChange('boxNumber', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Selling Price (USD)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="12500"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceInLetters">Price in Letters</Label>
                      <Input
                        id="priceInLetters"
                        placeholder="Twelve thousand five hundred dollars"
                        value={formData.priceInLetters}
                        onChange={(e) => handleChange('priceInLetters', e.target.value)}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    {isOwner && (
                      <div className="space-y-2">
                        <Label htmlFor="costPrice">Cost Price (USD)</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          placeholder="8500"
                          value={formData.costPrice}
                          onChange={(e) => handleChange('costPrice', e.target.value)}
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="totalInLetters">Total in Letters</Label>
                      <Input
                        id="totalInLetters"
                        placeholder="Twelve thousand five hundred dollars only"
                        value={formData.totalInLetters}
                        onChange={(e) => handleChange('totalInLetters', e.target.value)}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="certificateNumber">Certificate Number</Label>
                      <Input
                        id="certificateNumber"
                        placeholder="GIA-1234567890"
                        value={formData.certificateNumber}
                        onChange={(e) => handleChange('certificateNumber', e.target.value)}
                        required
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="oldCode">Old Code</Label>
                      <Input
                        id="oldCode"
                        placeholder="Legacy inventory code"
                        value={formData.oldCode}
                        onChange={(e) => handleChange('oldCode', e.target.value)}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => handleChange('purchaseDate', e.target.value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="flex items-center space-x-2">
                    <Image className="w-4 h-4" />
                    <span>Product Image URL (Optional)</span>
                  </Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/product-image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Product preview" 
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stoneDescription">Stone Description</Label>
                  <Textarea
                    id="stoneDescription"
                    placeholder="Detailed description of the stone's characteristics..."
                    value={formData.stoneDescription}
                    onChange={(e) => handleChange('stoneDescription', e.target.value)}
                    rows={3}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this gem..."
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
                    {gem ? 'Update Gem' : 'Add Gem'}
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

        {/* Barcode Preview Section */}
        {gem && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Barcode Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <BarcodeDisplay 
                  stockId={gem.stockId} 
                  gemType={gem.gemType}
                  size="medium"
                  showDownload={true}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
