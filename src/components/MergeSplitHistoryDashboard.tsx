import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Download, History, ArrowUpDown } from 'lucide-react';
import { useMergeSplitHistory } from '@/hooks/useMergeSplitHistory';
import { MergeSplitFilters } from '@/types/mergeSplit';
import { format } from 'date-fns';

export const MergeSplitHistoryDashboard = () => {
  const { history, loading, fetchHistory } = useMergeSplitHistory();
  const [filters, setFilters] = useState<MergeSplitFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleFilterChange = (key: keyof MergeSplitFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    fetchHistory(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchHistory();
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      'Operation ID',
      'Operation Type',
      'Date/Time',
      'User',
      'Original Stock Numbers',
      'New Stock Numbers',
      'Original Carat',
      'New Carat',
      'Original Cost',
      'New Cost',
      'Original Selling',
      'New Selling',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...history.map(record => [
        record.id,
        record.operation_type,
        format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss'),
        record.user_email,
        `"${record.original_stock_numbers.join(', ')}"`,
        `"${record.new_stock_numbers.join(', ')}"`,
        record.original_carat,
        record.new_carat,
        record.original_total_cost || '',
        record.new_total_cost || '',
        record.original_total_selling || '',
        record.new_total_selling || '',
        `"${record.notes || ''}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merge-split-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = history.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merge & Split History</h1>
          <p className="text-muted-foreground">
            Track all merge and split operations for inventory accuracy and compliance
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Filter operations by date range, type, stock numbers, or user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operationType">Operation Type</Label>
              <Select
                value={filters.operationType || 'all'}
                onValueChange={(value) => handleFilterChange('operationType', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Merge">Merge</SelectItem>
                  <SelectItem value="Split">Split</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockNumber">Stock Number</Label>
              <Input
                id="stockNumber"
                placeholder="Enter stock number"
                value={filters.stockNumber || ''}
                onChange={(e) => handleFilterChange('stockNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                placeholder="Enter user email"
                value={filters.userEmail || ''}
                onChange={(e) => handleFilterChange('userEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="space-y-2">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button onClick={handleClearFilters} variant="outline" className="w-full">
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Operation History
          </CardTitle>
          <CardDescription>
            {history.length} total operations found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No operations found</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Original Stock</TableHead>
                    <TableHead>New Stock</TableHead>
                    <TableHead>Carat Change</TableHead>
                    <TableHead>Price Impact</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">
                        {record.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.operation_type === 'Merge' ? 'default' : 'secondary'}
                        >
                          {record.operation_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{record.user_email}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {record.original_stock_numbers.map((stock, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {stock}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {record.new_stock_numbers.map((stock, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {stock}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{record.original_carat}</span>
                          <ArrowUpDown className="h-3 w-3" />
                          <span>{record.new_carat}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.original_total_cost && record.new_total_cost ? (
                          <div className="text-xs">
                            <div>Cost: ${record.original_total_cost} → ${record.new_total_cost}</div>
                            {record.original_total_selling && record.new_total_selling && (
                              <div>Sale: ${record.original_total_selling} → ${record.new_total_selling}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.notes ? (
                          <div className="max-w-xs truncate" title={record.notes}>
                            {record.notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, history.length)} of {history.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};