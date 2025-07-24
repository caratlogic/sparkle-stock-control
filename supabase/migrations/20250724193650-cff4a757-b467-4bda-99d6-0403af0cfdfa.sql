-- Create partners table for managing business partners
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company TEXT,
  ownership_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on partners table
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policy for partners table
CREATE POLICY "Allow all operations on partners" 
ON public.partners 
FOR ALL 
USING (true);

-- Create partner_transactions table to track revenue by partner
CREATE TABLE public.partner_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice', 'consignment', 'quotation')),
  transaction_id UUID NOT NULL,
  ownership_status TEXT NOT NULL,
  associated_entity TEXT NOT NULL,
  revenue_amount NUMERIC NOT NULL DEFAULT 0,
  partner_share NUMERIC NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on partner_transactions table
ALTER TABLE public.partner_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for partner_transactions table
CREATE POLICY "Allow all operations on partner_transactions" 
ON public.partner_transactions 
FOR ALL 
USING (true);

-- Create trigger for updating updated_at column on partners table
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating updated_at column on partner_transactions table
CREATE TRIGGER update_partner_transactions_updated_at
  BEFORE UPDATE ON public.partner_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();