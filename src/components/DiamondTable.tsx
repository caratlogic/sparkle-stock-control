
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Diamond } from '../types/diamond';
import { Search, Filter, Edit, Eye, ArrowUpDown, Download } from 'lucide-react';

interface DiamondTableProps {
  diamonds: Diamond[];
  onEdit: (diamond: Diamond) => void;
  onDelete: (id: string) => void;
}

export const DiamondTable = ({ diamonds, onEdit, onDelete }: DiamondTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Diamond>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort diamonds
  const filteredDiamonds = diamonds
    .filter((diamond) => {
      const matchesSearch = 
        diamond.stockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.cut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diamond.clarity.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || diamond.status === filterStatus;
      
      return matchesSearch && matchesFilter;
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

  const handleSort = (field: keyof Diamond) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Stock ID', 'Carat', 'Cut', 'Color', 'Clarity', 'Price', 'Certificate', 'Status', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...filteredDiamonds.map(diamond => [
        diamond.stockId,
        diamond.carat,
        diamond.cut,
        diamond.color,
        diamond.clarity,
        diamond.price,
        diamond.certificateNumber,
        diamond.status,
        diamond.dateAdded
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-slate-600" />
            <span>Diamond Inventory ({filteredDiamonds.length})</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search diamonds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-slate-50 border-slate-200"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-50 border-slate-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter status" />
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
                  onClick={() => handleSort('carat')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Carat</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Specifications</th>
                <th 
                  className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
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
              {filteredDiamonds.map((diamond) => (
                <tr key={diamond.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800">{diamond.stockId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-800">{diamond.carat}ct</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">
                      <div>{diamond.cut}</div>
                      <div>{diamond.color} • {diamond.clarity}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">${diamond.price.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600 font-mono">{diamond.certificateNumber}</div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      variant={
                        diamond.status === 'In Stock' ? 'secondary' : 
                        diamond.status === 'Sold' ? 'destructive' : 'default'
                      }
                    >
                      {diamond.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">{diamond.dateAdded}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(diamond)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
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
    </Card>
  );
};
