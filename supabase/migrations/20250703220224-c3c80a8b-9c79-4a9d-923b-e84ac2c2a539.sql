-- Add status column to gems table
ALTER TABLE public.gems ADD COLUMN status TEXT NOT NULL DEFAULT 'In Stock';

-- Add check constraint to ensure valid status values
ALTER TABLE public.gems ADD CONSTRAINT gems_status_check 
CHECK (status IN ('In Stock', 'Reserved', 'Sold'));

-- Create index for better performance on status queries
CREATE INDEX idx_gems_status ON public.gems(status);

-- Update existing gems status based on relationships
UPDATE public.gems 
SET status = CASE 
  WHEN id IN (
    SELECT DISTINCT gem_id FROM invoice_items
  ) THEN 'Sold'
  WHEN id IN (
    SELECT DISTINCT gem_id FROM consignment_items 
    WHERE consignment_id IN (
      SELECT id FROM consignments WHERE status = 'pending'
    )
  ) THEN 'Reserved'
  ELSE 'In Stock'
END;