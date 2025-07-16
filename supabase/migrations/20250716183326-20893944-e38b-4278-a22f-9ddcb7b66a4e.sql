-- Add retail_price column to gems table
ALTER TABLE public.gems ADD COLUMN retail_price numeric DEFAULT 0;

-- Update existing gems to have retail_price equal to price initially
UPDATE public.gems SET retail_price = price WHERE retail_price IS NULL OR retail_price = 0;