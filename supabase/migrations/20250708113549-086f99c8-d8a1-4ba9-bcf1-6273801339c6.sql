-- Add carat field to invoice_items table
ALTER TABLE public.invoice_items 
ADD COLUMN carat_purchased numeric NOT NULL DEFAULT 0;

-- Add carat field to consignment_items table  
ALTER TABLE public.consignment_items
ADD COLUMN carat_consigned numeric NOT NULL DEFAULT 0;

-- Add comment to clarify the new gem table structure
COMMENT ON COLUMN public.gems.carat IS 'Total carat weight of all stones in this stock';
COMMENT ON COLUMN public.gems.in_stock IS 'Total number of individual stones in this stock';
COMMENT ON COLUMN public.invoice_items.carat_purchased IS 'Total carat weight purchased from this stock';
COMMENT ON COLUMN public.consignment_items.carat_consigned IS 'Total carat weight consigned from this stock';