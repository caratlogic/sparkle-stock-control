-- Add stock_type column to gems table
ALTER TABLE public.gems 
ADD COLUMN stock_type TEXT NOT NULL DEFAULT 'single';

-- Add check constraint for valid stock types
ALTER TABLE public.gems 
ADD CONSTRAINT stock_type_check CHECK (stock_type IN ('single', 'parcel', 'set'));