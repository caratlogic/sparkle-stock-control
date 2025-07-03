-- Remove status column and add quantity columns to gems table
ALTER TABLE public.gems 
DROP COLUMN status,
ADD COLUMN in_stock INTEGER NOT NULL DEFAULT 1,
ADD COLUMN reserved INTEGER NOT NULL DEFAULT 0,
ADD COLUMN sold INTEGER NOT NULL DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.gems.in_stock IS 'Current available quantity in inventory';
COMMENT ON COLUMN public.gems.reserved IS 'Quantity currently on consignment/reserved';
COMMENT ON COLUMN public.gems.sold IS 'Quantity that has been sold';

-- Add check constraints to ensure quantities are non-negative
ALTER TABLE public.gems 
ADD CONSTRAINT check_in_stock_non_negative CHECK (in_stock >= 0),
ADD CONSTRAINT check_reserved_non_negative CHECK (reserved >= 0),
ADD CONSTRAINT check_sold_non_negative CHECK (sold >= 0);