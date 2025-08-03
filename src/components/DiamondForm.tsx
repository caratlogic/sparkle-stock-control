import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Diamond as DiamondIcon, Image } from 'lucide-react';
import { Diamond, CUT_OPTIONS, COLOR_OPTIONS, CLARITY_OPTIONS, STATUS_OPTIONS } from '../types/diamond';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { FileUpload } from './ui/file-upload';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';
import { GemCertificateManager } from './GemCertificateManager';
import { usePartners } from '../hooks/usePartners';
import { useAssociatedEntities } from '../hooks/useAssociatedEntities';
import { useSuppliers } from '../hooks/useSuppliers';
import { usePurchases } from '../hooks/usePurchases';

interface DiamondFormProps {
  diamond?: Diamond | null;
  onSubmit: (diamond: any) => void;
  onCancel: () => void;
}

const OWNERSHIP_STATUS_OPTIONS = [
  { value: 'O', label: 'Owned' },
  { value: 'P', label: 'Partner' },
  { value: 'M', label: 'Memo' }
];

const STOCK_TYPE_OPTIONS = ['single', 'parcel', 'set'];
const TREATMENT_OPTIONS = ['none', 'HPHT', 'CVD', 'Enhanced', 'Natural'];
const CERTIFICATE_TYPE_OPTIONS = ['none', 'GIA', 'AGS', 'IGI', 'EGL', 'GCAL'];

