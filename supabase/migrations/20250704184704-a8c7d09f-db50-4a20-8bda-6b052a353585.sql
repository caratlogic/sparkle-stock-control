-- Add customer status field to customers table
ALTER TABLE public.customers ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Add check constraint for status values
ALTER TABLE public.customers ADD CONSTRAINT customers_status_check CHECK (status IN ('active', 'inactive'));

-- Create function to check if customer can be set to inactive
CREATE OR REPLACE FUNCTION public.can_customer_be_inactive(customer_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    -- Check for active consignments
    SELECT 1 FROM public.consignments 
    WHERE customer_id = customer_uuid 
    AND status IN ('pending')
  ) AND NOT EXISTS (
    -- Check for pending payments (unpaid or partially paid invoices)
    SELECT 1 FROM public.invoices 
    WHERE customer_id = customer_uuid 
    AND status IN ('sent', 'overdue')
  );
$$;