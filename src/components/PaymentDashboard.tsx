
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
import { usePayments } from '../hooks/usePayments';
import { useInvoicePayments } from '../hooks/useInvoicePayments';
import { PaymentFilter } from '../types/payment';

export const PaymentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showReceivables, setShowReceivables] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [filters, setFilters] = useState<PaymentFilter>({
    status: 'all'
  });

  const { payments, summary, loading, refetch } = usePayments(filters);
  const { payments: invoicePayments } = useInvoicePayments();

  const handleFilterChange = (key: keyof PaymentFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Use useCallback to memoize the refetch function to prevent unnecessary re-renders
  const memoizedRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh when invoice payments change (when payments are added from other dashboards)
  // Use a ref to track the previous length to avoid infinite loops
  const [previousPaymentsLength, setPreviousPaymentsLength] = useState(0);
  
  useEffect(() => {
    const currentLength = invoicePayments.length;
    if (currentLength !== previousPaymentsLength && previousPaymentsLength > 0) {
      console.log('🔄 PaymentDashboard: Invoice payments changed, refreshing payment data');
      memoizedRefetch();
    }
    setPreviousPaymentsLength(currentLength);
  }, [invoicePayments.length, memoizedRefetch, previousPaymentsLength]);

  const filteredPayments = payments.filter(payment =>
    payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        </div>
      </div>

      <PaymentSummaryCards summary={summary} loading={loading} />

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
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
            loading={loading}
            onRefresh={memoizedRefetch}
          />
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        onSuccess={() => {
          setShowAddPayment(false);
          memoizedRefetch();
        }}
      />

      <PaymentExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        payments={filteredPayments}
        filters={filters}
      />
    </div>
  );
};
