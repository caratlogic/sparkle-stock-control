import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Clock, AlertTriangle, RefreshCw, Plus, Download, Filter } from 'lucide-react';
import { PaymentSummaryCards } from './payment/PaymentSummaryCards';
import { PaymentTransactionsTable } from './payment/PaymentTransactionsTable';
import { AddPaymentDialog } from './payment/AddPaymentDialog';
import { ReceivablesTracker } from './payment/ReceivablesTracker';
import { PaymentExportDialog } from './payment/PaymentExportDialog';
import { InvoiceViewDialog } from './payment/InvoiceViewDialog';
import { ConsignmentViewDialog } from './payment/ConsignmentViewDialog';
import { CreditNoteForm } from './CreditNoteForm';
import { useInvoicePayments } from '../hooks/useInvoicePayments';
import { useInvoices } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';
import { useCreditNotes } from '../hooks/useCreditNotes';
import { PaymentFilter, Payment, PaymentSummary } from '../types/payment';
import { InvoicePayment, Invoice } from '../types/customer';

export const PaymentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showReceivables, setShowReceivables] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showCreditNote, setShowCreditNote] = useState(false);
  const [showOverduePayments, setShowOverduePayments] = useState(false);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<any>(null);
  const [showConsignmentDialog, setShowConsignmentDialog] = useState(false);
  const [filters, setFilters] = useState<PaymentFilter>({
    status: 'all'
  });

  const { payments: invoicePayments, loading: paymentsLoading, fetchPayments, addPayment } = useInvoicePayments();
  const { invoices } = useInvoices();
  const { customers } = useCustomers();
  const { creditNotes } = useCreditNotes();

  // Transform invoice payments to Payment format
  const transformedPayments: Payment[] = invoicePayments.map((payment: InvoicePayment) => {
    const invoice = invoices.find(inv => inv.id === payment.invoiceId);
    const customer = customers.find(c => c.id === invoice?.customerId);
    
    // Map payment methods to valid Payment type values
    const mapPaymentMethod = (method: string): Payment['paymentMethod'] => {
      switch (method) {
        case 'cash': return 'cash';
        case 'credit_card': return 'credit';
        case 'bank_transfer': return 'bank';
        case 'check': return 'cheque';
        case 'other': 
        default: return 'online'; // Map 'other' and any unknown methods to 'online'
      }
    };
    
    return {
      id: payment.id,
      invoiceId: payment.invoiceId,
      customerId: invoice?.customerId || '',
      customerName: customer?.name || 'Unknown Customer',
      referenceNumber: `PAY-${payment.id.slice(-8)}`,
      amount: payment.amount,
      paymentMethod: mapPaymentMethod(payment.paymentMethod),
      paymentStatus: 'paid' as const,
      dateReceived: payment.paymentDate,
      notes: payment.notes || '',
      createdAt: payment.createdAt,
      updatedAt: payment.createdAt
    };
  });

  // Calculate summary from transformed payments with customer filtering
  const calculateSummary = useCallback((): PaymentSummary => {
    console.log('💰 Payment Dashboard Calculations:');
    console.log('Customer filter:', customerFilter);
    console.log('Invoice payments count:', invoicePayments.length);
    console.log('Total invoices:', invoices.length);
    console.log('Credit notes count:', creditNotes.length);
    
    // Filter data by customer if specific customer is selected
    const filteredInvoices = customerFilter === 'all' 
      ? invoices 
      : invoices.filter(inv => inv.customerId === customerFilter);
    
    const filteredPayments = customerFilter === 'all'
      ? invoicePayments
      : invoicePayments.filter(p => {
          const invoice = invoices.find(inv => inv.id === p.invoiceId);
          return invoice && invoice.customerId === customerFilter;
        });

    const filteredCreditNotes = customerFilter === 'all'
      ? creditNotes
      : creditNotes.filter(cn => cn.customerId === customerFilter);
    
    // Calculate total received only from payments for active (non-cancelled) invoices
    const totalReceived = filteredPayments
      .filter(p => {
        const invoice = invoices.find(inv => inv.id === p.invoiceId);
        return invoice && invoice.status !== 'cancelled';
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate pending payments from invoices that haven't been fully paid
    const pendingPayments = filteredInvoices.reduce((sum, invoice) => {
      const paidAmount = invoicePayments
        .filter(p => p.invoiceId === invoice.id)
        .reduce((total, payment) => total + payment.amount, 0);
      const remaining = invoice.total - paidAmount;
      
      // Only count unpaid/partial invoices as pending (excluding cancelled and fully paid)
      if (invoice.status !== 'cancelled' && invoice.status !== 'paid' && remaining > 0) {
        return sum + remaining;
      }
      return sum;
    }, 0);

    // Calculate overdue payments (invoices overdue by 2 weeks or more)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const overduePayments = filteredInvoices.reduce((sum, invoice) => {
      const totalPaid = invoicePayments
        .filter(p => p.invoiceId === invoice.id)
        .reduce((total, payment) => total + payment.amount, 0);
      const remaining = invoice.total - totalPaid;
      
      // Check if invoice is overdue by 2 weeks
      const dueDate = new Date(invoice.dateDue);
      const isOverdueBy2Weeks = dueDate < twoWeeksAgo && remaining > 0;
      
      if (isOverdueBy2Weeks && invoice.status !== 'cancelled' && invoice.status !== 'paid') {
        return sum + remaining;
      }
      return sum;
    }, 0);

    // Calculate total credit notes
    const totalCreditNotes = filteredCreditNotes
      .filter(cn => cn.status === 'active')
      .reduce((sum, cn) => sum + cn.amount, 0);

    const summary = {
      totalReceived,
      pendingPayments,
      overduePayments,
      totalRefunds: totalCreditNotes // Use credit notes as refunds/credits
    };
    
    console.log('Final payment summary:', summary);
    console.log('Customer filter applied:', customerFilter !== 'all' ? customers.find(c => c.id === customerFilter)?.name : 'All Customers');
    return summary;
  }, [invoicePayments, invoices, creditNotes, customerFilter, customers]);

  const summary = calculateSummary();

  const handleFilterChange = (key: keyof PaymentFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCustomerFilterChange = (value: string) => {
    setCustomerFilter(value);
  };

  const memoizedRefetch = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Filter payments based on search and filters
  const filteredPayments = transformedPayments.filter(payment => {
    const matchesSearch = 
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filters.status === 'all' || !filters.status) return matchesSearch;
    return matchesSearch && payment.paymentStatus === filters.status;
  }).filter(payment => {
    if (filters.dateRange?.from) {
      const paymentDate = new Date(payment.dateReceived);
      const fromDate = new Date(filters.dateRange.from);
      if (paymentDate < fromDate) return false;
    }
    
    if (filters.dateRange?.to) {
      const paymentDate = new Date(payment.dateReceived);
      const toDate = new Date(filters.dateRange.to);
      if (paymentDate > toDate) return false;
    }
    
    return true;
  });

  const handleAddPayment = async (paymentData: Omit<InvoicePayment, 'id' | 'createdAt'>) => {
    const result = await addPayment(paymentData);
    if (result.success) {
      memoizedRefetch();
    }
    return result;
  };

  const handleViewInvoice = (invoiceId: string) => {
    console.log('Attempting to view invoice:', invoiceId);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    console.log('Found invoice:', invoice);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowInvoiceDialog(true);
      console.log('Set invoice dialog to show');
    } else {
      console.error('Invoice not found for ID:', invoiceId);
    }
  };

  const handleViewConsignment = (consignmentId: string) => {
    // For now, just show a placeholder - you would fetch consignment data here
    console.log('View consignment:', consignmentId);
    alert('Consignment viewing not yet implemented - would show consignment details');
  };

  // Get overdue invoices for display
  const getOverdueInvoices = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return invoices.filter(invoice => {
      const totalPaid = invoicePayments
        .filter(p => p.invoiceId === invoice.id)
        .reduce((total, payment) => total + payment.amount, 0);
      const invoiceDate = new Date(invoice.dateCreated);
      
      return totalPaid === 0 && invoiceDate < oneWeekAgo && invoice.status !== 'cancelled';
    });
  };

  // If showing overdue payments list
  if (showOverduePayments) {
    const overdueInvoices = getOverdueInvoices();
    return (
      <div className="w-full space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Overdue Payment Invoices</h2>
            <p className="text-muted-foreground">Invoices with no payments received (more than 1 week old)</p>
          </div>
          <Button 
            onClick={() => setShowOverduePayments(false)} 
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Invoice #</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Date Created</th>
                    <th className="text-left p-4 font-medium">Amount Due</th>
                    <th className="text-left p-4 font-medium">Days Overdue</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueInvoices.map((invoice) => {
                    const customer = customers.find(c => c.id === invoice.customerId);
                    const daysDiff = Math.floor((new Date().getTime() - new Date(invoice.dateCreated).getTime()) / (1000 * 3600 * 24));
                    return (
                      <tr key={invoice.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                        <td className="p-4">{customer?.name || 'Unknown Customer'}</td>
                        <td className="p-4">{new Date(invoice.dateCreated).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-red-600">${invoice.total.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                            {daysDiff} days
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice.id)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Add payment clicked for invoice:', invoice);
                                setSelectedInvoice(invoice);
                                setShowAddPayment(true);
                                console.log('Set showAddPayment to true');
                              }}
                            >
                              Add Payment
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Payment Dashboard</h1>
          <p className="text-slate-600">Manage payments, track receivables, and monitor cash flow</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowReceivables(!showReceivables)}
          >
            <Clock className="w-4 h-4 mr-2" />
            {showReceivables ? 'Hide' : 'Show'} Receivables
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowExport(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setShowAddPayment(true)}
            className="bg-diamond-gradient hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
          <Button
            onClick={() => setShowCreditNote(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Credit Note
          </Button>
        </div>
      </div>

      <PaymentSummaryCards 
        summary={summary} 
        loading={paymentsLoading} 
        onOverdueClick={() => setShowOverduePayments(true)}
        customerFilter={customerFilter}
        customers={customers}
      />

      {showReceivables && (
        <ReceivablesTracker onClose={() => setShowReceivables(false)} />
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payment Transactions</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={memoizedRefetch}
                disabled={paymentsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${paymentsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From date"
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  from: e.target.value
                })}
                className="w-[150px]"
              />
              
              <Input
                type="date"
                placeholder="To date"
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  to: e.target.value
                })}
                className="w-[150px]"
              />
            </div>
          </div>

          <PaymentTransactionsTable
            payments={filteredPayments}
            customers={customers}
            loading={paymentsLoading}
            onRefresh={memoizedRefetch}
            customerFilter={customerFilter}
            onCustomerFilterChange={handleCustomerFilterChange}
            onViewInvoice={handleViewInvoice}
            onViewConsignment={handleViewConsignment}
          />
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={showAddPayment}
        onClose={() => {
          setShowAddPayment(false);
          setSelectedInvoice(null);
        }}
        onSuccess={() => {
          setShowAddPayment(false);
          setSelectedInvoice(null);
          memoizedRefetch();
        }}
        onAddPayment={handleAddPayment}
        preselectedInvoice={selectedInvoice}
      />

      <PaymentExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        payments={filteredPayments}
        filters={filters}
      />

      <CreditNoteForm
        open={showCreditNote}
        onClose={() => setShowCreditNote(false)}
        customers={customers}
      />

      <InvoiceViewDialog
        invoice={selectedInvoice}
        open={showInvoiceDialog}
        onClose={() => setShowInvoiceDialog(false)}
      />

      <ConsignmentViewDialog
        consignment={selectedConsignment}
        open={showConsignmentDialog}
        onClose={() => setShowConsignmentDialog(false)}
      />
    </div>
  );
};
