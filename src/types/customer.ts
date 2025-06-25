
export interface Customer {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateAdded: string;
  totalPurchases: number;
  notes?: string;
}

export interface InvoiceItem {
  productId: string;
  productType: string;
  productDetails: {
    stockId: string;
    carat: number;
    cut: string;
    color: string;
    clarity: string;
    certificateNumber: string;
    gemType?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerDetails: Customer;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dateCreated: string;
  dateDue: string;
  notes?: string;
}
