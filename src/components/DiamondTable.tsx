import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSelector, ColumnConfig } from '@/components/ui/column-selector';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Download,
  FileText,
  Handshake,
  Plus,
  Eye,
  X,
  Mail,
  Upload,
  Printer
} from 'lucide-react';
import { Diamond, CUT_OPTIONS, COLOR_OPTIONS, CLARITY_OPTIONS, STATUS_OPTIONS } from '../types/diamond';
import { DiamondDetailView } from './DiamondDetailView';
import { DiamondTransactionHistory } from './DiamondTransactionHistory';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useAuth } from '../contexts/AuthContext';
import { ColumnCustomizer } from './ColumnCustomizer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';
// import { DiamondSelectionEmail } from './DiamondSelectionEmail';
// import { DiamondQuotationCreation } from './DiamondQuotationCreation';
// import { BulkDiamondUpload } from './BulkDiamondUpload';
import { useCustomers } from '../hooks/useCustomers';
import { MultiCriteriaSearch } from './MultiCriteriaSearch';
import { ThemeSwitcher } from './ThemeSwitcher';
import { printAllQRCodes } from '../utils/qrCodeGenerator';

interface DiamondTableProps {
  diamonds: Diamond[];
  onEdit: (diamond: Diamond) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  onCreateInvoice?: (diamond: Diamond) => void;
  onCreateConsignment?: (diamond: Diamond) => void;
}

