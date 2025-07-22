-- Force a complete refresh of all gem data with proper REPLICA IDENTITY
-- This ensures real-time subscriptions work correctly

-- Set up proper replica identity for real-time updates
ALTER TABLE public.gems REPLICA IDENTITY FULL;

-- Add gems table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'gems'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gems;
  END IF;
END $$;

-- Force update all gems to trigger real-time refresh
UPDATE public.gems 
SET updated_at = NOW() 
WHERE stock_type = 'single';

-- Also update gems that have been invoiced to ensure frontend sync
UPDATE public.gems 
SET updated_at = NOW()
WHERE id IN (
  SELECT DISTINCT gem_id FROM invoice_items
);