export const DiamondForm = ({ diamond, onSubmit, onCancel }: DiamondFormProps) => {
  const { isOwner } = useAuth();
  const { fieldConfig } = useQRCodeSettings();
  const { partners } = usePartners();
  const { associatedEntities } = useAssociatedEntities();
  const { suppliers } = useSuppliers();
  const { purchases } = usePurchases();

  const [formData, setFormData] = useState({
    stockNumber: diamond?.stock_number || '',
    stockType: diamond?.stock_type || 'single',
    weight: diamond?.weight?.toString() || '',
    shape: diamond?.shape || '',
    color: diamond?.color || '',
    clarity: diamond?.clarity || '',
    cutGrade: diamond?.cut_grade || '',
    polish: diamond?.polish || '',
    symmetry: diamond?.symmetry || '',
    fluorescenceIntensity: diamond?.fluorescence_intensity || '',
    fluorescenceColor: diamond?.fluorescence_color || '',
    lab: diamond?.lab || '',
    measurements: diamond?.measurements || '',
    depthPercent: diamond?.depth_percent?.toString() || '',
    tablePercent: diamond?.table_percent?.toString() || '',
    girdlePercent: diamond?.girdle_percent?.toString() || '',
    crownHeight: diamond?.crown_height?.toString() || '',
    crownAngle: diamond?.crown_angle?.toString() || '',
    pavilionDepth: diamond?.pavilion_depth?.toString() || '',
    pavilionAngle: diamond?.pavilion_angle?.toString() || '',
    starLength: diamond?.star_length?.toString() || '',
    girdleThin: diamond?.girdle_thin || '',
    girdleThick: diamond?.girdle_thick || '',
    girdleCondition: diamond?.girdle_condition || '',
    culetSize: diamond?.culet_size || '',
    culetCondition: diamond?.culet_condition || '',
    retailPrice: diamond?.retail_price?.toString() || '',
    costPrice: diamond?.cost_price?.toString() || '',
    cashPrice: diamond?.cash_price?.toString() || '',
    rapNetPrice: diamond?.rap_net_price?.toString() || '',
    rapNetDiscountPercent: diamond?.rap_net_discount_percent?.toString() || '',
    cashPriceDiscountPercent: diamond?.cash_price_discount_percent?.toString() || '',
    supplier: diamond?.supplier || '',
    purchaseId: '',
    purchaseDate: diamond?.purchase_date || '',
    origin: diamond?.origin || '',
    country: diamond?.country || '',
    state: diamond?.state || '',
    city: diamond?.city || '',
    status: diamond?.status || 'In Stock',
    availability: diamond?.availability || 'In Stock',
    certificateNumber: diamond?.report_number || '',
    certificateType: 'none',
    reportIssueDate: '',
    labLocation: '',
    laserInscription: '',
    certComment: '',
    keyToSymbols: '',
    memberComment: '',
    description: '',
    notes: diamond?.notes || '',
    imageUrl: '',
    image1: diamond?.image1 || '',
    image2: diamond?.image2 || '',
    image3: diamond?.image3 || '',
    videoUrl1: diamond?.video_url1 || '',
    videoUrl2: diamond?.video_url2 || '',
    treatment: diamond?.treatment || 'none',
    ownershipStatus: diamond?.ownership_status || 'O',
    associatedEntity: diamond?.associated_entity || 'Self',
    partnerPercentage: diamond?.partner_percentage?.toString() || '',
    inStock: diamond?.in_stock?.toString() || '1',
    reserved: diamond?.reserved?.toString() || '0',
    sold: diamond?.sold?.toString() || '0',
    parcelStones: diamond?.parcel_stones?.toString() || '1',
    eyeClean: diamond?.eye_clean || false,
    allowRapLinkFeed: diamond?.allow_rap_link_feed !== false,
    isMatchedPairSeparable: diamond?.is_matched_pair_separable || false,
    pairStockNumber: diamond?.pair_stock_number || '',
    fancyColor: diamond?.fancy_color || '',
    fancyColorIntensity: diamond?.fancy_color_intensity || '',
    fancyColorOvertone: diamond?.fancy_color_overtone || '',
    colorComment: diamond?.color_comment || 'none',
    shade: diamond?.shade || '',
    whiteInclusion: diamond?.white_inclusion || '',
    blackInclusion: diamond?.black_inclusion || '',
    openInclusion: diamond?.open_inclusion || '',
    milky: diamond?.milky || '',
    bgm: diamond?.bgm || '',
    boxNumber: '',
    oldCode: '',
    stoneDescription: '',
    shapeDetail: '',
    brand: diamond?.brand || '',
    sellerSpec: diamond?.seller_spec || '',
    sarineLoupe: diamond?.sarine_loupe || '',
    reportFileName: diamond?.report_file_name || '',
    report2FileName: diamond?.report2_file_name || '',
    websiteLink: diamond?.website_link || '',
    document1: diamond?.document1 || '',
    document2: diamond?.document2 || '',
    document3: diamond?.document3 || '',
    document1Type: diamond?.document1_type || '',
    document2Type: diamond?.document2_type || '',
    document3Type: diamond?.document3_type || '',
    tradeShow: diamond?.trade_show || '',
    measurementsMm: '',
    reportType: '',
    priceInLetters: '',
    totalInLetters: ''
  });

  useEffect(() => {
    if (!diamond) {
      // Generate stock number for new diamonds
      const timestamp = Date.now();
      const stockNumber = `DM${timestamp.toString().slice(-8)}`;
      setFormData(prev => ({ ...prev, stockNumber }));
    }
  }, [diamond]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-populate cost price from linked purchase if not set
    let finalCostPrice = parseFloat(formData.costPrice) || 0;
    if (!finalCostPrice && formData.purchaseId) {
      const linkedPurchase = purchases.find(p => p.id === formData.purchaseId);
      if (linkedPurchase && linkedPurchase.subtotal && linkedPurchase.items?.length) {
        const totalCarats = linkedPurchase.items.reduce((sum, item) => sum + item.carat, 0);
        if (totalCarats > 0) {
          finalCostPrice = linkedPurchase.subtotal / totalCarats;
        }
      }
    }

    const diamondData = {
      stock_number: formData.stockNumber,
      stock_type: formData.stockType,
      weight: parseFloat(formData.weight),
      shape: formData.shape,
      color: formData.color,
      clarity: formData.clarity,
      cut_grade: formData.cutGrade,
      polish: formData.polish,
      symmetry: formData.symmetry,
      fluorescence_intensity: formData.fluorescenceIntensity,
      fluorescence_color: formData.fluorescenceColor,
      lab: formData.lab,
      measurements: formData.measurements,
      depth_percent: formData.depthPercent ? parseFloat(formData.depthPercent) : null,
      table_percent: formData.tablePercent ? parseFloat(formData.tablePercent) : null,
      girdle_percent: formData.girdlePercent ? parseFloat(formData.girdlePercent) : null,
      crown_height: formData.crownHeight ? parseFloat(formData.crownHeight) : null,
      crown_angle: formData.crownAngle ? parseFloat(formData.crownAngle) : null,
      pavilion_depth: formData.pavilionDepth ? parseFloat(formData.pavilionDepth) : null,
      pavilion_angle: formData.pavilionAngle ? parseFloat(formData.pavilionAngle) : null,
      star_length: formData.starLength ? parseFloat(formData.starLength) : null,
      girdle_thin: formData.girdleThin,
      girdle_thick: formData.girdleThick,
      girdle_condition: formData.girdleCondition,
      culet_size: formData.culetSize,
      culet_condition: formData.culetCondition,
      retail_price: parseFloat(formData.retailPrice) || 0,
      cost_price: finalCostPrice,
      cash_price: parseFloat(formData.cashPrice) || 0,
      rap_net_price: formData.rapNetPrice ? parseFloat(formData.rapNetPrice) : null,
      rap_net_discount_percent: formData.rapNetDiscountPercent ? parseFloat(formData.rapNetDiscountPercent) : null,
      cash_price_discount_percent: formData.cashPriceDiscountPercent ? parseFloat(formData.cashPriceDiscountPercent) : null,
      supplier: formData.supplier ? (suppliers.find(s => s.id === formData.supplier)?.name || formData.supplier) : '',
      purchase_date: formData.purchaseDate || null,
      origin: formData.origin,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      status: formData.status,
      availability: formData.availability,
      report_number: formData.certificateNumber,
      certificate_type: formData.certificateType,
      report_issue_date: formData.reportIssueDate || null,
      lab_location: formData.labLocation,
      laser_inscription: formData.laserInscription,
      cert_comment: formData.certComment,
      key_to_symbols: formData.keyToSymbols,
      member_comment: formData.memberComment,
      description: formData.description,
      notes: formData.purchaseId ? 
        `${formData.notes ? formData.notes + '\n' : ''}Linked to Purchase: ${purchases.find(p => p.id === formData.purchaseId)?.purchase_id || formData.purchaseId}`.trim() : 
        formData.notes,
      image_url: formData.imageUrl,
      image1: formData.image1,
      image2: formData.image2,
      image3: formData.image3,
      video_url1: formData.videoUrl1,
      video_url2: formData.videoUrl2,
      treatment: formData.treatment,
      ownership_status: formData.ownershipStatus,
      associated_entity: formData.associatedEntity,
      partner_percentage: formData.ownershipStatus === 'P' ? (parseFloat(formData.partnerPercentage) || 0) : 0,
      in_stock: parseInt(formData.inStock) || 0,
      reserved: parseInt(formData.reserved) || 0,
      sold: parseInt(formData.sold) || 0,
      parcel_stones: parseInt(formData.parcelStones) || 1,
      eye_clean: formData.eyeClean,
      allow_rap_link_feed: formData.allowRapLinkFeed,
      is_matched_pair_separable: formData.isMatchedPairSeparable,
      pair_stock_number: formData.pairStockNumber,
      fancy_color: formData.fancyColor,
      fancy_color_intensity: formData.fancyColorIntensity,
      fancy_color_overtone: formData.fancyColorOvertone,
      color_comment: formData.colorComment,
      shade: formData.shade,
      white_inclusion: formData.whiteInclusion,
      black_inclusion: formData.blackInclusion,
      open_inclusion: formData.openInclusion,
      milky: formData.milky,
      bgm: formData.bgm,
      box_number: formData.boxNumber,
      old_code: formData.oldCode,
      stone_description: formData.stoneDescription,
      shape_detail: formData.shapeDetail,
      brand: formData.brand,
      seller_spec: formData.sellerSpec,
      sarine_loupe: formData.sarineLoupe,
      report_file_name: formData.reportFileName,
      report2_file_name: formData.report2FileName,
      website_link: formData.websiteLink,
      document1: formData.document1,
      document2: formData.document2,
      document3: formData.document3,
      document1_type: formData.document1Type,
      document2_type: formData.document2Type,
      document3_type: formData.document3Type,
      trade_show: formData.tradeShow,
      measurements_mm: formData.measurementsMm,
      report_type: formData.reportType,
      price_in_letters: formData.priceInLetters,
      total_in_letters: formData.totalInLetters,
      ...(diamond && { 
        id: diamond.id, 
        created_at: diamond.created_at,
        updated_at: diamond.updated_at,
        date_added: diamond.date_added,
        updated_by: diamond.updated_by
      })
    };

    onSubmit(diamondData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Handle stock type constraints
      if (field === 'stockType') {
        if (value === 'single') {
          newData.inStock = '1';
          newData.parcelStones = '1';
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onCancel} className="p-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                    <Label htmlFor="stockNumber">Stock Number *</Label>
                    <Input
                      id="stockNumber"
                      placeholder="DM12345678"
                      value={formData.stockNumber}
                      onChange={(e) => handleChange('stockNumber', e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockType">Stock Type *</Label>
                    <Select value={formData.stockType} onValueChange={(value) => handleChange('stockType', value)} required>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select stock type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="single">Single Diamond (Quantity: 1)</SelectItem>
                        <SelectItem value="parcel">Parcel (Multiple diamonds, different sizes)</SelectItem>
                        <SelectItem value="set">Set (Same size and carat)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Carat Weight *</Label>
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
                    <Label htmlFor="shape">Shape *</Label>
                    <Select value={formData.shape} onValueChange={(value) => handleChange('shape', value)} required>
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
                    <Label htmlFor="color">Color *</Label>
                    <Select value={formData.color} onValueChange={(value) => handleChange('color', value)} required>
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
                    <Label htmlFor="clarity">Clarity *</Label>
                    <Select value={formData.clarity} onValueChange={(value) => handleChange('clarity', value)} required>
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
                    <Label htmlFor="cutGrade">Cut Grade</Label>
                    <Select value={formData.cutGrade} onValueChange={(value) => handleChange('cutGrade', value)}>
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
                    <Label htmlFor="fluorescenceIntensity">Fluorescence</Label>
                    <Select value={formData.fluorescenceIntensity} onValueChange={(value) => handleChange('fluorescenceIntensity', value)}>
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
                        {['GIA', 'IGI', 'AGS', 'EGL', 'GCAL', 'SSEF', 'Gübelin'].map((lab) => (
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
                    <Label htmlFor="depthPercent">Depth %</Label>
                    <Input
                      id="depthPercent"
                      type="number"
                      step="0.1"
                      placeholder="61.8"
                      value={formData.depthPercent}
                      onChange={(e) => handleChange('depthPercent', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tablePercent">Table %</Label>
                    <Input
                      id="tablePercent"
                      type="number"
                      step="0.1"
                      placeholder="57.0"
                      value={formData.tablePercent}
                      onChange={(e) => handleChange('tablePercent', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">Selling Price/Carat (USD)</Label>
                    <Input
                      id="retailPrice"
                      type="number"
                      step="0.01"
                      placeholder="4000"
                      value={formData.weight && formData.retailPrice ? (parseFloat(formData.retailPrice) / parseFloat(formData.weight)).toFixed(2) : ''}
                      onChange={(e) => {
                        const pricePerCarat = parseFloat(e.target.value) || 0;
                        const carat = parseFloat(formData.weight) || 1;
                        const totalPrice = (pricePerCarat * carat).toString();
                        handleChange('retailPrice', totalPrice);
                      }}
                      className="bg-slate-50 border-slate-200"
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
                        value={formData.weight && formData.costPrice ? (parseFloat(formData.costPrice) / parseFloat(formData.weight)).toFixed(2) : ''}
                        onChange={(e) => {
                          const costPricePerCarat = parseFloat(e.target.value) || 0;
                          const carat = parseFloat(formData.weight) || 1;
                          const totalCostPrice = (costPricePerCarat * carat).toString();
                          handleChange('costPrice', totalCostPrice);
                        }}
                        required
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="cashPrice">Cash Price (USD)</Label>
                    <Input
                      id="cashPrice"
                      type="number"
                      placeholder="11000"
                      value={formData.cashPrice}
                      onChange={(e) => handleChange('cashPrice', e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rapNetPrice">RAP Net Price (USD)</Label>
                    <Input
                      id="rapNetPrice"
                      type="number"
                      placeholder="15000"
                      value={formData.rapNetPrice}
                      onChange={(e) => handleChange('rapNetPrice', e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment</Label>
                    <Select value={formData.treatment} onValueChange={(value) => handleChange('treatment', value)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select treatment" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="none">None</SelectItem>
                        {TREATMENT_OPTIONS.filter(treatment => treatment !== 'none').map((treatment) => (
                          <SelectItem key={treatment} value={treatment}>{treatment}</SelectItem>
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
                        {CERTIFICATE_TYPE_OPTIONS.filter(type => type !== 'none').map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={formData.supplier || "none"}
                      onValueChange={(value) => {
                        const actualValue = value === "none" ? "" : value;
                        handleChange('supplier', actualValue);
                        // Auto-populate origin from supplier's country
                        if (actualValue) {
                          const selectedSupplier = suppliers.find(s => s.id === actualValue);
                          if (selectedSupplier && !formData.origin) {
                            handleChange('origin', selectedSupplier.country);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="none">None / Free text entry</SelectItem>
                        {suppliers.filter(s => s.status === 'active').map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.supplier_id}) - {supplier.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.supplier && suppliers.find(s => s.id === formData.supplier) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {(() => {
                          const supplier = suppliers.find(s => s.id === formData.supplier);
                          return supplier ? (
                            <div className="space-y-1">
                              <p><strong>Contact:</strong> {supplier.email} {supplier.phone ? `| ${supplier.phone}` : ''}</p>
                              <p><strong>Rating:</strong> {supplier.reliability_rating}/5 stars | <strong>Terms:</strong> {supplier.payment_terms}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseId">Purchase ID (Optional)</Label>
                    <Select
                      value={formData.purchaseId || "manual"}
                      onValueChange={(value) => {
                        const actualValue = value === "manual" ? "" : value;
                        handleChange('purchaseId', actualValue);
                        // Auto-populate data from selected purchase
                        if (actualValue) {
                          const selectedPurchase = purchases.find(p => p.id === actualValue);
                          if (selectedPurchase) {
                            if (!formData.purchaseDate) {
                              handleChange('purchaseDate', selectedPurchase.purchase_date);
                            }
                            if (!formData.supplier && selectedPurchase.supplier_id) {
                              handleChange('supplier', selectedPurchase.supplier_id);
                            }
                            // Auto-populate origin from supplier
                            const supplier = suppliers.find(s => s.id === selectedPurchase.supplier_id);
                            if (supplier && !formData.origin) {
                              handleChange('origin', supplier.country);
                            }
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Link to purchase order" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="manual">None / Manual entry</SelectItem>
                        {purchases
                          .filter(p => p.status !== 'overdue')
                          .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
                          .map((purchase) => (
                          <SelectItem key={purchase.id} value={purchase.id}>
                            {purchase.purchase_id} - {purchase.supplier?.name || 'Unknown'} ({purchase.purchase_date})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="e.g., Botswana, Canada, Russia"
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
                         Percentage of revenue that goes to the partner for this specific diamond
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
                  folder="diamonds"
                  accept="image/*"
                  maxSize={5}
                  onUpload={(url) => handleChange('imageUrl', url)}
                  currentFile={formData.imageUrl}
                  label="Diamond Image"
                />

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

        {/* Certificates and QR Code Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Certificates Manager */}
          {diamond && (
            <GemCertificateManager 
              gemId={diamond.id} 
              isEditing={true}
            />
          )}

          {/* QR Code Preview Section */}
          {diamond && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRCodeDisplay 
                  gemData={{
                    stockId: diamond.stock_number,
                    gemType: 'Diamond',
                    carat: diamond.weight,
                    color: diamond.color,
                    cut: diamond.shape,
                    measurements: diamond.measurements || '',
                    certificateNumber: diamond.report_number,
                    price: diamond.retail_price,
                    pricePerCarat: diamond.retail_price / diamond.weight,
                    costPrice: diamond.cost_price || 0,
                    costPricePerCarat: (diamond.cost_price || 0) / diamond.weight,
                    description: '',
                    origin: diamond.origin,
                    treatment: diamond.treatment,
                    supplier: diamond.supplier,
                    dateAdded: diamond.date_added
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