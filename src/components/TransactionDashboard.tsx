
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Package, DollarSign, Calendar, Eye, Edit } from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';
import { useInvoicePayments } from '../hooks/useInvoicePayments';
import { useCustomers } from '../hooks/useCustomers';
import { InvoicePaymentDialog } from './InvoicePaymentDialog';
import { Invoice } from '../types/customer';

export const TransactionDashboard = () => {
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { consignments, loading: consignmentsLoading } = useConsignments();
  const { addPayment, getTotalPaidAmount, fetchPayments } = useInvoicePayments();
  const { customers } = useCustomers();
  const [activeTab, setActiveTab] = useState<'invoices' | 'consignments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getInvoicePaymentStatus = (invoice: Invoice) => {
    const totalPaid = getTotalPaidAmount(invoice.id);
    if (totalPaid === 0) return { status: 'Unpaid', variant: 'destructive' as const };
    if (totalPaid >= invoice.total) return { status: 'Paid', variant: 'default' as const };
    return { status: 'Partial', variant: 'secondary' as const };
  };

  const handleAddPayment = async (payment: any) => {
    const result = await addPayment(payment);
    if (result.success) {
      await fetchPayments(); // Refresh payments after adding
    }
    return result;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(invoice.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const paymentStatus = getInvoicePaymentStatus(invoice);
    return matchesSearch && paymentStatus.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const filteredConsignments = consignments.filter(consignment =>
    consignment.consignmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(consignment.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary calculations
  const totalInvoices = invoices.length;
  const totalConsignments = consignments.length;
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaidValue = invoices.reduce((sum, inv) => sum + getTotalPaidAmount(inv.id), 0);
  const totalOutstanding = totalInvoiceValue - totalPaidValue;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Transaction Dashboard</h2>
          <p className="text-slate-600">Manage invoices, consignments, and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Consignments</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalConsignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaidValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'invoices' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('invoices')}
          size="sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          Invoices
        </Button>
        <Button
          variant={activeTab === 'consignments' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('consignments')}
          size="sm"
        >
          <Package className="w-4 h-4 mr-2" />
          Consignments
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {activeTab === 'invoices' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'invoices' ? 'Invoices' : 'Consignments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'invoices' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const paidAmount = getTotalPaidAmount(invoice.id);
                      const outstanding = invoice.total - paidAmount;
                      const paymentStatus = getInvoicePaymentStatus(invoice);
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                          <TableCell>
                            {new Date(invoice.dateCreated).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.total.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            ${paidAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            ${outstanding.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={paymentStatus.variant}>
                              {paymentStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <InvoicePaymentDialog
                                invoice={{
                                  ...invoice,
                                  paidAmount: paidAmount
                                }}
                                onAddPayment={handleAddPayment}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consignment #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consignmentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading consignments...
                      </TableCell>
                    </TableRow>
                  ) : filteredConsignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No consignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsignments.map((consignment) => (
                      <TableRow key={consignment.id}>
                        <TableCell className="font-medium">
                          {consignment.consignmentNumber}
                        </TableCell>
                        <TableCell>{getCustomerName(consignment.customerId)}</TableCell>
                        <TableCell>
                          {new Date(consignment.dateCreated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(consignment.returnDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={consignment.status === 'purchased' ? 'default' : 'secondary'}>
                            {consignment.status.charAt(0).toUpperCase() + consignment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
