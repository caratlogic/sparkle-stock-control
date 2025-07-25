
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, STATUS_OPTIONS, CERTIFICATE_TYPE_OPTIONS, STOCK_TYPE_OPTIONS, OWNERSHIP_STATUS_OPTIONS } from '../types/gem';
import { useGemSettings } from '@/hooks/useGemSettings';
import { ArrowLeft, Save, Gem as GemIcon, Image } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { FileUpload } from './ui/file-upload';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';
import { GemCertificateManager } from './GemCertificateManager';
import { usePartners } from '../hooks/usePartners';
import { useAssociatedEntities } from '../hooks/useAssociatedEntities';

interface GemFormProps {
  gem?: Gem | null;
  onSubmit: (gem: any) => void;
  onCancel: () => void;
}

export const GemForm = ({ gem, onSubmit, onCancel }: GemFormProps) => {
  const { isOwner } = useAuth();
  const { fieldConfig } = useQRCodeSettings();
  const { partners } = usePartners();
  const { associatedEntities } = useAssociatedEntities();
  const { getGemTypes, getCuts, getTreatments, getColorsForGemType } = useGemSettings();
  const [formData, setFormData] = useState({
    gemType: 'Diamond',
    stockType: 'single',
    carat: '',
    cut: '',
    color: '',
    description: '',
    measurements: '',
    price: '',
    retailPrice: '',
    costPrice: '',
    certificateNumber: '',
    status: 'In Stock',
    notes: '',
    imageUrl: '',
    treatment: 'none',
    certificateType: 'none',
    supplier: '',
    purchaseDate: '',
    origin: '',
    inStock: '',
    ownershipStatus: 'O',
    associatedEntity: 'Self',
    partnerPercentage: ''
  });

  useEffect(() => {
    if (gem) {
      setFormData({
        gemType: gem.gemType,
        stockType: gem.stockType || 'single',
        carat: gem.carat.toString(),
        cut: gem.cut,
        color: gem.color,
        description: gem.description,
        measurements: gem.measurements,
        price: gem.price.toString(),
        retailPrice: (gem.retailPrice || gem.price).toString(),
        costPrice: gem.costPrice.toString(),
        certificateNumber: gem.certificateNumber,
        status: gem.status,
        notes: gem.notes || '',
        imageUrl: gem.imageUrl || '',
        treatment: gem.treatment || 'none',
        
        certificateType: gem.certificateType || 'none',
        supplier: gem.supplier || '',
        purchaseDate: gem.purchaseDate || '',
        origin: gem.origin || '',
        inStock: (gem.inStock || 0).toString(),
        ownershipStatus: gem.ownershipStatus || 'O',
        associatedEntity: gem.associatedEntity || 'Self',
        partnerPercentage: (gem.partnerPercentage || 0).toString()
      });
    }
  }, [gem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const gemData = {
      ...formData,
      carat: parseFloat(formData.carat),
      price: formData.price ? parseFloat(formData.price) : 0,
      retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      inStock: parseInt(formData.inStock) || 0,
      partnerPercentage: formData.ownershipStatus === 'P' ? (parseFloat(formData.partnerPercentage) || 0) : 0,
      purchaseDate: formData.purchaseDate || null,
      // Ensure required database fields have default values
      stockType: formData.stockType || 'single',
      treatment: formData.treatment || 'none',
      certificateType: formData.certificateType || 'none',
      color: formData.color || '',
      certificateNumber: formData.certificateNumber || '',
      ...(gem && { 
        id: gem.id, 
        stockId: gem.stockId, 
        dateAdded: gem.dateAdded,
        reserved: gem.reserved,
        sold: gem.sold
      })
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
      // Handle stock type constraints
      if (field === 'stockType') {
        if (value === 'single') {
          newData.inStock = '1';
        }
      }
      // Handle ownership status changes
      if (field === 'ownershipStatus') {
        if (value === 'O') {
          newData.associatedEntity = 'Self';
          newData.partnerPercentage = '';
        } else {
          newData.associatedEntity = '';
          if (value === 'P') {
            newData.partnerPercentage = '50';
          } else {
            newData.partnerPercentage = '';
          }
        }
      }
      return newData;
    });
  };

  const gemTypes = getGemTypes();
  const cuts = getCuts();
  const treatments = getTreatments();
  const availableColors = getColorsForGemType(formData.gemType) || [];

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="diamond-sparkle">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GemIcon className="w-5 h-5 text-slate-600" />
                <span>Gem Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gemType">Gem Type *</Label>
                    <Select value={formData.gemType} onValueChange={(value) => handleChange('gemType', value)} required>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select gem type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {gemTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockType">Stock Type *</Label>
                    <Select value={formData.stockType} onValueChange={(value) => handleChange('stockType', value)} required>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select stock type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="single">Single Gem (Quantity: 1)</SelectItem>
                        <SelectItem value="parcel">Parcel (Multiple gems, different sizes)</SelectItem>
                        <SelectItem value="set">Set (Same size and carat)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carat">Carat Weight *</Label>
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
                    <Label htmlFor="cut">Cut *</Label>
                    <Select value={formData.cut} onValueChange={(value) => handleChange('cut', value)} required>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select cut" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {cuts.map((cut) => (
                          <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color *</Label>
                    <Select value={formData.color} onValueChange={(value) => handleChange('color', value)} required>
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter gem description..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurements">Measurements</Label>
                    <Input
                      id="measurements"
                      placeholder="e.g., 7.5 x 5.2 x 3.1 mm"
                      value={formData.measurements}
                      onChange={(e) => handleChange('measurements', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Selling Price/Carat (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="4000"
                      value={formData.carat && formData.price ? (parseFloat(formData.price) / parseFloat(formData.carat)).toFixed(2) : ''}
                      onChange={(e) => {
                        const pricePerCarat = parseFloat(e.target.value) || 0;
                        const carat = parseFloat(formData.carat) || 1;
                        const totalPrice = (pricePerCarat * carat).toString();
                        handleChange('price', totalPrice);
                      }}
                      className="bg-slate-50 border-slate-200"
                      autoFocus={false}
                       onFocus={(e) => {
                         // Only select all if coming from outside the input (keyboard navigation)
                         if (!e.relatedTarget || e.relatedTarget !== e.target) {
                           const target = e.target as HTMLInputElement;
                           const wasClicked = target.dataset.wasClicked === "true";
                           if (!wasClicked) {
                             setTimeout(() => target.select(), 0);
                           }
                         }
                         (e.target as HTMLInputElement).dataset.wasClicked = "false";
                       }}
                       onMouseDown={(e) => {
                         // Mark that this focus came from a mouse click
                         (e.target as HTMLInputElement).dataset.wasClicked = "true";
                       }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">Retail Price/Carat (USD)</Label>
                    <Input
                      id="retailPrice"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      value={formData.carat && formData.retailPrice ? (parseFloat(formData.retailPrice) / parseFloat(formData.carat)).toFixed(2) : ''}
                      onChange={(e) => {
                        const retailPricePerCarat = parseFloat(e.target.value) || 0;
                        const carat = parseFloat(formData.carat) || 1;
                        const totalRetailPrice = (retailPricePerCarat * carat).toString();
                        handleChange('retailPrice', totalRetailPrice);
                      }}
                      className="bg-slate-50 border-slate-200"
                       onFocus={(e) => {
                         // Only select all if coming from outside the input (keyboard navigation)
                         if (!e.relatedTarget || e.relatedTarget !== e.target) {
                           const target = e.target as HTMLInputElement;
                           const wasClicked = target.dataset.wasClicked === "true";
                           if (!wasClicked) {
                             setTimeout(() => target.select(), 0);
                           }
                         }
                         (e.target as HTMLInputElement).dataset.wasClicked = "false";
                       }}
                       onMouseDown={(e) => {
                         // Mark that this focus came from a mouse click
                         (e.target as HTMLInputElement).dataset.wasClicked = "true";
                       }}
                    />
                  </div>

                  {isOwner && (
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price/Carat (USD) *</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        placeholder="2500"
                        value={formData.carat && formData.costPrice ? (parseFloat(formData.costPrice) / parseFloat(formData.carat)).toFixed(2) : ''}
                        onChange={(e) => {
                          const costPricePerCarat = parseFloat(e.target.value) || 0;
                          const carat = parseFloat(formData.carat) || 1;
                          const totalCostPrice = (costPricePerCarat * carat).toString();
                          handleChange('costPrice', totalCostPrice);
                        }}
                        required
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

                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment</Label>
                    <Select value={formData.treatment} onValueChange={(value) => handleChange('treatment', value)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select treatment" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="none">None</SelectItem>
                        {treatments.map((treatment) => (
                          <SelectItem key={treatment} value={treatment}>
                            {treatment} - {treatment === 'H' ? 'Heated' : treatment === 'NH' ? 'No Heat' : treatment === 'NO' ? 'No Oil' : 'Minor'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateType">Certificate Type</Label>
                    <Select value={formData.certificateType} onValueChange={(value) => handleChange('certificateType', value)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="none">None</SelectItem>
                        {CERTIFICATE_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      placeholder="e.g., Bangkok Gem Co."
                      value={formData.supplier}
                      onChange={(e) => handleChange('supplier', e.target.value)}
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
                     <Label htmlFor="origin">Origin</Label>
                     <Input
                       id="origin"
                       placeholder="e.g., Burma, Ceylon, Thailand"
                       value={formData.origin}
                       onChange={(e) => handleChange('origin', e.target.value)}
                       className="bg-slate-50 border-slate-200"
                     />
                   </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownershipStatus">Ownership Status</Label>
                      <Select value={formData.ownershipStatus} onValueChange={(value) => handleChange('ownershipStatus', value)}>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select ownership status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          {OWNERSHIP_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="associatedEntity">Associated Entity</Label>
                      {formData.ownershipStatus === 'O' ? (
                        <Input
                          id="associatedEntity"
                          value="Self"
                          className="bg-slate-50 border-slate-200"
                          disabled
                        />
                      ) : (
                        <Select 
                          value={formData.associatedEntity} 
                          onValueChange={(value) => handleChange('associatedEntity', value)}
                        >
                           <SelectTrigger className="bg-slate-50 border-slate-200">
                             <SelectValue placeholder={
                               formData.ownershipStatus === 'P' ? 'Select partner' :
                               formData.ownershipStatus === 'M' ? 'Select company/entity' :
                               'Select entity'
                             } />
                           </SelectTrigger>
                           <SelectContent className="bg-white border-slate-200">
                             {formData.ownershipStatus === 'P' && partners.map((partner) => (
                               <SelectItem key={partner.id} value={partner.name}>
                                 {partner.name} {partner.company && `(${partner.company})`}
                               </SelectItem>
                             ))}
                             {formData.ownershipStatus === 'M' && associatedEntities.map((entity) => (
                               <SelectItem key={entity.id} value={entity.name}>
                                 {entity.name} {entity.company && `(${entity.company})`}
                               </SelectItem>
                             ))}
                           </SelectContent>
                        </Select>
                      )}
                     </div>

                     {formData.ownershipStatus === 'P' && (
                       <div className="space-y-2">
                         <Label htmlFor="partnerPercentage">Partner Percentage *</Label>
                         <Input
                           id="partnerPercentage"
                           type="number"
                           min="0"
                           max="100"
                           step="0.01"
                           placeholder="50"
                           value={formData.partnerPercentage}
                           onChange={(e) => handleChange('partnerPercentage', e.target.value)}
                           className="bg-slate-50 border-slate-200"
                           required
                         />
                         <p className="text-sm text-muted-foreground">
                           Percentage of revenue that goes to the partner for this specific gem
                         </p>
                       </div>
                     )}

                     <div className="space-y-2">
                       <Label htmlFor="inStock">In Stock Quantity</Label>
                      <Input
                        id="inStock"
                        type="number"
                        placeholder={formData.stockType === 'single' ? '1' : '20'}
                        value={formData.inStock}
                        onChange={(e) => handleChange('inStock', e.target.value)}
                        className="bg-slate-50 border-slate-200"
                        min={formData.stockType === 'single' ? '1' : '0'}
                        max={formData.stockType === 'single' ? '1' : undefined}
                        disabled={formData.stockType === 'single'}
                      />
                    </div>
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input
                    id="certificateNumber"
                    placeholder="GIA-1234567890"
                    value={formData.certificateNumber}
                    onChange={(e) => handleChange('certificateNumber', e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <FileUpload
                  bucket="gem-images"
                  folder="gems"
                  accept="image/*"
                  maxSize={5}
                  onUpload={(url) => handleChange('imageUrl', url)}
                  currentFile={formData.imageUrl}
                  label="Gem Image"
                />

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

        {/* Certificates and QR Code Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Certificates Manager */}
          {gem && (
            <GemCertificateManager 
              gemId={gem.id} 
              isEditing={true}
            />
          )}

          {/* QR Code Preview Section */}
          {gem && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRCodeDisplay 
                  gemData={{
                    stockId: gem.stockId,
                    gemType: gem.gemType,
                    carat: gem.carat,
                    color: gem.color,
                    cut: gem.cut,
                    measurements: gem.measurements || '',
                    certificateNumber: gem.certificateNumber,
                    price: gem.price,
                    pricePerCarat: gem.price / gem.carat,
                    costPrice: gem.costPrice || 0,
                    costPricePerCarat: (gem.costPrice || 0) / gem.carat,
                    description: gem.description,
                    origin: gem.origin,
                    treatment: gem.treatment,
                    supplier: gem.supplier,
                    dateAdded: gem.dateAdded
                  }}
                  fieldConfig={fieldConfig}
                  size="medium"
                  showPrint={true}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
