
-- Remove cut and clarity columns and add measurement and description columns
ALTER TABLE public.gems 
DROP COLUMN IF EXISTS cut,
DROP COLUMN IF EXISTS clarity;

-- Add new columns (measurement and description)
-- Note: measurements_mm and stone_description already exist from previous migration
-- So we'll just ensure they exist and add comments
ALTER TABLE public.gems 
ADD COLUMN IF NOT EXISTS measurements_mm TEXT,
ADD COLUMN IF NOT EXISTS stone_description TEXT;

-- Update comments
COMMENT ON COLUMN public.gems.measurements_mm IS 'Physical measurements of the gem';
COMMENT ON COLUMN public.gems.stone_description IS 'Detailed description of the stone';
