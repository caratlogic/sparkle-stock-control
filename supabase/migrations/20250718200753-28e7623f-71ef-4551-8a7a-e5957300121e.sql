-- Add currency column to customers table
ALTER TABLE public.customers 
ADD COLUMN currency text NOT NULL DEFAULT 'USD';

-- Add a check constraint to ensure valid currency codes
ALTER TABLE public.customers 
ADD CONSTRAINT customers_currency_check 
CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD'));