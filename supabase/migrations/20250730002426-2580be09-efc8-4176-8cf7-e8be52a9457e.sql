-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT DEFAULT 'USA',
  payment_terms TEXT DEFAULT 'Net 30',
  credit_limit NUMERIC DEFAULT 0,
  reliability_rating INTEGER DEFAULT 3 CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  ethical_certifications TEXT[], -- Array for certifications like Kimberley Process
  performance_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_purchase_history NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  invoice_number TEXT NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  settled_amount NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  notes TEXT,
  attachment_urls TEXT[], -- Array for invoice/certificate PDFs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_items table with gem-specific fields
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  gem_type TEXT,
  shape TEXT,
  color TEXT,
  treatment TEXT DEFAULT 'none',
  origin TEXT,
  certificate_type TEXT DEFAULT 'none',
  certificate_number TEXT,
  measurements TEXT,
  description TEXT,
  carat NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_unit NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now)
CREATE POLICY "Allow all operations on suppliers" 
ON public.suppliers FOR ALL USING (true);

CREATE POLICY "Allow all operations on purchases" 
ON public.purchases FOR ALL USING (true);

CREATE POLICY "Allow all operations on purchase_items" 
ON public.purchase_items FOR ALL USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update supplier total_purchase_history
CREATE OR REPLACE FUNCTION public.update_supplier_purchase_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the supplier's total purchase history
  UPDATE public.suppliers 
  SET 
    total_purchase_history = (
      SELECT COALESCE(SUM(p.total_amount), 0)
      FROM public.purchases p
      WHERE p.supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)
      AND p.status IN ('paid', 'partial')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supplier_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_purchase_history();