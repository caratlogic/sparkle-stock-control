
import { useState, useEffect } from 'react';
import { Payment, PaymentSummary, PaymentFilter } from '../types/payment';

// Sample payment data - in a real app, this would come from your database
const samplePayments: Payment[] = [
  {
    id: '1',
    invoiceId: 'inv-001',
    customerId: 'cust-001',
    customerName: 'John Smith',
    referenceNumber: 'PAY-2024-001',
    amount: 5000,
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    dateReceived: '2024-06-25',
    notes: 'Bank transfer received',
    createdAt: '2024-06-25T10:00:00Z',
    updatedAt: '2024-06-25T10:00:00Z'
  },
  {
    id: '2',
    invoiceId: 'inv-002',
    customerId: 'cust-002',
    customerName: 'Sarah Johnson',
    referenceNumber: 'PAY-2024-002',
    amount: 2500,
    paymentMethod: 'upi',
    paymentStatus: 'pending',
    dateReceived: '2024-06-28',
    notes: 'UPI payment initiated',
    createdAt: '2024-06-28T14:30:00Z',
    updatedAt: '2024-06-28T14:30:00Z'
  },
  {
    id: '3',
    consignmentId: 'cons-001',
    customerId: 'cust-003',
    customerName: 'Michael Brown',
    referenceNumber: 'PAY-2024-003',
    amount: 7500,
    paymentMethod: 'cash',
    paymentStatus: 'overdue',
    dateReceived: '2024-06-20',
    notes: 'Payment overdue by 5 days',
    createdAt: '2024-06-20T09:15:00Z',
    updatedAt: '2024-06-29T09:15:00Z'
  }
];

export const usePayments = (filters?: PaymentFilter) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalRevenue: 0,
    totalReceived: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalRefunds: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let filteredPayments = [...samplePayments];
    
    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.paymentStatus === filters.status);
    }
    
    if (filters?.dateRange?.from) {
      filteredPayments = filteredPayments.filter(p => 
        new Date(p.dateReceived) >= new Date(filters.dateRange!.from)
      );
    }
    
    if (filters?.dateRange?.to) {
      filteredPayments = filteredPayments.filter(p => 
        new Date(p.dateReceived) <= new Date(filters.dateRange!.to)
      );
    }
    
    setPayments(filteredPayments);
    
    // Calculate summary
    const totalReceived = samplePayments
      .filter(p => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingPayments = samplePayments
      .filter(p => p.paymentStatus === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const overduePayments = samplePayments
      .filter(p => p.paymentStatus === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
    
    setSummary({
      totalRevenue: totalReceived + pendingPayments + overduePayments, // Add up all amounts for total revenue
      totalReceived,
      pendingPayments,
      overduePayments,
      totalRefunds: 0 // Would be calculated from refund records
    });
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPayments(prev => [newPayment, ...prev]);
    return { success: true, data: newPayment };
  };

  return {
    payments,
    summary,
    loading,
    addPayment,
    refetch: fetchPayments
  };
};
