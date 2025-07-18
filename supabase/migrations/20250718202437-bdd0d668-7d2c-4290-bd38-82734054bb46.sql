-- Add color_comment check constraint to ensure consistency
ALTER TABLE public.gems 
ADD CONSTRAINT gems_color_comment_check 
CHECK (color_comment IS NULL OR color_comment = ANY (ARRAY['none'::text, 'RB'::text, 'I'::text, 'CF'::text, 'VD'::text, 'PB'::text]));