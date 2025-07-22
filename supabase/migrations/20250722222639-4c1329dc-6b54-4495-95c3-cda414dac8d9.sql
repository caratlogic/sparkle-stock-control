-- Force update all sold single stock type gems to trigger real-time subscription
UPDATE public.gems 
SET updated_at = NOW()
WHERE stock_type = 'single' 
  AND status = 'Sold';