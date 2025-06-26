
-- Add shape column to gems table
ALTER TABLE public.gems 
ADD COLUMN IF NOT EXISTS shape TEXT;

-- Update existing gems with random shape values and fill measurements/descriptions
UPDATE public.gems 
SET 
  shape = CASE 
    WHEN id IN (SELECT id FROM public.gems ORDER BY id LIMIT 1) THEN 'Round'
    WHEN id IN (SELECT id FROM public.gems ORDER BY id LIMIT 1 OFFSET 1) THEN 'Heart'
    WHEN id IN (SELECT id FROM public.gems ORDER BY id LIMIT 1 OFFSET 2) THEN 'Oval'
    WHEN id IN (SELECT id FROM public.gems ORDER BY id LIMIT 1 OFFSET 3) THEN 'Princess'
    WHEN id IN (SELECT id FROM public.gems ORDER BY id LIMIT 1 OFFSET 4) THEN 'Emerald'
    ELSE 'Cushion'
  END,
  measurements_mm = CASE 
    WHEN measurements_mm IS NULL OR measurements_mm = '' THEN 
      CASE 
        WHEN carat < 1 THEN '5.0 x 5.0 x 3.0'
        WHEN carat < 2 THEN '7.0 x 7.0 x 4.5'
        WHEN carat < 3 THEN '8.5 x 6.2 x 5.1'
        ELSE '10.0 x 8.0 x 6.0'
      END
    ELSE measurements_mm
  END,
  stone_description = CASE 
    WHEN stone_description IS NULL OR stone_description = '' THEN 
      CASE 
        WHEN gem_type = 'Diamond' THEN 'Brilliant cut with excellent fire and scintillation'
        WHEN gem_type = 'Ruby' THEN 'Deep red color with excellent clarity'
        WHEN gem_type = 'Emerald' THEN 'Vivid green with natural inclusions'
        WHEN gem_type = 'Sapphire' THEN 'Royal blue with exceptional brilliance'
        ELSE 'Beautiful natural gemstone with excellent quality'
      END
    ELSE stone_description
  END
WHERE shape IS NULL OR measurements_mm IS NULL OR measurements_mm = '' OR stone_description IS NULL OR stone_description = '';

-- Add comment for the new column
COMMENT ON COLUMN public.gems.shape IS 'Shape/cut of the gemstone (Round, Heart, Oval, etc.)';
