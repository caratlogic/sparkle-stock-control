-- Remove ownership_percentage from partners table since percentage will be per gem
ALTER TABLE public.partners DROP COLUMN IF EXISTS ownership_percentage;

-- Add partner_percentage column to gems table for individual gem percentages
ALTER TABLE public.gems ADD COLUMN IF NOT EXISTS partner_percentage numeric DEFAULT 0;

-- Update existing gems with partner ownership to have a default percentage
UPDATE public.gems 
SET partner_percentage = 50 
WHERE ownership_status = 'P' AND partner_percentage = 0;