export const DiamondTable = ({ 
  diamonds, 
  onEdit, 
  onDelete,
  onAdd,
  onCreateInvoice, 
  onCreateConsignment 
}: DiamondTableProps) => {
  const { isOwner, user } = useAuth();
  const { toast } = useToast();
  const { fieldConfig } = useQRCodeSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShape, setFilterShape] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCut, setFilterCut] = useState('all');
  const [filterColor, setFilterColor] = useState('all');
  const [filterClarity, setFilterClarity] = useState('all');
  const [weightRange, setWeightRange] = useState({ min: '', max: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortField, setSortField] = useState<keyof Diamond | 'pricePerCarat'>('date_added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [transactionHistoryDiamond, setTransactionHistoryDiamond] = useState<Diamond | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [customColumnLabels, setCustomColumnLabels] = useState<Record<string, string>>({});
  const [showDiamondSelection, setShowDiamondSelection] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<any[]>([]);
  const [selectedDiamonds, setSelectedDiamonds] = useState<Set<string>>(new Set());
  
  const { customers } = useCustomers();

  // Default column configuration with custom labels support
  const getDefaultColumns = (): ColumnConfig[] => [
    { key: 'select', label: 'Select', visible: true, mandatory: true, order: 0 },
    { key: 'image', label: customColumnLabels['image'] || 'Image', visible: true, order: 1 },
    { key: 'stockNumber', label: customColumnLabels['stockNumber'] || 'Stock #', visible: true, mandatory: true, order: 2 },
    { key: 'weight', label: customColumnLabels['weight'] || 'Weight', visible: true, order: 3 },
    { key: 'shape', label: customColumnLabels['shape'] || 'Shape', visible: true, order: 4 },
    { key: 'color', label: customColumnLabels['color'] || 'Color', visible: true, order: 5 },
    { key: 'clarity', label: customColumnLabels['clarity'] || 'Clarity', visible: true, order: 6 },
    { key: 'cutGrade', label: customColumnLabels['cutGrade'] || 'Cut', visible: true, order: 7 },
    { key: 'pricePerCarat', label: customColumnLabels['pricePerCarat'] || 'Price/Carat', visible: true, order: 8 },
    { key: 'totalPrice', label: customColumnLabels['totalPrice'] || 'Total Price', visible: true, order: 9 },
    { key: 'costPrice', label: customColumnLabels['costPrice'] || 'Cost Price', visible: isOwner, order: 10 },
    { key: 'lab', label: customColumnLabels['lab'] || 'Lab', visible: true, order: 11 },
    { key: 'reportNumber', label: customColumnLabels['reportNumber'] || 'Report #', visible: true, order: 12 },
    { key: 'fluorescence', label: customColumnLabels['fluorescence'] || 'Fluorescence', visible: false, order: 13 },
    { key: 'polish', label: customColumnLabels['polish'] || 'Polish', visible: false, order: 14 },
    { key: 'symmetry', label: customColumnLabels['symmetry'] || 'Symmetry', visible: false, order: 15 },
    { key: 'depthPercent', label: customColumnLabels['depthPercent'] || 'Depth %', visible: false, order: 16 },
    { key: 'tablePercent', label: customColumnLabels['tablePercent'] || 'Table %', visible: false, order: 17 },
    { key: 'measurements', label: customColumnLabels['measurements'] || 'Measurements', visible: false, order: 18 },
    { key: 'supplier', label: customColumnLabels['supplier'] || 'Supplier', visible: false, order: 19 },
    { key: 'purchaseDate', label: customColumnLabels['purchaseDate'] || 'Purchase Date', visible: false, order: 20 },
    { key: 'origin', label: customColumnLabels['origin'] || 'Origin', visible: false, order: 21 },
    { key: 'ownershipStatus', label: customColumnLabels['ownershipStatus'] || 'Ownership Status', visible: true, order: 22 },
    { key: 'associatedEntity', label: customColumnLabels['associatedEntity'] || 'Associated Entity', visible: true, order: 23 },
    { key: 'inStock', label: customColumnLabels['inStock'] || 'In Stock', visible: true, order: 24 },
    { key: 'reserved', label: customColumnLabels['reserved'] || 'Reserved', visible: true, order: 25 },
    { key: 'sold', label: customColumnLabels['sold'] || 'Sold', visible: true, order: 26 },
    { key: 'status', label: customColumnLabels['status'] || 'Status', visible: true, order: 27 },
    { key: 'dateAdded', label: customColumnLabels['dateAdded'] || 'Date Added', visible: true, order: 28 },
    { key: 'updatedBy', label: customColumnLabels['updatedBy'] || 'Updated By', visible: true, order: 29 },
    { key: 'lastUpdated', label: customColumnLabels['lastUpdated'] || 'Last Updated', visible: true, order: 30 },
    { key: 'actions', label: customColumnLabels['actions'] || 'Actions', visible: true, mandatory: true, order: 31 },
    { key: 'qrcode', label: customColumnLabels['qrcode'] || 'QR Code', visible: true, order: 32 },
  ];

  const [columns, setColumns] = useState<ColumnConfig[]>(getDefaultColumns());

  // Load custom column labels on component mount
  useEffect(() => {
    if (user?.email) {
      loadColumnCustomizations();
    }
  }, [user?.email]);

  // Update columns when custom labels change
  useEffect(() => {
    setColumns(getDefaultColumns());
  }, [customColumnLabels]);

  const loadColumnCustomizations = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('column_customizations')
        .select('column_key, display_name')
        .eq('user_email', user.email)
        .eq('table_name', 'diamonds');

      if (error) throw error;

      const customizations: Record<string, string> = {};
      data?.forEach(item => {
        customizations[item.column_key] = item.display_name;
      });

      setCustomColumnLabels(customizations);
    } catch (error) {
      console.error('Error loading column customizations:', error);
    }
  };

  const handleColumnCustomizationSave = (customizations: Record<string, string>) => {
    setCustomColumnLabels(customizations);
    toast({
      title: "Success",
      description: "Column names updated successfully"
    });
  };

  const customizableColumns = [
    { key: 'stockNumber', label: customColumnLabels['stockNumber'] || 'Stock #', defaultLabel: 'Stock #' },
    { key: 'weight', label: customColumnLabels['weight'] || 'Weight', defaultLabel: 'Weight' },
    { key: 'pricePerCarat', label: customColumnLabels['pricePerCarat'] || 'Price/Carat', defaultLabel: 'Price/Carat' },
    { key: 'totalPrice', label: customColumnLabels['totalPrice'] || 'Total Price', defaultLabel: 'Total Price' },
    { key: 'costPrice', label: customColumnLabels['costPrice'] || 'Cost Price', defaultLabel: 'Cost Price' },
    { key: 'lab', label: customColumnLabels['lab'] || 'Lab', defaultLabel: 'Lab' },
    { key: 'supplier', label: customColumnLabels['supplier'] || 'Supplier', defaultLabel: 'Supplier' },
  ];

  // Get visible columns sorted by order
  const visibleColumns = useMemo(() => 
    columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order),
    [columns]
  );

  // If a diamond is selected, show the detail view
  if (selectedDiamond) {
    return (
      <DiamondDetailView 
        diamond={selectedDiamond} 
        onBack={() => setSelectedDiamond(null)} 
      />
    );
  }

  // Get unique values for filter options and filter out empty strings
  const uniqueShapes = [...new Set(diamonds.map(diamond => diamond.shape))].filter(shape => shape && shape.trim() !== '').sort();
  const uniqueCuts = [...new Set(diamonds.map(diamond => diamond.cut_grade))].filter(cut => cut && cut.trim() !== '').sort();
  const uniqueColors = [...new Set(diamonds.map(diamond => diamond.color))].filter(color => color && color.trim() !== '').sort();
  const uniqueClarity = [...new Set(diamonds.map(diamond => diamond.clarity))].filter(clarity => clarity && clarity.trim() !== '').sort();

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterShape('all');
    setFilterStatus('all');
    setFilterCut('all');
    setFilterColor('all');
    setFilterClarity('all');
    setWeightRange({ min: '', max: '' });
    setPriceRange({ min: '', max: '' });
  };

  // Apply advanced search criteria
  const applyAdvancedSearch = (diamond: Diamond, criteria: any[]) => {
    return criteria.every(criterion => {
      const fieldValue = diamond[criterion.field as keyof Diamond];
      const searchValue = criterion.value.toLowerCase();
      
      switch (criterion.operator) {
        case 'contains':
          return String(fieldValue).toLowerCase().includes(searchValue);
        case 'equals':
          return String(fieldValue).toLowerCase() === searchValue;
        case 'starts_with':
          return String(fieldValue).toLowerCase().startsWith(searchValue);
        case 'ends_with':
          return String(fieldValue).toLowerCase().endsWith(searchValue);
        case 'greater_than':
          return Number(fieldValue) > Number(criterion.value);
        case 'less_than':
          return Number(fieldValue) < Number(criterion.value);
        default:
          return true;
      }
    });
  };

  // Filter and sort diamonds
  const filteredDiamonds = diamonds
    .filter((diamond) => {
      const matchesSearch = 
        (diamond.stock_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (diamond.report_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (diamond.shape?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (diamond.color?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (diamond.clarity?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (diamond.cut_grade?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesShape = filterShape === 'all' || diamond.shape === filterShape;
      const matchesStatus = filterStatus === 'all' || diamond.status === filterStatus;
      const matchesCut = filterCut === 'all' || diamond.cut_grade === filterCut;
      const matchesColor = filterColor === 'all' || diamond.color === filterColor;
      const matchesClarity = filterClarity === 'all' || diamond.clarity === filterClarity;
      
      const matchesWeightRange = (!weightRange.min || (diamond.weight || 0) >= parseFloat(weightRange.min)) &&
                               (!weightRange.max || (diamond.weight || 0) <= parseFloat(weightRange.max));
      
      const pricePerCarat = diamond.retail_price && diamond.weight ? diamond.retail_price / diamond.weight : 0;
      const matchesPriceRange = (!priceRange.min || pricePerCarat >= parseFloat(priceRange.min)) &&
                               (!priceRange.max || pricePerCarat <= parseFloat(priceRange.max));

      const matchesAdvancedSearch = searchCriteria.length === 0 || applyAdvancedSearch(diamond, searchCriteria);
      
      return matchesSearch && matchesShape && matchesStatus && matchesCut && 
             matchesColor && matchesClarity && matchesWeightRange && matchesPriceRange && matchesAdvancedSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'pricePerCarat') {
        aValue = a.retail_price && a.weight ? a.retail_price / a.weight : 0;
        bValue = b.retail_price && b.weight ? b.retail_price / b.weight : 0;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (field: keyof Diamond | 'pricePerCarat') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Stock #', 'Weight', 'Shape', 'Color', 'Clarity', 'Cut Grade', 'Price/Carat', 'Total Price', ...(isOwner ? ['Cost Price'] : []), 'Lab', 'Report #', 'Polish', 'Symmetry', 'Fluorescence', 'Depth %', 'Table %', 'Measurements', 'Supplier', 'Purchase Date', 'Origin', 'Ownership Status', 'Associated Entity', 'Status', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...filteredDiamonds.map(diamond => [
        diamond.stock_number,
        diamond.weight,
        diamond.shape,
        diamond.color,
        diamond.clarity,
        diamond.cut_grade,
        diamond.weight && diamond.retail_price ? (diamond.retail_price / diamond.weight).toFixed(2) : '',
        diamond.retail_price,
        ...(isOwner ? [diamond.cost_price] : []),
        diamond.lab || '',
        diamond.report_number || '',
        diamond.polish || '',
        diamond.symmetry || '',
        diamond.fluorescence_intensity || '',
        diamond.depth_percent || '',
        diamond.table_percent || '',
        diamond.measurements || '',
        diamond.supplier || '',
        diamond.purchase_date || '',
        diamond.origin || '',
        diamond.ownership_status === 'P' ? 'Partner Stone' : diamond.ownership_status === 'M' ? 'Memo' : 'Owned',
        diamond.associated_entity || 'Self',
        diamond.status,
        diamond.date_added
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diamond-inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

   const hasActiveFilters = filterShape !== 'all' || filterStatus !== 'all' || filterCut !== 'all' || 
                           filterColor !== 'all' || filterClarity !== 'all' || weightRange.min || weightRange.max || 
                           priceRange.min || priceRange.max || searchTerm;

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDiamonds(new Set(filteredDiamonds.map(diamond => diamond.id)));
    } else {
      setSelectedDiamonds(new Set());
    }
  };

  const handleSelectDiamond = (diamondId: string, checked: boolean) => {
    const newSelected = new Set(selectedDiamonds);
    if (checked) {
      newSelected.add(diamondId);
    } else {
      newSelected.delete(diamondId);
    }
    setSelectedDiamonds(newSelected);
  };

  const selectedDiamondsData = filteredDiamonds.filter(diamond => selectedDiamonds.has(diamond.id));

  const handlePrintQRCodes = async () => {
    try {
      // Create gem-like data for diamonds to use existing QR code functionality
      const gemLikeData = selectedDiamondsData.map(diamond => ({
        id: diamond.id,
        stockId: diamond.stock_number || '',
        gemType: 'Diamond',
        carat: diamond.weight || 0,
        cut: diamond.cut_grade || '',
        color: diamond.color || '',
        clarity: diamond.clarity || '',
        price: diamond.retail_price || 0,
        costPrice: diamond.cost_price || 0,
        certificateNumber: diamond.report_number || '',
        status: diamond.status,
        dateAdded: diamond.date_added,
        description: `${diamond.shape} ${diamond.clarity}`,
        origin: diamond.origin || '',
        treatment: 'none',
        supplier: diamond.supplier || '',
        measurements: diamond.measurements || ''
      }));
      
      // Use the existing printAllQRCodes with gem-like data
      await printAllQRCodes(gemLikeData as any, fieldConfig);
      toast({
        title: "Success",
        description: `Printed ${selectedDiamondsData.length} QR code(s)`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print QR codes",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <span>Diamond Inventory ({filteredDiamonds.length})</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {onAdd && (
              <Button onClick={onAdd} className="bg-diamond-gradient hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Diamond
              </Button>
            )}
            
            <Button 
              onClick={() => toast({ title: "Coming Soon", description: "Diamond email feature will be available soon" })}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={selectedDiamonds.size === 0}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Selected ({selectedDiamonds.size})
            </Button>

            <Button 
              onClick={() => toast({ title: "Coming Soon", description: "Diamond quotation feature will be available soon" })}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={selectedDiamonds.size === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Quotation ({selectedDiamonds.size})
            </Button>

            <Button 
              onClick={() => toast({ title: "Coming Soon", description: "Diamond bulk upload feature will be available soon" })}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>

            <Button 
              onClick={handlePrintQRCodes}
              className="bg-orange-600 hover:bg-orange-700"
              disabled={selectedDiamonds.size === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print QR Codes ({selectedDiamonds.size})
            </Button>

            <Button 
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              variant={showAdvancedSearch ? "default" : "outline"}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Search
            </Button>
            
            <ColumnSelector
              columns={columns}
              onColumnsChange={setColumns}
            />
            
            <Button 
              variant="outline" 
              onClick={() => setShowColumnCustomizer(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Customize Names
            </Button>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <ThemeSwitcher />
          </div>
        </div>

        {/* Advanced Search */}
        {showAdvancedSearch && (
          <MultiCriteriaSearch
            onSearch={setSearchCriteria}
            fields={[
              { key: 'stock_number', label: 'Stock #', type: 'text' },
              { key: 'shape', label: 'Shape', type: 'select', options: uniqueShapes },
              { key: 'weight', label: 'Weight', type: 'number' },
              { key: 'cut_grade', label: 'Cut Grade', type: 'select', options: uniqueCuts },
              { key: 'color', label: 'Color', type: 'select', options: uniqueColors },
              { key: 'clarity', label: 'Clarity', type: 'select', options: uniqueClarity },
              { key: 'report_number', label: 'Report Number', type: 'text' },
              { key: 'lab', label: 'Lab', type: 'text' },
              { key: 'supplier', label: 'Supplier', type: 'text' }
            ]}
          />
        )}

        {/* Search and Filters Section */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search diamonds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200"
              />
            </div>
            
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Row 1 */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterShape} onValueChange={setFilterShape}>
              <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Shape" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Shapes</SelectItem>
                {uniqueShapes.map(shape => (
                  <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCut} onValueChange={setFilterCut}>
              <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Cut Grade" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Cuts</SelectItem>
                {uniqueCuts.map(cut => (
                  <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterColor} onValueChange={setFilterColor}>
              <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Colors</SelectItem>
                {uniqueColors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterClarity} onValueChange={setFilterClarity}>
              <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Clarity" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Clarity</SelectItem>
                {uniqueClarity.map(clarity => (
                  <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Row 2 - Range Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">Weight:</span>
              <Input
                type="number"
                placeholder="Min"
                value={weightRange.min}
                onChange={(e) => setWeightRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-20 bg-slate-50 border-slate-200"
                step="0.01"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={weightRange.max}
                onChange={(e) => setWeightRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-20 bg-slate-50 border-slate-200"
                step="0.01"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">Price/Carat ($):</span>
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24 bg-slate-50 border-slate-200"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24 bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                {visibleColumns.map((column) => (
                  <th 
                    key={column.key}
                    className={`text-left py-3 px-4 font-medium text-slate-600 ${
                      ['stockNumber', 'weight', 'pricePerCarat', 'costPrice', 'dateAdded'].includes(column.key)
                        ? 'cursor-pointer hover:text-slate-800 transition-colors'
                        : ''
                    }`}
                    onClick={
                        ['stockNumber', 'weight', 'pricePerCarat', 'costPrice', 'dateAdded'].includes(column.key)
                        ? () => handleSort(column.key as keyof Diamond | 'pricePerCarat')
                        : undefined
                    }
                  >
                    {column.key === 'select' ? (
                      <input
                        type="checkbox"
                        checked={selectedDiamonds.size === filteredDiamonds.length && filteredDiamonds.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    ) : ['stockNumber', 'weight', 'pricePerCarat', 'costPrice', 'dateAdded'].includes(column.key) ? (
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    ) : (
                      <span>{column.label}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDiamonds.map((diamond) => (
                <tr key={diamond.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {visibleColumns.map((column) => {
                    const renderCell = () => {
                      switch (column.key) {
                        case 'select':
                          return (
                            <input
                              type="checkbox"
                              checked={selectedDiamonds.has(diamond.id)}
                              onChange={(e) => handleSelectDiamond(diamond.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          );
                        case 'image':
                          return (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                              {diamond.image1 ? (
                                <img 
                                  src={diamond.image1} 
                                  alt={diamond.shape || 'Diamond'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs">No Image</div>';
                                  }}
                                />
                              ) : (
                                <div className="text-slate-400 text-xs">No Image</div>
                              )}
                            </div>
                          );
                        case 'stockNumber':
                          return (
                            <button
                              onClick={() => setSelectedDiamond(diamond)}
                              className="font-medium text-slate-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                            >
                              {diamond.stock_number}
                            </button>
                          );
                        case 'weight':
                          return <div className="font-medium text-slate-800">{diamond.weight}ct</div>;
                        case 'shape':
                          return <div className="text-sm text-slate-600">{diamond.shape}</div>;
                        case 'color':
                          return <div className="text-sm text-slate-600">{diamond.color}</div>;
                        case 'clarity':
                          return <div className="text-sm text-slate-600">{diamond.clarity}</div>;
                        case 'cutGrade':
                          return <div className="text-sm text-slate-600">{diamond.cut_grade}</div>;
                         case 'pricePerCarat':
                           const pricePerCarat = diamond.retail_price && diamond.weight ? diamond.retail_price / diamond.weight : 0;
                           return <div className="font-semibold text-slate-800">${pricePerCarat.toFixed(0)}/ct</div>;
                         case 'totalPrice':
                           return <div className="font-semibold text-blue-600">${diamond.retail_price?.toLocaleString()}</div>;
                         case 'costPrice':
                           return isOwner ? <div className="font-medium text-emerald-600">${diamond.cost_price?.toLocaleString()}</div> : null;
                        case 'lab':
                          return <div className="text-sm text-slate-600">{diamond.lab || ''}</div>;
                        case 'reportNumber':
                          return <div className="text-sm text-slate-600 font-mono">{diamond.report_number}</div>;
                        case 'fluorescence':
                          return <div className="text-sm text-slate-600">{diamond.fluorescence_intensity || ''}</div>;
                        case 'polish':
                          return <div className="text-sm text-slate-600">{diamond.polish || ''}</div>;
                        case 'symmetry':
                          return <div className="text-sm text-slate-600">{diamond.symmetry || ''}</div>;
                        case 'depthPercent':
                          return <div className="text-sm text-slate-600">{diamond.depth_percent ? `${diamond.depth_percent}%` : ''}</div>;
                        case 'tablePercent':
                          return <div className="text-sm text-slate-600">{diamond.table_percent ? `${diamond.table_percent}%` : ''}</div>;
                        case 'measurements':
                          return <div className="text-sm text-slate-600">{diamond.measurements || ''}</div>;
                        case 'supplier':
                          return <div className="text-sm text-slate-600">{diamond.supplier || ''}</div>;
                        case 'purchaseDate':
                          return <div className="text-sm text-slate-600">{diamond.purchase_date || ''}</div>;
                        case 'origin':
                          return <div className="text-sm text-slate-600">{diamond.origin || ''}</div>;
                        case 'ownershipStatus':
                          const ownershipLabel = diamond.ownership_status === 'P' ? 'Partner Stone' : 
                                                diamond.ownership_status === 'M' ? 'Memo' : 'Owned';
                          const ownershipColor = diamond.ownership_status === 'P' ? 'text-blue-600' :
                                               diamond.ownership_status === 'M' ? 'text-orange-600' : 'text-green-600';
                          return <div className={`text-sm font-medium ${ownershipColor}`}>{ownershipLabel}</div>;
                        case 'associatedEntity':
                          return <div className="text-sm text-slate-600">{diamond.associated_entity || 'Self'}</div>;
                        case 'inStock':
                          return <div className="text-sm font-medium text-emerald-600">{diamond.in_stock || 0}</div>;
                        case 'reserved':
                          return (
                            <button
                              onClick={() => {
                                setTransactionHistoryDiamond(diamond);
                                setShowTransactionHistory(true);
                              }}
                              className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline cursor-pointer"
                            >
                              {diamond.reserved || 0}
                            </button>
                          );
                        case 'sold':
                          return (
                            <button
                              onClick={() => {
                                setTransactionHistoryDiamond(diamond);
                                setShowTransactionHistory(true);
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              {diamond.sold || 0}
                            </button>
                          );
                        case 'status':
                          return (
                            <Badge 
                              variant={
                                diamond.status === 'In Stock' ? 'secondary' : 
                                diamond.status === 'Sold' ? 'destructive' : 
                                diamond.status === 'Reserved' ? 'default' : 'secondary'
                              }
                            >
                              {diamond.status}
                            </Badge>
                          );
                        case 'updatedBy':
                          return (
                            <span className="text-sm text-slate-600">
                              {(diamond as any).updated_by || 'System'}
                            </span>
                          );

                        case 'lastUpdated':
                          return (
                            <span className="text-sm text-slate-600">
                              {(diamond as any).updated_at ? new Date((diamond as any).updated_at).toLocaleDateString() : '-'}
                            </span>
                          );

                         case 'qrcode':
                           return (
                             <div className="flex items-center space-x-2">
                                <QRCodeDisplay 
                                  gemData={{
                                    stockId: diamond.stock_number || '',
                                    gemType: 'Diamond',
                                    carat: diamond.weight || 0,
                                    color: diamond.color || '',
                                    cut: diamond.cut_grade || '',
                                    measurements: diamond.measurements || '',
                                    certificateNumber: diamond.report_number || '',
                                    price: diamond.retail_price || 0,
                                    pricePerCarat: diamond.weight && diamond.retail_price ? diamond.retail_price / diamond.weight : 0,
                                    costPrice: diamond.cost_price || 0,
                                    costPricePerCarat: diamond.weight && diamond.cost_price ? diamond.cost_price / diamond.weight : 0,
                                    description: `${diamond.shape} ${diamond.clarity}`,
                                    origin: diamond.origin,
                                    treatment: 'none',
                                    supplier: diamond.supplier,
                                    dateAdded: diamond.date_added
                                  }}
                                 fieldConfig={fieldConfig}
                                 size="small"
                                 showPrint={true}
                               />
                             </div>
                           );
                          
                          case 'dateAdded':
                            return <div className="text-sm text-slate-600">{diamond.date_added}</div>;
                        case 'actions':
                          return (
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDiamond(diamond)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(diamond)}
                                title="Edit Diamond"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(diamond.id)}
                                title="Delete Diamond"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                              {diamond.status === 'In Stock' && onCreateInvoice && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCreateInvoice(diamond)}
                                  title="Create Invoice"
                                >
                                  <FileText className="w-4 h-4 text-blue-500" />
                                </Button>
                              )}
                              {diamond.status === 'In Stock' && onCreateConsignment && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCreateConsignment(diamond)}
                                  title="Create Consignment"
                                >
                                  <Handshake className="w-4 h-4 text-green-500" />
                                </Button>
                              )}
                            </div>
                          );
                        default:
                          return null;
                      }
                    };

                    return (
                      <td key={column.key} className="py-4 px-4">
                        {renderCell()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredDiamonds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-2">No diamonds found</div>
              <div className="text-slate-500">Try adjusting your search or filter criteria</div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Transaction History - Placeholder components would need to be created */}
      {/* 
      <DiamondTransactionHistory
        diamond={transactionHistoryDiamond}
        open={showTransactionHistory}
        onClose={() => {
          setShowTransactionHistory(false);
          setTransactionHistoryDiamond(null);
        }}
      />
      */}
      
      <ColumnCustomizer
        open={showColumnCustomizer}
        onClose={() => setShowColumnCustomizer(false)}
        tableName="diamonds"
        columns={customizableColumns}
        onSave={handleColumnCustomizationSave}
        userEmail={user?.email || ''}
      />

      {/* Email Selection - Placeholder components would need to be created */}
      {/* 
      <DiamondSelectionEmail
        diamonds={selectedDiamondsData}
        customers={customers}
        isOpen={showDiamondSelection}
        onClose={() => setShowDiamondSelection(false)}
      />

      <DiamondQuotationCreation
        diamonds={diamonds}
        customers={customers}
        preSelectedDiamonds={selectedDiamondsData}
        isOpen={showQuotation}
        onClose={() => setShowQuotation(false)}
      />

      <BulkDiamondUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => {
          setShowBulkUpload(false);
          window.location.reload();
        }}
      />
      */}
    </Card>
  );
};