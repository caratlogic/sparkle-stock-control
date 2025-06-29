
export interface Customer {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  taxId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  dateAdded: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
  discount?: number;
  notes?: string;
}

export interface CustomerCommunication {
  id: string;
  customerId: string;
  communicationType: string;
  subject?: string;
  message: string;
  createdAt: string;
  senderName?: string;
  senderEmail?: string;
  responseStatus?: string;
}

export interface InvoiceItem {
  productId: string;
  productType: 'diamond' | 'emerald' | 'ruby' | 'sapphire' | 'amethyst' | 'aquamarine' | 'garnet' | 'opal' | 'topaz' | 'tourmaline';
  productDetails: {
    stockId: string;
    carat: number;
    cut: string;
    color: string;
    description: string;
    measurements: string;
    certificateNumber: string;
    gemType?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ConsignmentItem {
  id: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productDetails: {
    stockId: string;
    carat: number;
    cut: string;
    color: string;
    description: string;
    measurements: string;
    certificateNumber: string;
    gemType?: string;
  };
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
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dateCreated: string;
  dateDue: string;
  notes?: string;
}

export interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  customerDetails: Customer;
  items: ConsignmentItem[];
  status: 'pending' | 'active' | 'returned' | 'sold' | 'inactive';
  dateCreated: string;
  returnDate: string;
  notes?: string;
}
