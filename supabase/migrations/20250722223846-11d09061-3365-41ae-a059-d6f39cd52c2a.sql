-- Force update all single stock type gems that are sold to trigger real-time updates
UPDATE public.gems 
SET updated_at = NOW()
WHERE stock_type = 'single' 
  AND status = 'Sold';