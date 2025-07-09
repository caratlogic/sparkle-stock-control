-- Add KYC status column to customers table
ALTER TABLE public.customers ADD COLUMN kyc_status boolean NOT NULL DEFAULT false;

-- Update the updated_at trigger to include the new column
CREATE OR REPLACE FUNCTION public.update_customer_updated_at()
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_updated_at();