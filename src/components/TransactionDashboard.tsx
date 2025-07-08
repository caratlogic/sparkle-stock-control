import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Package, DollarSign, Calendar, Eye, Edit, Download, ShoppingCart, Trash2, CreditCard, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';
import { useInvoicePayments } from '../hooks/useInvoicePayments';
import { useCustomers } from '../hooks/useCustomers';
import { InvoicePaymentDialog } from './InvoicePaymentDialog';
import { ConsignmentToInvoiceDialog } from './ConsignmentToInvoiceDialog';
import { InvoiceDetailView } from './InvoiceDetailView';
import { ConsignmentDetailView } from './ConsignmentDetailView';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { CustomerFilter } from './ui/customer-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice } from '../types/customer';
import { generateInvoicePDF, generateConsignmentPDF } from '../utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
export const TransactionDashboard = () => {
  const {
    invoices,
    loading: invoicesLoading,
    updateInvoiceStatus
  } = useInvoices();
  const {
    consignments,
    loading: consignmentsLoading,
    updateConsignmentStatus,
    deleteConsignment
  } = useConsignments();
  const {
    addPayment,
    getTotalPaidAmount,
    fetchPayments
  } = useInvoicePayments();
  const {
    customers
  } = useCustomers();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState<'invoices' | 'consignments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [selectedConsignmentForInvoice, setSelectedConsignmentForInvoice] = useState<string | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [selectedConsignmentForView, setSelectedConsignmentForView] = useState<any | null>(null);
  const [showInvoiceCreation, setShowInvoiceCreation] = useState(false);
  const [showConsignmentCreation, setShowConsignmentCreation] = useState(false);
  const [showCreditNoteDialog, setShowCreditNoteDialog] = useState(false);
  const [selectedInvoiceForCredit, setSelectedInvoiceForCredit] = useState<Invoice | null>(null);
  const [invoiceSortColumn, setInvoiceSortColumn] = useState<string>('');
  const [invoiceSortDirection, setInvoiceSortDirection] = useState<'asc' | 'desc'>('asc');
  const [consignmentSortColumn, setConsignmentSortColumn] = useState<string>('');
  const [consignmentSortDirection, setConsignmentSortDirection] = useState<'asc' | 'desc'>('asc');
  useEffect(() => {
    fetchPayments();
  }, []);
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };
  const getInvoicePaymentStatus = (invoice: Invoice) => {
    const totalPaid = getTotalPaidAmount(invoice.id);
    if (totalPaid === 0) return {
      status: 'Unpaid',
      variant: 'destructive' as const
    };
    if (totalPaid >= invoice.total) return {
      status: 'Paid',
      variant: 'default' as const
    };
    return {
      status: 'Partial',
      variant: 'secondary' as const
    };
  };
  const handleAddPayment = async (payment: any) => {
    const result = await addPayment(payment);
    if (result.success) {
      await fetchPayments();
      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to record payment",
        variant: "destructive"
      });
    }
    return result;
  };
  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice);
      toast({
        title: "Success",
        description: "Invoice downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive"
      });
    }
  };
  const handleDownloadConsignment = (consignment: any) => {
    try {
      generateConsignmentPDF(consignment);
      toast({
        title: "Success",
        description: "Consignment downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download consignment",
        variant: "destructive"
      });
    }
  };
  const handleConsignmentToInvoice = async (consignmentId: string) => {
    setSelectedConsignmentForInvoice(consignmentId);
  };
  const handleDeleteConsignment = async (consignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this consignment? This will adjust the gem quantities back to In Stock.')) {
      const result = await deleteConsignment(consignmentId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Consignment deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete consignment",
          variant: "destructive"
        });
      }
    }
  };
  const handleUpdateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    const result = await updateInvoiceStatus(invoiceId, newStatus);
    if (result.success) {
      toast({
        title: "Success",
        description: `Invoice status updated to ${newStatus}`
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update invoice status",
        variant: "destructive"
      });
    }
  };
  const handleSort = (column: string, type: 'invoice' | 'consignment') => {
    if (type === 'invoice') {
      const direction = invoiceSortColumn === column && invoiceSortDirection === 'asc' ? 'desc' : 'asc';
      setInvoiceSortColumn(column);
      setInvoiceSortDirection(direction);
    } else {
      const direction = consignmentSortColumn === column && consignmentSortDirection === 'asc' ? 'desc' : 'asc';
      setConsignmentSortColumn(column);
      setConsignmentSortDirection(direction);
    }
  };
  const getSortIcon = (column: string, type: 'invoice' | 'consignment') => {
    const sortColumn = type === 'invoice' ? invoiceSortColumn : consignmentSortColumn;
    const sortDirection = type === 'invoice' ? invoiceSortDirection : consignmentSortDirection;
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || getCustomerName(invoice.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = customerFilter === 'all' || invoice.customerId === customerFilter;
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const paymentStatus = getInvoicePaymentStatus(invoice);
      matchesStatus = paymentStatus.status.toLowerCase() === statusFilter.toLowerCase();
    }
    return matchesSearch && matchesCustomer && matchesStatus;
  }).sort((a, b) => {
    if (!invoiceSortColumn) return 0;
    let aValue: any, bValue: any;
    switch (invoiceSortColumn) {
      case 'invoiceNumber':
        aValue = a.invoiceNumber;
        bValue = b.invoiceNumber;
        break;
      case 'customer':
        aValue = getCustomerName(a.customerId);
        bValue = getCustomerName(b.customerId);
        break;
      case 'date':
        aValue = new Date(a.dateCreated);
        bValue = new Date(b.dateCreated);
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'paid':
        aValue = getTotalPaidAmount(a.id);
        bValue = getTotalPaidAmount(b.id);
        break;
      case 'outstanding':
        aValue = a.total - getTotalPaidAmount(a.id);
        bValue = b.total - getTotalPaidAmount(b.id);
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return invoiceSortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return invoiceSortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  const filteredConsignments = consignments.filter(consignment => {
    const matchesSearch = consignment.consignmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) || getCustomerName(consignment.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = customerFilter === 'all' || consignment.customerId === customerFilter;
    return matchesSearch && matchesCustomer;
  }).sort((a, b) => {
    if (!consignmentSortColumn) return 0;
    let aValue: any, bValue: any;
    switch (consignmentSortColumn) {
      case 'consignmentNumber':
        aValue = a.consignmentNumber;
        bValue = b.consignmentNumber;
        break;
      case 'customer':
        aValue = getCustomerName(a.customerId);
        bValue = getCustomerName(b.customerId);
        break;
      case 'dateCreated':
        aValue = new Date(a.dateCreated);
        bValue = new Date(b.dateCreated);
        break;
      case 'returnDate':
        aValue = new Date(a.returnDate);
        bValue = new Date(b.returnDate);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    if (aValue < bValue) return consignmentSortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return consignmentSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Summary calculations
  const allInvoices = customerFilter === 'all' ? invoices : invoices.filter(inv => inv.customerId === customerFilter);
  const allConsignments = customerFilter === 'all' ? consignments : consignments.filter(cons => cons.customerId === customerFilter);
  const totalInvoices = allInvoices.length;
  const totalConsignments = allConsignments.length;

  // Filter out cancelled invoices for revenue calculations
  const activeInvoices = allInvoices.filter(inv => inv.status !== 'cancelled');
  const totalInvoiceValue = activeInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaidValue = allInvoices.reduce((sum, inv) => sum + getTotalPaidAmount(inv.id), 0);
  const totalOutstanding = totalInvoiceValue - totalPaidValue;

  // Calculate overdue payments (more than 1 week old with no payment)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const overdueInvoices = allInvoices.filter(inv => {
    const totalPaid = getTotalPaidAmount(inv.id);
    const invoiceDate = new Date(inv.dateCreated);
    return totalPaid === 0 && invoiceDate < oneWeekAgo && inv.status !== 'cancelled';
  });
  const overduePaymentAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Calculate overdue consignments (past return date)
  const today = new Date();
  const overdueConsignments = allConsignments.filter(cons => {
    const returnDate = new Date(cons.returnDate);
    return returnDate < today && cons.status === 'pending';
  });

  // Customer-specific calculations when customer filter is applied
  const customerSpecificInvoices = customerFilter === 'all' ? activeInvoices : activeInvoices.filter(inv => inv.customerId === customerFilter);
  const customerDraftRevenue = customerSpecificInvoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.total, 0);
  const customerSentRevenue = customerSpecificInvoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0);
  const customerPaidRevenue = customerSpecificInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const customerOverdueRevenue = customerSpecificInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);
  const customerTotalRevenue = customerDraftRevenue + customerSentRevenue + customerPaidRevenue + customerOverdueRevenue;

  // If viewing invoice details, show the detail view
  if (selectedInvoiceForView) {
    return <InvoiceDetailView invoice={selectedInvoiceForView} onBack={() => setSelectedInvoiceForView(null)} />;
  }

  // If viewing consignment details, show the detail view
  if (selectedConsignmentForView) {
    return <ConsignmentDetailView consignment={selectedConsignmentForView} onBack={() => setSelectedConsignmentForView(null)} />;
  }
  return <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Transaction Dashboard</h2>
          <p className="text-slate-600">Manage invoices, consignments, and payments</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowInvoiceCreation(true)} className="bg-diamond-gradient hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
          <Button onClick={() => setShowConsignmentCreation(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Consignment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-600 text-xl font-extrabold">
              {customerFilter === 'all' ? 'Total Revenue' : `${customers.find(c => c.id === customerFilter)?.name || 'Customer'} Revenue`}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${customerFilter === 'all' ? totalInvoiceValue.toLocaleString() : customerTotalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue Payment</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${overduePaymentAmount.toLocaleString()}</div>
            <p className="text-xs text-slate-600 mt-1">{overdueInvoices.length} invoice(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Consignments Overdue</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{overdueConsignments.length}</div>
            <p className="text-xs text-slate-600 mt-1">Not returned</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Cards (shown when customer is selected) */}
      {customerFilter !== 'all' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Draft Invoice Amount</CardTitle>
              <FileText className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-500">${customerDraftRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sent Invoice Amount</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-blue-600">${customerSentRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Paid Invoice Amount</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">${customerPaidRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Overdue Invoice Amount</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-600">${customerOverdueRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <Button variant={activeTab === 'invoices' ? 'default' : 'ghost'} onClick={() => setActiveTab('invoices')} size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Invoices
        </Button>
        <Button variant={activeTab === 'consignments' ? 'default' : 'ghost'} onClick={() => setActiveTab('consignments')} size="sm">
          <Package className="w-4 h-4 mr-2" />
          Consignments
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="Search by number or customer name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>
        
        <CustomerFilter customers={customers} value={customerFilter} onValueChange={setCustomerFilter} placeholder="Filter by Customer" />
        
        {activeTab === 'invoices' && <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'invoices' ? 'Invoices' : 'Consignments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'invoices' ? <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('invoiceNumber', 'invoice')}>
                      <div className="flex items-center gap-2">
                        Invoice #
                        {getSortIcon('invoiceNumber', 'invoice')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('customer', 'invoice')}>
                      <div className="flex items-center gap-2">
                        Customer
                        {getSortIcon('customer', 'invoice')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('date', 'invoice')}>
                      <div className="flex items-center gap-2">
                        Date
                        {getSortIcon('date', 'invoice')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('total', 'invoice')}>
                      <div className="flex items-center gap-2">
                        Total
                        {getSortIcon('total', 'invoice')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('paid', 'invoice')}>
                      <div className="flex items-center gap-2">
                        Paid
                        {getSortIcon('paid', 'invoice')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('outstanding', 'invoice')}>
                      <div className="flex items-center gap-2">
                        Outstanding
                        {getSortIcon('outstanding', 'invoice')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-slate-800 py-4">Payment Status</TableHead>
                    <TableHead className="font-semibold text-slate-800 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesLoading ? <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading invoices...
                      </TableCell>
                    </TableRow> : filteredInvoices.length === 0 ? <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No invoices found
                      </TableCell>
                    </TableRow> : filteredInvoices.map(invoice => {
                const paidAmount = getTotalPaidAmount(invoice.id);
                const outstanding = invoice.total - paidAmount;
                const paymentStatus = getInvoicePaymentStatus(invoice);
                return <TableRow key={invoice.id}>
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
                            <Select value={invoice.status} onValueChange={newStatus => handleUpdateInvoiceStatus(invoice.id, newStatus)}>
                              <SelectTrigger className="w-[120px]">
                                <SelectValue>
                                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={paymentStatus.variant}>
                              {paymentStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceForView(invoice)} title="View Invoice Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)} title="Download Invoice">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedInvoiceForCredit(invoice);
                        setShowCreditNoteDialog(true);
                      }} title="Create Credit Note">
                                <CreditCard className="w-4 h-4" />
                              </Button>
                              <InvoicePaymentDialog invoice={{
                        ...invoice,
                        paidAmount: paidAmount
                      }} onAddPayment={handleAddPayment} />
                            </div>
                          </TableCell>
                        </TableRow>;
              })}
                </TableBody>
              </Table>
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('consignmentNumber', 'consignment')}>
                      <div className="flex items-center gap-2">
                        Consignment #
                        {getSortIcon('consignmentNumber', 'consignment')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('customer', 'consignment')}>
                      <div className="flex items-center gap-2">
                        Customer
                        {getSortIcon('customer', 'consignment')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('dateCreated', 'consignment')}>
                      <div className="flex items-center gap-2">
                        Date Created
                        {getSortIcon('dateCreated', 'consignment')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('returnDate', 'consignment')}>
                      <div className="flex items-center gap-2">
                        Return Date
                        {getSortIcon('returnDate', 'consignment')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 py-4" onClick={() => handleSort('status', 'consignment')}>
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon('status', 'consignment')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-800 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consignmentsLoading ? <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading consignments...
                      </TableCell>
                    </TableRow> : filteredConsignments.length === 0 ? <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No consignments found
                      </TableCell>
                    </TableRow> : filteredConsignments.map(consignment => <TableRow key={consignment.id}>
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
                            <Button variant="ghost" size="sm" onClick={() => setSelectedConsignmentForView(consignment)} title="View Consignment Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadConsignment(consignment)} title="Download Consignment">
                              <Download className="w-4 h-4" />
                            </Button>
                            {consignment.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => handleConsignmentToInvoice(consignment.id)} title="Convert to Invoice">
                                <ShoppingCart className="w-4 h-4" />
                              </Button>}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteConsignment(consignment.id)} title="Delete Consignment" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>

      {selectedConsignmentForInvoice && <ConsignmentToInvoiceDialog consignmentId={selectedConsignmentForInvoice} onClose={() => setSelectedConsignmentForInvoice(null)} onSuccess={() => {
      setSelectedConsignmentForInvoice(null);
      toast({
        title: "Success",
        description: "Consignment converted to invoice successfully"
      });
    }} />}

      {/* Invoice Creation Dialog */}
      {showInvoiceCreation && <Dialog open={showInvoiceCreation} onOpenChange={setShowInvoiceCreation}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceCreation onCancel={() => setShowInvoiceCreation(false)} onSave={() => {
          setShowInvoiceCreation(false);
          toast({
            title: "Success",
            description: "Invoice created successfully"
          });
        }} />
          </DialogContent>
        </Dialog>}

      {/* Consignment Creation Dialog */}
      {showConsignmentCreation && <Dialog open={showConsignmentCreation} onOpenChange={setShowConsignmentCreation}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Consignment</DialogTitle>
            </DialogHeader>
            <ConsignmentCreation onCancel={() => setShowConsignmentCreation(false)} onSave={() => {
          setShowConsignmentCreation(false);
          toast({
            title: "Success",
            description: "Consignment created successfully"
          });
        }} />
          </DialogContent>
        </Dialog>}

      {/* Credit Note Dialog */}
      {showCreditNoteDialog && selectedInvoiceForCredit && <Dialog open={showCreditNoteDialog} onOpenChange={setShowCreditNoteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Credit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Create a credit note for Invoice #{selectedInvoiceForCredit.invoiceNumber}
              </p>
              <div className="space-y-2">
                <p><strong>Customer:</strong> {getCustomerName(selectedInvoiceForCredit.customerId)}</p>
                <p><strong>Original Amount:</strong> ${selectedInvoiceForCredit.total.toLocaleString()}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreditNoteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
              toast({
                title: "Credit Note Created",
                description: `Credit note for invoice ${selectedInvoiceForCredit.invoiceNumber} has been created.`
              });
              setShowCreditNoteDialog(false);
              setSelectedInvoiceForCredit(null);
            }} className="bg-diamond-gradient hover:opacity-90">
                  Create Credit Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>}
    </div>;
};