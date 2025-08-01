import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Download,
  FileText,
  Handshake,
  X
} from 'lucide-react';
import { Diamond } from '../types/diamond';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DiamondTableProps {
  diamonds: Diamond[];
  onEdit: (diamond: Diamond) => void;
  onDelete: (id: string) => void;
  onCreateInvoice?: (diamond: Diamond) => void;
  onCreateConsignment?: (diamond: Diamond) => void;
}

export const DiamondTable = ({ 
  diamonds, 
  onEdit, 
  onDelete, 
  onCreateInvoice, 
  onCreateConsignment 
}: DiamondTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Diamond>('date_added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const statusOptions = ['In Stock', 'Reserved', 'Sold'];

  const filteredDiamonds = useMemo(() => {
    return diamonds
      .filter(diamond => {
        const matchesSearch = !searchTerm || 
          diamond.stock_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          diamond.report_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          diamond.shape?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          diamond.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          diamond.clarity?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !statusFilter || diamond.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [diamonds, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Diamond) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Stock Number', 'Weight', 'Shape', 'Color', 'Clarity', 'Cut Grade',
      'Polish', 'Symmetry', 'Fluorescence', 'Lab', 'Report Number',
      'Retail Price', 'Cost Price', 'Status', 'Date Added'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredDiamonds.map(diamond => [
        diamond.stock_number,
        diamond.weight,
        diamond.shape,
        diamond.color,
        diamond.clarity,
        diamond.cut_grade,
        diamond.polish,
        diamond.symmetry,
        diamond.fluorescence_intensity,
        diamond.lab,
        diamond.report_number,
        diamond.retail_price,
        diamond.cost_price,
        diamond.status,
        diamond.date_added
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diamonds.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Reserved': return 'bg-yellow-100 text-yellow-800';
      case 'Sold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Diamond Inventory ({filteredDiamonds.length})</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search diamonds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {showFilters && (
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {statusFilter && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStatusFilter('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('stock_number')}
                      className="font-medium"
                    >
                      Stock #
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('weight')}
                      className="font-medium"
                    >
                      Weight
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">Shape</th>
                  <th className="p-4 text-left">Color</th>
                  <th className="p-4 text-left">Clarity</th>
                  <th className="p-4 text-left">Cut</th>
                  <th className="p-4 text-left">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('retail_price')}
                      className="font-medium"
                    >
                      Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  {user?.email && (
                    <th className="p-4 text-left">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('cost_price')}
                        className="font-medium"
                      >
                        Cost
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                  )}
                  <th className="p-4 text-left">Lab</th>
                  <th className="p-4 text-left">Report #</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('date_added')}
                      className="font-medium"
                    >
                      Date Added
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiamonds.map((diamond) => (
                  <tr key={diamond.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{diamond.stock_number}</td>
                    <td className="p-4">{diamond.weight}ct</td>
                    <td className="p-4">{diamond.shape}</td>
                    <td className="p-4">{diamond.color}</td>
                    <td className="p-4">{diamond.clarity}</td>
                    <td className="p-4">{diamond.cut_grade}</td>
                    <td className="p-4">${diamond.retail_price?.toLocaleString()}</td>
                    {user?.email && (
                      <td className="p-4">${diamond.cost_price?.toLocaleString()}</td>
                    )}
                    <td className="p-4">{diamond.lab}</td>
                    <td className="p-4">{diamond.report_number}</td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(diamond.status)}>
                        {diamond.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {new Date(diamond.date_added).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onEdit(diamond)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onDelete(diamond.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {onCreateInvoice && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onCreateInvoice(diamond)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {onCreateConsignment && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onCreateConsignment(diamond)}
                          >
                            <Handshake className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDiamonds.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No diamonds found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};