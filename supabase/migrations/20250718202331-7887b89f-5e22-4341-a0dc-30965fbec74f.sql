-- Update the certificate_type check constraint to include 'none' as a valid option
ALTER TABLE public.gems 
DROP CONSTRAINT gems_certificate_type_check;

ALTER TABLE public.gems 
ADD CONSTRAINT gems_certificate_type_check 
CHECK (certificate_type = ANY (ARRAY['none'::text, 'GRA'::text, 'GRS'::text, 'SSEF'::text, 'GUB'::text, 'GIA'::text, 'AGL'::text, 'CGL'::text, 'CD'::text, 'IGI'::text, 'HRD'::text]));

-- Update the treatment check constraint to include 'none' as a valid option
ALTER TABLE public.gems 
DROP CONSTRAINT gems_treatment_check;

ALTER TABLE public.gems 
ADD CONSTRAINT gems_treatment_check 
CHECK (treatment = ANY (ARRAY['none'::text, 'H'::text, 'NH'::text, 'NO'::text, 'MI'::text]));