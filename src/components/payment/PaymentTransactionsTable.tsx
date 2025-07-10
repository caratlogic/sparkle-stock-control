
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';
import { Payment } from '../../types/payment';
import { Customer } from '../../types/customer';
import { CustomerFilter } from '../ui/customer-filter';
import { PaymentDetailDialog } from './PaymentDetailDialog';

interface PaymentTransactionsTableProps {
  payments: Payment[];
  customers: Customer[];
  loading: boolean;
  onRefresh: () => void;
  customerFilter: string;
  onCustomerFilterChange: (value: string) => void;
}

export const PaymentTransactionsTable = ({ 
  payments, 
  customers, 
  loading, 
  customerFilter, 
  onCustomerFilterChange 
}: PaymentTransactionsTableProps) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetail(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      cash: 'bg-emerald-100 text-emerald-800',
      bank: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      credit: 'bg-orange-100 text-orange-800',
      debit: 'bg-pink-100 text-pink-800',
      cheque: 'bg-indigo-100 text-indigo-800',
      online: 'bg-cyan-100 text-cyan-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Filter payments by customer
  const filteredPayments = customerFilter === 'all' 
    ? payments 
    : payments.filter(payment => payment.customerId === customerFilter);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Payment Transactions</h3>
          <CustomerFilter
            customers={customers}
            value={customerFilter}
            onValueChange={onCustomerFilterChange}
            placeholder="Filter by Customer"
          />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 h-16 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Transactions</h3>
        <CustomerFilter
          customers={customers}
          value={customerFilter}
          onValueChange={onCustomerFilterChange}
          placeholder="Filter by Customer"
        />
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Linked To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.referenceNumber}
                  </TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell>
                    {new Date(payment.dateReceived).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentMethodBadge(payment.paymentMethod)}>
                      {payment.paymentMethod.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(payment.paymentStatus)}>
                      {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.invoiceId && (
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                        onClick={() => {
                          // Navigate to invoice detail view
                          window.location.href = `/invoice/${payment.invoiceId}`;
                        }}
                      >
                        Invoice #{payment.invoiceId.slice(-6)}
                      </button>
                    )}
                    {payment.consignmentId && (
                      <button 
                        className="text-sm text-purple-600 hover:text-purple-800 underline"
                        onClick={() => {
                          // Navigate to consignment detail view
                          window.location.href = `/consignment/${payment.consignmentId}`;
                        }}
                      >
                        Consignment #{payment.consignmentId.slice(-6)}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Handle edit payment
                          console.log('Edit payment:', payment.id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Handle more actions
                          console.log('More actions for payment:', payment.id);
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentDetailDialog
        payment={selectedPayment}
        open={showPaymentDetail}
        onClose={() => setShowPaymentDetail(false)}
      />
    </div>
  );
};
