
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
  Upload
} from 'lucide-react';
import { Gem } from '../types/gem';
import { GemDetailView } from './GemDetailView';
import { GemTransactionHistory } from './GemTransactionHistory';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useAuth } from '../contexts/AuthContext';
import { ColumnCustomizer } from './ColumnCustomizer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';
import { GemSelectionEmail } from './GemSelectionEmail';
import { QuotationCreation } from './QuotationCreation';
import { BulkGemUpload } from './BulkGemUpload';
import { useCustomers } from '../hooks/useCustomers';

interface GemTableProps {
  gems: Gem[];
  onEdit: (gem: Gem) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  onCreateInvoice?: (gem: Gem) => void;
  onCreateConsignment?: (gem: Gem) => void;
}

export const GemTable = ({ 
  gems, 
  onEdit, 
  onDelete,
  onAdd,
  onCreateInvoice, 
  onCreateConsignment 
}: GemTableProps) => {
  const { isOwner, user } = useAuth();
  const { toast } = useToast();
  const { fieldConfig } = useQRCodeSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGemType, setFilterGemType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCut, setFilterCut] = useState('all');
  const [filterColor, setFilterColor] = useState('all');
  const [filterTreatment, setFilterTreatment] = useState('all');
  const [caratRange, setCaratRange] = useState({ min: '', max: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortField, setSortField] = useState<keyof Gem>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [transactionHistoryGem, setTransactionHistoryGem] = useState<Gem | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [customColumnLabels, setCustomColumnLabels] = useState<Record<string, string>>({});
  const [showGemSelection, setShowGemSelection] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  const { customers } = useCustomers();

  // Default column configuration with custom labels support
  const getDefaultColumns = (): ColumnConfig[] => [
    { key: 'image', label: customColumnLabels['image'] || 'Image', visible: true, order: 0 },
    { key: 'stockId', label: customColumnLabels['stockId'] || 'Stock ID', visible: true, mandatory: true, order: 1 },
    { key: 'gemType', label: customColumnLabels['gemType'] || 'Gem Type', visible: true, order: 2 },
    { key: 'carat', label: customColumnLabels['carat'] || 'Total Carat', visible: true, order: 3 },
    { key: 'specifications', label: customColumnLabels['specifications'] || 'Specifications', visible: true, order: 4 },
    { key: 'price', label: customColumnLabels['price'] || 'Selling Price', visible: true, order: 5 },
    { key: 'pricePerCarat', label: customColumnLabels['pricePerCarat'] || 'Price/Carat', visible: true, order: 6 },
    { key: 'costPrice', label: customColumnLabels['costPrice'] || 'Cost Price', visible: isOwner, order: 7 },
    { key: 'costPerCarat', label: customColumnLabels['costPerCarat'] || 'Cost/Carat', visible: isOwner, order: 8 },
    { key: 'treatment', label: customColumnLabels['treatment'] || 'Treatment', visible: false, order: 9 },
    { key: 'colorComment', label: customColumnLabels['colorComment'] || 'Color Comment', visible: false, order: 10 },
    { key: 'certificateType', label: customColumnLabels['certificateType'] || 'Certificate Type', visible: false, order: 11 },
    { key: 'supplier', label: customColumnLabels['supplier'] || 'Supplier', visible: false, order: 12 },
    { key: 'purchaseDate', label: customColumnLabels['purchaseDate'] || 'Purchase Date', visible: false, order: 13 },
    { key: 'origin', label: customColumnLabels['origin'] || 'Origin', visible: false, order: 14 },
    { key: 'inStock', label: customColumnLabels['inStock'] || 'In Stock', visible: true, order: 15 },
    { key: 'reserved', label: customColumnLabels['reserved'] || 'Reserved', visible: true, order: 16 },
    { key: 'sold', label: customColumnLabels['sold'] || 'Sold', visible: true, order: 17 },
    { key: 'status', label: customColumnLabels['status'] || 'Status', visible: true, order: 18 },
    { key: 'dateAdded', label: customColumnLabels['dateAdded'] || 'Date Added', visible: true, order: 19 },
    { key: 'updatedBy', label: customColumnLabels['updatedBy'] || 'Updated By', visible: true, order: 20 },
    { key: 'lastUpdated', label: customColumnLabels['lastUpdated'] || 'Last Updated', visible: true, order: 21 },
    { key: 'actions', label: customColumnLabels['actions'] || 'Actions', visible: true, mandatory: true, order: 22 },
    { key: 'qrcode', label: customColumnLabels['qrcode'] || 'QR Code', visible: true, order: 23 },
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
        .eq('table_name', 'gems');

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
    { key: 'stockId', label: customColumnLabels['stockId'] || 'Stock ID', defaultLabel: 'Stock ID' },
    { key: 'gemType', label: customColumnLabels['gemType'] || 'Gem Type', defaultLabel: 'Gem Type' },
    { key: 'price', label: customColumnLabels['price'] || 'Selling Price', defaultLabel: 'Selling Price' },
    { key: 'pricePerCarat', label: customColumnLabels['pricePerCarat'] || 'Price/Carat', defaultLabel: 'Price/Carat' },
    { key: 'costPrice', label: customColumnLabels['costPrice'] || 'Cost Price', defaultLabel: 'Cost Price' },
    { key: 'costPerCarat', label: customColumnLabels['costPerCarat'] || 'Cost/Carat', defaultLabel: 'Cost/Carat' },
    { key: 'treatment', label: customColumnLabels['treatment'] || 'Treatment', defaultLabel: 'Treatment' },
    { key: 'supplier', label: customColumnLabels['supplier'] || 'Supplier', defaultLabel: 'Supplier' },
  ];

  // Get visible columns sorted by order
  const visibleColumns = useMemo(() => 
    columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order),
    [columns]
  );

  // If a gem is selected, show the detail view
  if (selectedGem) {
    return (
      <GemDetailView 
        gem={selectedGem} 
        onBack={() => setSelectedGem(null)} 
      />
    );
  }

  // Get unique values for filter options and filter out empty strings
  const uniqueGemTypes = [...new Set(gems.map(gem => gem.gemType))].filter(type => type && type.trim() !== '').sort();
  const uniqueCuts = [...new Set(gems.map(gem => gem.cut))].filter(cut => cut && cut.trim() !== '').sort();
  const uniqueColors = [...new Set(gems.map(gem => gem.color))].filter(color => color && color.trim() !== '').sort();
  const uniqueTreatments = [...new Set(gems.map(gem => gem.treatment))].filter(treatment => treatment && treatment.trim() !== '').sort();

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterGemType('all');
    setFilterStatus('all');
    setFilterCut('all');
    setFilterColor('all');
    setFilterTreatment('all');
    setCaratRange({ min: '', max: '' });
    setPriceRange({ min: '', max: '' });
  };

  // Filter and sort gems
  const filteredGems = gems
    .filter((gem) => {
      const matchesSearch = 
        gem.stockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.gemType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.cut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gem.description && gem.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGemType = filterGemType === 'all' || gem.gemType === filterGemType;
      const matchesStatus = filterStatus === 'all' || gem.status === filterStatus;
      const matchesCut = filterCut === 'all' || gem.cut === filterCut;
      const matchesColor = filterColor === 'all' || gem.color === filterColor;
      const matchesTreatment = filterTreatment === 'all' || gem.treatment === filterTreatment;
      
      const matchesCaratRange = (!caratRange.min || gem.carat >= parseFloat(caratRange.min)) &&
                               (!caratRange.max || gem.carat <= parseFloat(caratRange.max));
      
      const matchesPriceRange = (!priceRange.min || gem.price >= parseFloat(priceRange.min)) &&
                               (!priceRange.max || gem.price <= parseFloat(priceRange.max));
      
      return matchesSearch && matchesGemType && matchesStatus && matchesCut && 
             matchesColor && matchesTreatment && matchesCaratRange && matchesPriceRange;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
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

  const handleSort = (field: keyof Gem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Stock ID', 'Gem Type', 'Carat', 'Cut', 'Color', 'Price', ...(isOwner ? ['Cost Price'] : []), 'Treatment', 'Color Comment', 'Certificate Type', 'Supplier', 'Purchase Date', 'Origin', 'Status', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...filteredGems.map(gem => [
        gem.stockId,
        gem.gemType,
        gem.carat,
        gem.cut,
        gem.color,
        gem.price,
        ...(isOwner ? [gem.costPrice] : []),
        gem.treatment || '',
        gem.colorComment || '',
        gem.certificateType || '',
        gem.supplier || '',
        gem.purchaseDate || '',
        gem.origin || '',
        gem.status,
        gem.dateAdded
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gem-inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasActiveFilters = filterGemType !== 'all' || filterStatus !== 'all' || filterCut !== 'all' || 
                          filterColor !== 'all' || filterTreatment !== 'all' || caratRange.min || caratRange.max || 
                          priceRange.min || priceRange.max || searchTerm;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <span>Gem Inventory ({filteredGems.length})</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {onAdd && (
              <Button onClick={onAdd} className="bg-diamond-gradient hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Gem
              </Button>
            )}
            
            <Button 
              onClick={() => setShowGemSelection(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Selected
            </Button>

            <Button 
              onClick={() => setShowQuotation(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Quotation
            </Button>

            <Button 
              onClick={() => setShowBulkUpload(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
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
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search gems..."
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
            <Select value={filterGemType} onValueChange={setFilterGemType}>
              <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Gem Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Types</SelectItem>
                {uniqueGemTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCut} onValueChange={setFilterCut}>
              <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Cut/Shape" />
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

            <Select value={filterTreatment} onValueChange={setFilterTreatment}>
              <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Treatment" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Treatments</SelectItem>
                {uniqueTreatments.map(treatment => (
                  <SelectItem key={treatment} value={treatment}>{treatment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Row 2 - Range Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">Carat:</span>
              <Input
                type="number"
                placeholder="Min"
                value={caratRange.min}
                onChange={(e) => setCaratRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-20 bg-slate-50 border-slate-200"
                step="0.01"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={caratRange.max}
                onChange={(e) => setCaratRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-20 bg-slate-50 border-slate-200"
                step="0.01"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">Price ($):</span>
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
                      ['stockId', 'carat', 'price', 'costPrice', 'dateAdded'].includes(column.key)
                        ? 'cursor-pointer hover:text-slate-800 transition-colors'
                        : ''
                    }`}
                    onClick={
                      ['stockId', 'carat', 'price', 'costPrice', 'dateAdded'].includes(column.key)
                        ? () => handleSort(column.key as keyof Gem)
                        : undefined
                    }
                  >
                    {['stockId', 'carat', 'price', 'costPrice', 'dateAdded'].includes(column.key) ? (
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
              {filteredGems.map((gem) => (
                <tr key={gem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {visibleColumns.map((column) => {
                    const renderCell = () => {
                      switch (column.key) {
                        case 'image':
                          return (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                              {gem.imageUrl ? (
                                <img 
                                  src={gem.imageUrl} 
                                  alt={gem.gemType}
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
                        case 'stockId':
                          return (
                            <button
                              onClick={() => setSelectedGem(gem)}
                              className="font-medium text-slate-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                            >
                              {gem.stockId}
                            </button>
                          );
                        case 'gemType':
                          return <div className="font-medium text-slate-800">{gem.gemType}</div>;
                        case 'carat':
                          return <div className="font-medium text-slate-800">{gem.carat}ct</div>;
                        case 'specifications':
                          return (
                            <div className="text-sm text-slate-600">
                              <div>{gem.cut}</div>
                              <div>{gem.color}</div>
                            </div>
                          );
                        case 'price':
                          return <div className="font-semibold text-slate-800">${gem.price.toLocaleString()}</div>;
                        case 'pricePerCarat':
                          return <div className="text-sm text-slate-600">${(gem.price / gem.carat).toFixed(0)}/ct</div>;
                        case 'costPrice':
                          return isOwner ? <div className="font-medium text-emerald-600">${gem.costPrice.toLocaleString()}</div> : null;
                        case 'costPerCarat':
                          return isOwner ? <div className="text-sm text-emerald-600">${(gem.costPrice / gem.carat).toFixed(0)}/ct</div> : null;
                        case 'treatment':
                          return <div className="text-sm text-slate-600">{gem.treatment || ''}</div>;
                        case 'colorComment':
                          return <div className="text-sm text-slate-600">{gem.colorComment || ''}</div>;
                        case 'certificateType':
                          return <div className="text-sm text-slate-600">{gem.certificateType || ''}</div>;
                        case 'supplier':
                          return <div className="text-sm text-slate-600">{gem.supplier || ''}</div>;
                        case 'purchaseDate':
                          return <div className="text-sm text-slate-600">{gem.purchaseDate || ''}</div>;
                        case 'origin':
                          return <div className="text-sm text-slate-600">{gem.origin || ''}</div>;
                        case 'inStock':
                          return <div className="text-sm font-medium text-emerald-600">{gem.inStock || 0}</div>;
                        case 'reserved':
                          return (
                            <button
                              onClick={() => {
                                setTransactionHistoryGem(gem);
                                setShowTransactionHistory(true);
                              }}
                              className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline cursor-pointer"
                            >
                              {gem.reserved || 0}
                            </button>
                          );
                        case 'sold':
                          return (
                            <button
                              onClick={() => {
                                setTransactionHistoryGem(gem);
                                setShowTransactionHistory(true);
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              {gem.sold || 0}
                            </button>
                          );
                        case 'status':
                          return (
                            <Badge 
                              variant={
                                gem.status === 'In Stock' ? 'secondary' : 
                                gem.status === 'Sold' ? 'destructive' : 
                                gem.status === 'Reserved' ? 'default' : 'secondary'
                              }
                            >
                              {gem.status}
                            </Badge>
                          );
                        case 'updatedBy':
                          return (
                            <span className="text-sm text-slate-600">
                              {(gem as any).updatedBy || 'System'}
                            </span>
                          );

                        case 'lastUpdated':
                          return (
                            <span className="text-sm text-slate-600">
                              {(gem as any).updatedAt ? new Date((gem as any).updatedAt).toLocaleDateString() : '-'}
                            </span>
                          );

                        case 'qrcode':
                          return (
                            <div className="flex items-center space-x-2">
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
                                  description: gem.description,
                                  origin: gem.origin,
                                  treatment: gem.treatment,
                                  supplier: gem.supplier,
                                  dateAdded: gem.dateAdded
                                }}
                                fieldConfig={fieldConfig}
                                size="small"
                                showDownload={true}
                              />
                            </div>
                          );
                         
                         case 'dateAdded':
                           return <div className="text-sm text-slate-600">{gem.dateAdded}</div>;
                        case 'actions':
                          return (
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedGem(gem)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(gem)}
                                title="Edit Gem"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(gem.id)}
                                title="Delete Gem"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                              {gem.status === 'In Stock' && onCreateInvoice && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCreateInvoice(gem)}
                                  title="Create Invoice"
                                >
                                  <FileText className="w-4 h-4 text-blue-500" />
                                </Button>
                              )}
                              {gem.status === 'In Stock' && onCreateConsignment && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCreateConsignment(gem)}
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
          
          {filteredGems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-2">No gems found</div>
              <div className="text-slate-500">Try adjusting your search or filter criteria</div>
            </div>
          )}
        </div>
      </CardContent>

      <GemTransactionHistory
        gem={transactionHistoryGem}
        open={showTransactionHistory}
        onClose={() => {
          setShowTransactionHistory(false);
          setTransactionHistoryGem(null);
        }}
      />
      
      <ColumnCustomizer
        open={showColumnCustomizer}
        onClose={() => setShowColumnCustomizer(false)}
        tableName="gems"
        columns={customizableColumns}
        onSave={handleColumnCustomizationSave}
        userEmail={user?.email || ''}
      />

      <GemSelectionEmail
        gems={filteredGems}
        customers={customers}
        isOpen={showGemSelection}
        onClose={() => setShowGemSelection(false)}
      />

      <QuotationCreation
        gems={filteredGems}
        customers={customers}
        isOpen={showQuotation}
        onClose={() => setShowQuotation(false)}
      />

      <BulkGemUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => {
          setShowBulkUpload(false);
          // Trigger a refresh if parent has a refresh method
          window.location.reload();
        }}
      />
    </Card>
  );
};
