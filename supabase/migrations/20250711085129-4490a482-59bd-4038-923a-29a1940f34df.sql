-- Add VAT number field to customers table
ALTER TABLE public.customers 
ADD COLUMN vat_number TEXT;

-- Update the updated_at trigger for gems to ensure it works properly
DROP TRIGGER IF EXISTS update_gems_updated_at ON public.gems;

CREATE TRIGGER update_gems_updated_at
    BEFORE UPDATE ON public.gems
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();