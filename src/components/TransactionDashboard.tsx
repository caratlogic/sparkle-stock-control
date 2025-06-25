
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Invoice, Consignment } from '../types/customer';
import { FileText, Package, Calendar, Download, Eye, Filter } from 'lucide-react';

interface TransactionDashboardProps {
  invoices: Invoice[];
  consignments: Consignment[];
}

export const TransactionDashboard = ({ invoices, consignments }: TransactionDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'consignments'>('invoices');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter invoices by date range and status
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.dateCreated);
    const now = new Date();
    
    const matchesDateFilter = () => {
      if (dateFilter === 'custom' && startDate && endDate) {
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
      }
      if (dateFilter === 'today') {
        return invoiceDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invoiceDate >= weekAgo;
      }
      if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return invoiceDate >= monthAgo;
      }
      return true;
    };

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesDateFilter() && matchesStatus;
  });

  // Filter consignments by date range and status
  const filteredConsignments = consignments.filter(consignment => {
    const consignmentDate = new Date(consignment.dateCreated);
    const now = new Date();
    
    const matchesDateFilter = () => {
      if (dateFilter === 'custom' && startDate && endDate) {
        return consignmentDate >= new Date(startDate) && consignmentDate <= new Date(endDate);
      }
      if (dateFilter === 'today') {
        return consignmentDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return consignmentDate >= weekAgo;
      }
      if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return consignmentDate >= monthAgo;
      }
      return true;
    };

    const matchesStatus = statusFilter === 'all' || consignment.status === statusFilter;
    
    return matchesDateFilter() && matchesStatus;
  });

  const totalInvoiceValue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalConsignmentValue = filteredConsignments.reduce((sum, consignment) => 
    sum + consignment.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
  );

  const exportToCSV = (type: 'invoices' | 'consignments') => {
    let csvContent = '';
    let filename = '';

    if (type === 'invoices') {
      const headers = ['Invoice Number', 'Customer', 'Date', 'Due Date', 'Total', 'Status'];
      csvContent = [
        headers.join(','),
        ...filteredInvoices.map(invoice => [
          invoice.invoiceNumber,
          invoice.customerDetails.name,
          invoice.dateCreated,
          invoice.dateDue,
          invoice.total,
          invoice.status
        ].join(','))
      ].join('\n');
      filename = 'invoices.csv';
    } else {
      const headers = ['Consignment Number', 'Customer', 'Date Created', 'Return Date', 'Total Value', 'Status'];
      csvContent = [
        headers.join(','),
        ...filteredConsignments.map(consignment => [
          consignment.consignmentNumber,
          consignment.customerDetails.name,
          consignment.dateCreated,
          consignment.returnDate,
          consignment.items.reduce((sum, item) => sum + item.totalPrice, 0),
          consignment.status
        ].join(','))
      ].join('\n');
      filename = 'consignments.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transaction Dashboard</h2>
          <p className="text-slate-600">Manage invoices and consignments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'invoices' ? 'default' : 'outline'}
            onClick={() => setActiveTab('invoices')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </Button>
          <Button
            variant={activeTab === 'consignments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('consignments')}
          >
            <Package className="w-4 h-4 mr-2" />
            Consignments
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">
              {activeTab === 'invoices' ? 'Total Invoices' : 'Total Consignments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTab === 'invoices' ? filteredInvoices.length : filteredConsignments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeTab === 'invoices' ? totalInvoiceValue.toLocaleString() : totalConsignmentValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {activeTab === 'invoices' && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Paid Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredInvoices.filter(inv => inv.status === 'paid').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Overdue Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {filteredInvoices.filter(inv => inv.status === 'overdue').length}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'consignments' && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredConsignments.filter(con => con.status === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filteredConsignments.filter(con => con.status === 'purchased').length}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-filter">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === 'custom' && (
              <>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">All Status</SelectItem>
                  {activeTab === 'invoices' ? (
                    <>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="purchased">Purchased</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              {activeTab === 'invoices' ? (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Invoices ({filteredInvoices.length})</span>
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  <span>Consignments ({filteredConsignments.length})</span>
                </>
              )}
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => exportToCSV(activeTab)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    {activeTab === 'invoices' ? 'Invoice #' : 'Consignment #'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date Created</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">
                    {activeTab === 'invoices' ? 'Due Date' : 'Return Date'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Total Value</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'invoices' ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{invoice.customerDetails.name}</div>
                        <div className="text-sm text-slate-500">{invoice.customerDetails.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{invoice.dateCreated}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{invoice.dateDue}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">${invoice.total.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={
                            invoice.status === 'paid' ? 'secondary' : 
                            invoice.status === 'overdue' ? 'destructive' : 'default'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredConsignments.map((consignment) => (
                    <tr key={consignment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">{consignment.consignmentNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{consignment.customerDetails.name}</div>
                        <div className="text-sm text-slate-500">{consignment.customerDetails.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{consignment.dateCreated}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">{consignment.returnDate}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">
                          ${consignment.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={
                            consignment.status === 'purchased' ? 'secondary' : 
                            consignment.status === 'pending' ? 'default' : 'outline'
                          }
                        >
                          {consignment.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {(activeTab === 'invoices' ? filteredInvoices : filteredConsignments).length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">
                  No {activeTab} found
                </div>
                <div className="text-slate-500">Try adjusting your filter criteria</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
