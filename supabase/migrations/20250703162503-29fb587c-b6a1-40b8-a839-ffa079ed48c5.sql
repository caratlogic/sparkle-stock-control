-- Add new columns to gems table for enhanced gem tracking
ALTER TABLE public.gems 
ADD COLUMN treatment TEXT CHECK (treatment IN ('H', 'NH', 'NO', 'MI')),
ADD COLUMN color_comment TEXT,
ADD COLUMN certificate_type TEXT CHECK (certificate_type IN ('GRA', 'GRS', 'SSEF', 'GUB', 'GIA', 'AGL', 'CGL', 'CD', 'IGI', 'HRD')),
ADD COLUMN supplier TEXT,
ADD COLUMN origin TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.gems.treatment IS 'H=Heated, NH=No Heat, NO=No Oil, MI=Minor';
COMMENT ON COLUMN public.gems.color_comment IS 'Color details: RB=Royal, I=Intense, CF=Cornflower, VD=Vivid, PB=Pigeonsblood';
COMMENT ON COLUMN public.gems.certificate_type IS 'Certification body that issued the certificate';
COMMENT ON COLUMN public.gems.supplier IS 'Source/supplier of the gem';
COMMENT ON COLUMN public.gems.origin IS 'Geographic origin of the stone';