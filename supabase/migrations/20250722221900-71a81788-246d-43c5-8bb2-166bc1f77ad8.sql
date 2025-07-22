-- Comprehensive fix for all single stock type gems that have been invoiced
-- This ensures the frontend data is correctly synchronized

-- First, fix SA0041 specifically to ensure it's properly updated
UPDATE public.gems 
SET 
  status = 'Sold',
  in_stock = 0,
  reserved = 0,
  carat = 0,
  updated_at = NOW()
WHERE stock_id = 'SA0041' AND stock_type = 'single';

-- Fix ALL single stock type gems that have invoice items but incorrect status/quantities
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
  AND (status != 'Sold' OR in_stock > 0 OR carat > 0 OR reserved > 0);

-- Update the updated_at timestamp for all affected gems to force frontend refresh
UPDATE public.gems 
SET updated_at = NOW()
WHERE stock_type = 'single' 
  AND id IN (
    SELECT DISTINCT gem_id FROM invoice_items
  );