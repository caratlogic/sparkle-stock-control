
export interface Payment {
  id: string;
  invoiceId?: string;
  consignmentId?: string;
  customerId: string;
  customerName: string;
  referenceNumber: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'credit' | 'debit' | 'cheque' | 'online';
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial';
  dateReceived: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalReceived: number;
  pendingPayments: number;
  overduePayments: number;
  totalRefunds: number;
}

export interface PaymentFilter {
  dateRange?: {
    from: string;
    to: string;
  };
  status?: 'paid' | 'pending' | 'overdue' | 'partial' | 'all';
  customerId?: string;
  paymentMethod?: string;
}
