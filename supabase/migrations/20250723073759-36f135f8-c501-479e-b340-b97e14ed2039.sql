-- Add ownership status and associated entity columns to gems table
ALTER TABLE public.gems 
ADD COLUMN ownership_status TEXT NOT NULL DEFAULT 'O',
ADD COLUMN associated_entity TEXT NOT NULL DEFAULT 'Self';

-- Add check constraint for valid ownership status values
ALTER TABLE public.gems 
ADD CONSTRAINT gems_ownership_status_check 
CHECK (ownership_status IN ('P', 'M', 'O'));