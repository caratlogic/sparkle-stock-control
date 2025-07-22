-- Comprehensive fix for ALL single stock type gems that have been invoiced
-- This ensures all single stock gems are properly marked as sold with correct quantities

-- Fix ALL single stock type gems that have invoice items but incorrect status/quantities
UPDATE public.gems 
SET 
  status = 'Sold',
  in_stock = 0,
  reserved = 0,
  sold = 1,
  carat = 0,
  updated_at = NOW()
WHERE stock_type = 'single' 
  AND id IN (
    SELECT DISTINCT gem_id FROM invoice_items
  )
  AND (status != 'Sold' OR in_stock > 0 OR carat > 0 OR reserved > 0 OR sold = 0);

-- Also ensure invoice items have correct carat_purchased values for single stock gems
UPDATE public.invoice_items 
SET carat_purchased = (
  SELECT CASE 
    WHEN g.stock_type = 'single' THEN g.carat
    ELSE invoice_items.carat_purchased
  END
  FROM gems g 
  WHERE g.id = invoice_items.gem_id
)
WHERE gem_id IN (
  SELECT id FROM gems WHERE stock_type = 'single'
) 
AND carat_purchased = 0;

-- Force update all single stock type gems to trigger real-time subscription refresh
UPDATE public.gems 
SET updated_at = NOW()
WHERE stock_type = 'single';