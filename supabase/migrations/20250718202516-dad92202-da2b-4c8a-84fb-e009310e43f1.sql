-- First, update empty string color_comment values to 'none'
UPDATE public.gems 
SET color_comment = 'none' 
WHERE color_comment = '';

-- Also handle any potential NULL values for consistency
UPDATE public.gems 
SET color_comment = 'none' 
WHERE color_comment IS NULL;

-- Now add the color_comment check constraint
ALTER TABLE public.gems 
ADD CONSTRAINT gems_color_comment_check 
CHECK (color_comment = ANY (ARRAY['none'::text, 'RB'::text, 'I'::text, 'CF'::text, 'VD'::text, 'PB'::text]));