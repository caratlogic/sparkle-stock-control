-- Add default value for color_comment
ALTER TABLE public.gems 
ALTER COLUMN color_comment SET DEFAULT 'none';