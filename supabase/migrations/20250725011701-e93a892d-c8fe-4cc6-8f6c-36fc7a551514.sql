-- Create associated_entities table for tracking companies with Memo ownership status
CREATE TABLE public.associated_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.associated_entities ENABLE ROW LEVEL SECURITY;

-- Create policy for associated entities
CREATE POLICY "Allow all operations on associated_entities" 
ON public.associated_entities 
FOR ALL 
USING (true);

-- Create associated_entity_transactions table for tracking revenue
CREATE TABLE public.associated_entity_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associated_entity_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  transaction_id UUID NOT NULL,
  ownership_status TEXT NOT NULL,
  associated_entity_name TEXT NOT NULL,
  revenue_amount NUMERIC NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.associated_entity_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for associated entity transactions
CREATE POLICY "Allow all operations on associated_entity_transactions" 
ON public.associated_entity_transactions 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates on associated_entities
CREATE TRIGGER update_associated_entities_updated_at
BEFORE UPDATE ON public.associated_entities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on associated_entity_transactions
CREATE TRIGGER update_associated_entity_transactions_updated_at
BEFORE UPDATE ON public.associated_entity_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();