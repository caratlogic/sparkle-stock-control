-- Make color_comment NOT NULL since it now has a constraint and defaults to 'none'
ALTER TABLE public.gems 
ALTER COLUMN color_comment SET NOT NULL;