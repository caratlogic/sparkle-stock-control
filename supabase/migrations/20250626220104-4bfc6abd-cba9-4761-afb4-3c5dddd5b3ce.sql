
-- Add new columns to gems table based on the screenshot
ALTER TABLE public.gems 
ADD COLUMN IF NOT EXISTS measurements_mm TEXT,
ADD COLUMN IF NOT EXISTS price_in_letters TEXT,
ADD COLUMN IF NOT EXISTS total_in_letters TEXT,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS old_code TEXT,
ADD COLUMN IF NOT EXISTS stone_description TEXT,
ADD COLUMN IF NOT EXISTS shape_detail TEXT,
ADD COLUMN IF NOT EXISTS box_number TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN public.gems.measurements_mm IS 'Physical measurements of the gem in millimeters';
COMMENT ON COLUMN public.gems.price_in_letters IS 'Price written in letters format';
COMMENT ON COLUMN public.gems.total_in_letters IS 'Total value written in letters format';
COMMENT ON COLUMN public.gems.purchase_date IS 'Date when the gem was purchased';
COMMENT ON COLUMN public.gems.old_code IS 'Previous or alternative code for the gem';
COMMENT ON COLUMN public.gems.stone_description IS 'Detailed description of the stone';
COMMENT ON COLUMN public.gems.shape_detail IS 'Detailed shape information';
COMMENT ON COLUMN public.gems.box_number IS 'Storage box number for the gem';
