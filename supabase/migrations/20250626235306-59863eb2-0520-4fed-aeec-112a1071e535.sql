
-- Remove clarity and shape columns, add description and measurements columns to gems table
ALTER TABLE public.gems 
DROP COLUMN IF EXISTS clarity,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS measurements TEXT;

-- Update existing gems to have some default values for the new columns
UPDATE public.gems 
SET description = COALESCE(notes, 'No description available'),
    measurements = COALESCE(measurements_mm, 'Not specified')
WHERE description IS NULL OR measurements IS NULL;
