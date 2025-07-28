-- Add minimal sample data for functional dashboards

-- Insert sample gem settings
INSERT INTO gem_settings (setting_type, value, gem_type, is_active, display_order) VALUES
('cut', 'Round', 'Diamond', true, 1),
('cut', 'Princess', 'Diamond', true, 2),
('color', 'D', 'Diamond', true, 1),
('color', 'E', 'Diamond', true, 2),
('clarity', 'FL', 'Diamond', true, 1),
('clarity', 'IF', 'Diamond', true, 2);

-- Insert sample gems
INSERT INTO gems (stock_id, gem_type, carat, color, shape, price, cost_price, status, ownership_status, associated_entity, certificate_number, certificate_type) VALUES
('GEM001', 'Diamond', 1.50, 'D', 'Round', 15000, 10000, 'In Stock', 'O', 'Self', 'CERT001', 'GIA'),
('GEM002', 'Diamond', 2.00, 'E', 'Princess', 25000, 18000, 'In Stock', 'O', 'Self', 'CERT002', 'GIA'),
('GEM003', 'Emerald', 1.20, 'Green', 'Emerald', 8000, 5500, 'In Stock', 'O', 'Self', 'CERT003', 'GRS');

-- Insert sample partners
INSERT INTO partners (name, email, phone, company, status) VALUES
('Partner One', 'partner1@example.com', '+1234567890', 'Partner Co.', 'active'),
('Partner Two', 'partner2@example.com', '+1234567891', 'Diamond Inc.', 'active');

-- Insert sample associated entities
INSERT INTO associated_entities (name, email, phone, company, status) VALUES
('Entity One', 'entity1@example.com', '+1234567892', 'Entity Corp.', 'active'),
('Entity Two', 'entity2@example.com', '+1234567893', 'Gem LLC', 'active');