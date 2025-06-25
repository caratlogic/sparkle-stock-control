
export interface Customer {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company?: string;
  taxId?: string;
  dateAdded: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
  notes?: string;
}

export interface InvoiceItem {
  productId: string;
  productType: 'diamond';
  productDetails: {
    stockId: string;
    carat: number;
    cut: string;
    color: string;
    clarity: string;
    certificateNumber: string;
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
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  dateCreated: string;
  dateDue: string;
  datePaid?: string;
  notes?: string;
}
