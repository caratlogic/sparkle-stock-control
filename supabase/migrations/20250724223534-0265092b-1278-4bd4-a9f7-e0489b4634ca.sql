-- Add currency column to invoices table if it doesn't exist
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- Add currency column to consignments table if it doesn't exist  
ALTER TABLE public.consignments
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

-- Add currency column to quotations table if it doesn't exist
ALTER TABLE public.quotations  
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';