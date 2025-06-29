
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Package, Search, Filter, DollarSign, Calendar, Eye } from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';
import { useInvoicePayments } from '../hooks/useInvoicePayments';
import { InvoicePaymentDialog } from './InvoicePaymentDialog';
import { Invoice } from '../types/customer';

export const TransactionDashboard = () => {
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { consignments, loading: consignmentsLoading } = useConsignments();
  const { addPayment, getTotalPaidAmount } = useInvoicePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleAddPayment = async (payment: any) => {
    const result = await addPayment(payment);
    if (result.success) {
      // Payment added successfully
      console.log('Payment added successfully');
    } else {
      console.error('Failed to add payment:', result.error);
    }
  };

  const getInvoiceWithPayments = (invoice: Invoice) => {
    const paidAmount = getTotalPaidAmount(invoice.id);
    return {
      ...invoice,
      paidAmount,
      remainingAmount: invoice.total - paidAmount
    };
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredConsignments = consignments.filter(consignment => {
    const matchesSearch = consignment.consignmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consignment.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      returned: 'bg-purple-100 text-purple-800',
      purchased: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatus = (invoice: Invoice) => {
    const invoiceWithPayments = getInvoiceWithPayments(invoice);
    const paidAmount = invoiceWithPayments.paidAmount;
    
    if (paidAmount === 0) return { status: 'Unpaid', variant: 'destructive' };
    if (paidAmount >= invoice.total) return { status: 'Paid', variant: 'default' };
    return { status: 'Partial', variant: 'secondary' };
  };

  if (invoicesLoading || consignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Transaction Management</h2>
          <p className="text-slate-600 mt-1">Manage invoices, consignments, and payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consignments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Transactions</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-80"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="invoices">Invoices</SelectItem>
                  <SelectItem value="consignments">Consignments</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Invoices */}
            {(typeFilter === 'all' || typeFilter === 'invoices') && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Invoices</h3>
                <div className="space-y-2">
                  {filteredInvoices.map((invoice) => {
                    const invoiceWithPayments = getInvoiceWithPayments(invoice);
                    const paymentStatus = getPaymentStatus(invoice);
                    
                    return (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-slate-600">{invoice.customerDetails.name}</div>
                              <div className="text-xs text-slate-500">
                                Created: {new Date(invoice.dateCreated).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">${invoice.total.toLocaleString()}</div>
                            <div className="text-sm text-slate-600">
                              Paid: ${invoiceWithPayments.paidAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">
                              Remaining: ${invoiceWithPayments.remainingAmount.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <Badge className={getStatusBadge(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                            <Badge variant={paymentStatus.variant as any}>
                              {paymentStatus.status}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <InvoicePaymentDialog
                              invoice={invoiceWithPayments}
                              onAddPayment={handleAddPayment}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Consignments */}
            {(typeFilter === 'all' || typeFilter === 'consignments') && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Consignments</h3>
                <div className="space-y-2">
                  {filteredConsignments.map((consignment) => (
                    <div key={consignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium">{consignment.consignmentNumber}</div>
                            <div className="text-sm text-slate-600">{consignment.customerDetails.name}</div>
                            <div className="text-xs text-slate-500">
                              Created: {new Date(consignment.dateCreated).toLocaleDateString()} | 
                              Return: {new Date(consignment.returnDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-slate-600">
                            {consignment.items.length} item(s)
                          </div>
                        </div>
                        
                        <Badge className={getStatusBadge(consignment.status)}>
                          {consignment.status.charAt(0).toUpperCase() + consignment.status.slice(1)}
                        </Badge>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
