-- Update existing gems to link them to partners and entities based on ownership status
-- For partner stones (ownership_status = 'P'), update the associated_entity to match a partner name
-- For memo stones (ownership_status = 'M'), keep or set associated_entity to an entity name

-- First, let's add some example data to link existing stones
-- Update partner stones to reference existing partners (if any)
UPDATE gems 
SET associated_entity = (
  SELECT name 
  FROM partners 
  WHERE status = 'active' 
  ORDER BY created_at 
  LIMIT 1
)
WHERE ownership_status = 'P' 
  AND associated_entity = 'Self'
  AND EXISTS (SELECT 1 FROM partners WHERE status = 'active');

-- Update memo stones to reference existing entities (if any)
UPDATE gems 
SET associated_entity = (
  SELECT name 
  FROM associated_entities 
  WHERE status = 'active' 
  ORDER BY created_at 
  LIMIT 1
)
WHERE ownership_status = 'M' 
  AND associated_entity = 'Self'
  AND EXISTS (SELECT 1 FROM associated_entities WHERE status = 'active');

-- Create a function to validate ownership status and associated entity consistency
CREATE OR REPLACE FUNCTION validate_gem_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- If ownership_status is 'P' (Partner), ensure associated_entity exists in partners table
  IF NEW.ownership_status = 'P' AND NEW.associated_entity != 'Self' THEN
    IF NOT EXISTS (SELECT 1 FROM partners WHERE name = NEW.associated_entity AND status = 'active') THEN
      RAISE EXCEPTION 'Associated entity "%" must exist as an active partner for partner stones', NEW.associated_entity;
    END IF;
  END IF;
  
  -- If ownership_status is 'M' (Memo), ensure associated_entity exists in associated_entities table
  IF NEW.ownership_status = 'M' AND NEW.associated_entity != 'Self' THEN
    IF NOT EXISTS (SELECT 1 FROM associated_entities WHERE name = NEW.associated_entity AND status = 'active') THEN
      RAISE EXCEPTION 'Associated entity "%" must exist as an active associated entity for memo stones', NEW.associated_entity;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate gem ownership consistency
CREATE TRIGGER validate_gem_ownership_trigger
  BEFORE INSERT OR UPDATE ON gems
  FOR EACH ROW
  EXECUTE FUNCTION validate_gem_ownership();