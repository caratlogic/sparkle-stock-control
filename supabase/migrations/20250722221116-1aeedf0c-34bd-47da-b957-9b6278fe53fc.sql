-- First, let's check the current status of EM0030 and other single stock type gems that have been invoiced
-- Fix EM0030 specifically
UPDATE public.gems 
SET 
  status = 'Sold',
  in_stock = 0,
  reserved = 0,
  carat = 0,
  updated_at = NOW()
WHERE stock_id = 'EM0030' AND stock_type = 'single';

-- Fix TO0033 specifically  
UPDATE public.gems 
SET 
  status = 'Sold',
  in_stock = 0,
  reserved = 0,
  carat = 0,
  updated_at = NOW()
WHERE stock_id = 'TO0033' AND stock_type = 'single';

-- Fix ALL single stock type gems that have been sold (have invoice items) but still show as in stock
UPDATE public.gems 
SET 
  status = 'Sold',
  in_stock = 0,
  reserved = 0,
  carat = 0,
  updated_at = NOW()
WHERE stock_type = 'single' 
  AND id IN (
    SELECT DISTINCT gem_id FROM invoice_items
  )
  AND (status != 'Sold' OR in_stock > 0 OR carat > 0);

-- Update invoice items for single stock type gems to have correct carat_purchased values
UPDATE public.invoice_items 
SET carat_purchased = (
  SELECT g.carat 
  FROM gems g 
  WHERE g.id = invoice_items.gem_id 
    AND g.stock_type = 'single'
)
WHERE gem_id IN (
  SELECT id FROM gems WHERE stock_type = 'single'
) 
AND carat_purchased = 0;