-- Add minimal sample data for functional dashboards

-- Insert sample gems
INSERT INTO gems (stock_id, gem_type, carat, color, shape, price, cost_price, status, ownership_status, associated_entity, certificate_number, certificate_type) VALUES
('GEM001', 'Diamond', 1.50, 'D', 'Round', 15000, 10000, 'In Stock', 'O', 'Self', 'CERT001', 'GIA'),
('GEM002', 'Diamond', 2.00, 'E', 'Princess', 25000, 18000, 'In Stock', 'O', 'Self', 'CERT002', 'GIA'),
('GEM003', 'Emerald', 1.20, 'Green', 'Emerald', 8000, 5500, 'In Stock', 'O', 'Self', 'CERT003', 'GRS');

-- Insert sample partners if none exist
INSERT INTO partners (name, email, phone, company, status) 
SELECT 'Partner One', 'partner1@example.com', '+1234567890', 'Partner Co.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE email = 'partner1@example.com');

INSERT INTO partners (name, email, phone, company, status) 
SELECT 'Partner Two', 'partner2@example.com', '+1234567891', 'Diamond Inc.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE email = 'partner2@example.com');

-- Insert sample associated entities if none exist
INSERT INTO associated_entities (name, email, phone, company, status) 
SELECT 'Entity One', 'entity1@example.com', '+1234567892', 'Entity Corp.', 'active'
WHERE NOT EXISTS (SELECT 1 FROM associated_entities WHERE email = 'entity1@example.com');

INSERT INTO associated_entities (name, email, phone, company, status) 
SELECT 'Entity Two', 'entity2@example.com', '+1234567893', 'Gem LLC', 'active'
WHERE NOT EXISTS (SELECT 1 FROM associated_entities WHERE email = 'entity2@example.com');