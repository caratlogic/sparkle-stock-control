export interface Supplier {
  id: string;
  supplier_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  country: string;
  payment_terms: string;
  credit_limit: number;
  reliability_rating: number;
  ethical_certifications?: string[];
  performance_notes?: string;
  status: string;
  total_purchase_history: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  purchase_id: string;
  supplier_id: string;
  supplier?: Supplier;
  invoice_number: string;
  purchase_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  settled_amount: number;
  balance: number;
  currency: string;
  status: string;
  notes?: string;
  attachment_urls?: string[];
  items?: PurchaseItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  gem_type?: string;
  shape?: string;
  color?: string;
  treatment: string;
  origin?: string;
  certificate_type: string;
  certificate_number?: string;
  measurements?: string;
  description?: string;
  carat: number;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  created_at: string;
}

export const SUPPLIER_STATUS_OPTIONS = ['active', 'inactive'] as const;
export const PURCHASE_STATUS_OPTIONS = ['pending', 'partial', 'paid', 'overdue'] as const;
export const PAYMENT_TERMS_OPTIONS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Immediate'] as const;
export const RELIABILITY_RATINGS = [1, 2, 3, 4, 5] as const;