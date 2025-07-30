-- Update purchase_items table to align with gem inventory system
ALTER TABLE purchase_items 
DROP COLUMN IF EXISTS clarity,
DROP COLUMN IF EXISTS cut,
DROP COLUMN IF EXISTS polish,
DROP COLUMN IF EXISTS symmetry,
DROP COLUMN IF EXISTS fluorescence;

-- Add gem-specific fields that match current inventory
ALTER TABLE purchase_items 
ADD COLUMN gem_type TEXT,
ADD COLUMN shape TEXT,
ADD COLUMN color TEXT,
ADD COLUMN treatment TEXT DEFAULT 'none',
ADD COLUMN origin TEXT,
ADD COLUMN certificate_type TEXT DEFAULT 'none',
ADD COLUMN certificate_number TEXT,
ADD COLUMN measurements TEXT,
ADD COLUMN description TEXT;