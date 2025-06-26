
-- Add discount column to customers table
ALTER TABLE public.customers 
ADD COLUMN discount numeric DEFAULT 0 CHECK (discount >= 0 AND discount <= 100);

-- Add comment to explain the discount column
COMMENT ON COLUMN public.customers.discount IS 'Customer discount percentage (0-100)';
