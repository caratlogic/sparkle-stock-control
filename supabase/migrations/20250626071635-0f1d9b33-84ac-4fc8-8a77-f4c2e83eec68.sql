
-- Add image_url column to gems table
ALTER TABLE public.gems 
ADD COLUMN image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.gems.image_url IS 'URL or path to the product image';
