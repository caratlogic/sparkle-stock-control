import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, GEM_TYPES, GEM_COLORS, CUT_OPTIONS } from '../types/gem';
import { Search, Filter, Edit, Eye, ArrowUpDown, Download, FileText, Receipt, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarcodeDisplay } from './BarcodeDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GemTableProps {
  gems: Gem[];
  onEdit: (gem: Gem) => void;
  onDelete: (id: string) => void;
  onCreateInvoice?: (gem: Gem) => void;
  onCreateConsignment?: (gem: Gem) => void;
}

export const GemTable = ({ gems, onEdit, onDelete, onCreateInvoice, onCreateConsignment }: GemTableProps) => {
  const { isOwner } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGemType, setFilterGemType] = useState('all');
  const [filterColor, setFilterColor] = useState('all');
  const [filterCut, setFilterCut] = useState('all');
  const [sortField, setSortField] = useState<keyof Gem>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get unique colors from filtered gems
  const availableColors = filterGemType === 'all' 
    ? Array.from(new Set(gems.map(gem => gem.color)))
    : GEM_COLORS[filterGemType as keyof typeof GEM_COLORS] || [];

  // Filter and sort gems
  const filteredGems = gems
    .filter((gem) => {
      const matchesSearch = 
        gem.stockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.cut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.clarity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gem.gemType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || gem.status === filterStatus;
      const matchesGemType = filterGemType === 'all' || gem.gemType === filterGemType;
      const matchesColor = filterColor === 'all' || gem.color === filterColor;
      const matchesCut = filterCut === 'all' || gem.cut === filterCut;
      
      return matchesSearch && matchesStatus && matchesGemType && matchesColor && matchesCut;
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
    const headers = ['Stock ID', 'Gem Type', 'Carat', 'Cut', 'Color', 'Clarity', 'Price', ...(isOwner ? ['Cost Price'] : []), 'Certificate', 'Status', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...filteredGems.map(gem => [
        gem.stockId,
        gem.gemType,
        gem.carat,
        gem.cut,
        gem.color,
        gem.clarity,
        gem.price,
        ...(isOwner ? [gem.costPrice] : []),
        gem.certificateNumber,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-slate-600" />
            <span>Gem Inventory ({filteredGems.length})</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search gems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-slate-50 border-slate-200"
              />
            </div>
            
            <Select value={filterGemType} onValueChange={setFilterGemType}>
              <SelectTrigger className="w-full sm:w-32 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Types</SelectItem>
                {GEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterColor} onValueChange={setFilterColor}>
              <SelectTrigger className="w-full sm:w-32 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Colors</SelectItem>
                {availableColors.map((color) => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCut} onValueChange={setFilterCut}>
              <SelectTrigger className="w-full sm:w-32 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Shape" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Shapes</SelectItem>
                {CUT_OPTIONS.map((cut) => (
                  <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32 bg-slate-50 border-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th 
                  className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('stockId')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stock ID</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('gemType')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('carat')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Carat</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Shape</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Color</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Clarity</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                {isOwner && (
                  <th 
                    className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => handleSort('costPrice')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Cost Price</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                )}
                <th className="text-left py-3 px-4 font-medium text-slate-600">Certificate</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('dateAdded')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Added</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGems.map((gem) => (
                <tr key={gem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800">{gem.stockId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="font-medium">
                      {gem.gemType}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800">{gem.carat}ct</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">{gem.cut}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">{gem.color}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">{gem.clarity}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">${gem.price.toLocaleString()}</div>
                  </td>
                  {isOwner && (
                    <td className="py-4 px-4">
                      <div className="font-medium text-emerald-600">${gem.costPrice.toLocaleString()}</div>
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600 font-mono">{gem.certificateNumber}</div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      variant={
                        gem.status === 'In Stock' ? 'secondary' : 
                        gem.status === 'Sold' ? 'destructive' : 'default'
                      }
                    >
                      {gem.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">{new Date(gem.dateAdded).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(gem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Barcode"
                          >
                            <QrCode className="w-4 h-4 text-indigo-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Barcode for {gem.stockId}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center py-4">
                            <BarcodeDisplay 
                              stockId={gem.stockId} 
                              gemType={gem.gemType}
                              size="medium"
                              showDownload={true}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                      {gem.status === 'In Stock' && onCreateInvoice && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCreateInvoice(gem)}
                          title="Create Invoice"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      {gem.status === 'In Stock' && onCreateConsignment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCreateConsignment(gem)}
                          title="Create Consignment"
                        >
                          <Receipt className="w-4 h-4 text-purple-600" />
                        </Button>
                      )}
                    </div>
                  </td>
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
    </Card>
  );
};
