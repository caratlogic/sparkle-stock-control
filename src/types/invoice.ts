
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  dateCreated: string;
  dateDue: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  items?: InvoiceItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gem?: {
    id: string;
    stockId: string;
    gemType: string;
    carat: number;
    color: string;
    shape?: string;
    measurementsMm?: string;
    stoneDescription?: string;
  };
}
