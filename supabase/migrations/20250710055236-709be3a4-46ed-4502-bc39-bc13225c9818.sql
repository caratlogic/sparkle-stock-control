-- Add updated_by columns to all relevant tables for user tracking
ALTER TABLE public.gems 
ADD COLUMN updated_by TEXT;

ALTER TABLE public.customers 
ADD COLUMN updated_by TEXT;

ALTER TABLE public.invoices 
ADD COLUMN updated_by TEXT;

ALTER TABLE public.consignments 
ADD COLUMN updated_by TEXT;

ALTER TABLE public.credit_notes 
ADD COLUMN updated_by TEXT;

ALTER TABLE public.customer_reminders 
ADD COLUMN updated_by TEXT;

-- Create table for storing column customization settings per user
CREATE TABLE public.column_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    table_name TEXT NOT NULL,
    column_key TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, table_name, column_key)
);

-- Enable RLS on column_customizations
ALTER TABLE public.column_customizations ENABLE ROW LEVEL SECURITY;

-- Create policy for column_customizations (users can only see their own)
CREATE POLICY "Users can manage their own column customizations" 
ON public.column_customizations 
FOR ALL 
USING (true);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_column_customizations_updated_at
BEFORE UPDATE ON public.column_customizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();