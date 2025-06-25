
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Invoice, Consignment } from '../types/customer';
import { FileText, Receipt, Download, Search, Calendar, DollarSign, Package } from 'lucide-react';
import { generateInvoicePDF, generateConsignmentPDF } from '../utils/pdfGenerator';

interface TransactionDashboardProps {
  invoices: Invoice[];
  consignments: Consignment[];
}

export const TransactionDashboard = ({ invoices, consignments }: TransactionDashboardProps) => {
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [consignmentSearch, setConsignmentSearch] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('all');
  const [consignmentStatus, setConsignmentStatus] = useState('all');
  const [invoicePeriod, setInvoicePeriod] = useState('all');
  const [consignmentPeriod, setConsignmentPeriod] = useState('all');

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.customerDetails.name.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.customerDetails.customerId.toLowerCase().includes(invoiceSearch.toLowerCase());
    
    const matchesStatus = invoiceStatus === 'all' || invoice.status === invoiceStatus;
    
    let matchesPeriod = true;
    if (invoicePeriod !== 'all') {
      const invoiceDate = new Date(invoice.dateCreated);
      const now = new Date();
      const daysAgo = invoicePeriod === '7' ? 7 : invoicePeriod === '30' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      matchesPeriod = invoiceDate >= cutoffDate;
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Filter consignments
  const filteredConsignments = consignments.filter(consignment => {
    const matchesSearch = 
      consignment.consignmentNumber.toLowerCase().includes(consignmentSearch.toLowerCase()) ||
      consignment.customerDetails.name.toLowerCase().includes(consignmentSearch.toLowerCase()) ||
      consignment.customerDetails.customerId.toLowerCase().includes(consignmentSearch.toLowerCase());
    
    const matchesStatus = consignmentStatus === 'all' || consignment.status === consignmentStatus;
    
    let matchesPeriod = true;
    if (consignmentPeriod !== 'all') {
      const consignmentDate = new Date(consignment.dateCreated);
      const now = new Date();
      const daysAgo = consignmentPeriod === '7' ? 7 : consignmentPeriod === '30' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      matchesPeriod = consignmentDate >= cutoffDate;
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Calculate metrics
  const totalInvoiceValue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalConsignmentValue = filteredConsignments.reduce((sum, consignment) => 
    sum + consignment.items.reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0);

  const exportInvoicesCSV = () => {
    const headers = ['Invoice Number', 'Customer', 'Date', 'Due Date', 'Total', 'Status'];
    const csvContent = [
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportConsignmentsCSV = () => {
    const headers = ['Consignment Number', 'Customer', 'Date Created', 'Return Date', 'Items Count', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredConsignments.map(consignment => [
        consignment.consignmentNumber,
        consignment.customerDetails.name,
        consignment.dateCreated,
        consignment.returnDate,
        consignment.items.length,
        consignment.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consignments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Transaction Dashboard</h2>
          <p className="text-slate-600 mt-1">Monitor all invoices and consignments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{filteredInvoices.length}</div>
            <p className="text-xs text-slate-500 mt-1">Invoice records</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Invoice Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalInvoiceValue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Total invoice amount</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Consignments</CardTitle>
            <Receipt className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{filteredConsignments.length}</div>
            <p className="text-xs text-slate-500 mt-1">Active consignments</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Consignment Value</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalConsignmentValue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Total consignment value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="consignments">Consignments</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Invoice Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search invoices..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={invoicePeriod} onValueChange={setInvoicePeriod}>
                    <SelectTrigger className="w-full sm:w-32">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={exportInvoicesCSV}>
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
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Invoice #</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-800">{invoice.invoiceNumber}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{invoice.customerDetails.name}</div>
                          <div className="text-sm text-slate-500">{invoice.customerDetails.customerId}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-600">{new Date(invoice.dateCreated).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-600">{new Date(invoice.dateDue).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">${invoice.total.toLocaleString()}</div>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateInvoicePDF(invoice)}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-slate-400 text-lg mb-2">No invoices found</div>
                    <div className="text-slate-500">Try adjusting your search or filter criteria</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Consignment Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search consignments..."
                      value={consignmentSearch}
                      onChange={(e) => setConsignmentSearch(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  <Select value={consignmentStatus} onValueChange={setConsignmentStatus}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="purchased">Purchased</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={consignmentPeriod} onValueChange={setConsignmentPeriod}>
                    <SelectTrigger className="w-full sm:w-32">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={exportConsignmentsCSV}>
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
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Consignment #</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Date Created</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Return Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsignments.map((consignment) => (
                      <tr key={consignment.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-800">{consignment.consignmentNumber}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{consignment.customerDetails.name}</div>
                          <div className="text-sm text-slate-500">{consignment.customerDetails.customerId}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-600">{new Date(consignment.dateCreated).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-600">{new Date(consignment.returnDate).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-600">{consignment.items.length} items</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={
                              consignment.status === 'purchased' ? 'secondary' : 
                              consignment.status === 'returned' ? 'destructive' : 'default'
                            }
                          >
                            {consignment.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateConsignmentPDF(consignment)}
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredConsignments.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-slate-400 text-lg mb-2">No consignments found</div>
                    <div className="text-slate-500">Try adjusting your search or filter criteria</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
