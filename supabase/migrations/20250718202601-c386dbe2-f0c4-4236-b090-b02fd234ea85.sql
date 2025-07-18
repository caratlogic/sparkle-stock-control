-- Update any NULL treatment values to 'none'
UPDATE public.gems 
SET treatment = 'none' 
WHERE treatment IS NULL;

-- Update any NULL certificate_type values to 'none'
UPDATE public.gems 
SET certificate_type = 'none' 
WHERE certificate_type IS NULL;

-- Make treatment and certificate_type NOT NULL with default values
ALTER TABLE public.gems 
ALTER COLUMN treatment SET DEFAULT 'none',
ALTER COLUMN treatment SET NOT NULL;

ALTER TABLE public.gems 
ALTER COLUMN certificate_type SET DEFAULT 'none',
ALTER COLUMN certificate_type SET NOT NULL;