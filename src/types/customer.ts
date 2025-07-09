
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
  status: 'active' | 'inactive';
  kycStatus: boolean;
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
    totalCarat: number; // Total carat available in stock
    cut: string;
    color: string;
    description: string;
    measurements: string;
    certificateNumber: string;
    gemType?: string;
  };
  quantity: number; // Number of stones purchased
  caratPurchased: number; // Total carat weight purchased
  pricePerCarat: number; // Price per carat
  totalPrice: number; // caratPurchased * pricePerCarat
}

export interface ConsignmentItem {
  id: string;
  gemId: string;
  quantity: number; // Number of stones consigned
  caratConsigned: number; // Total carat weight consigned
  pricePerCarat: number; // Price per carat
  totalPrice: number; // caratConsigned * pricePerCarat
  productDetails?: {
    stockId: string;
    totalCarat: number; // Total carat available in stock
    cut: string;
    color: string;
    description: string;
    measurements: string;
    certificateNumber: string;
    gemType?: string;
  };
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  notes?: string;
  createdAt: string;
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
  payments?: InvoicePayment[];
  paidAmount?: number;
  remainingAmount?: number;
}

export interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  customerDetails: Customer;
  items: ConsignmentItem[];
  status: 'pending' | 'returned' | 'purchased' | 'inactive';
  dateCreated: string;
  returnDate: string;
  notes?: string;
}
