-- Insert sample suppliers
INSERT INTO public.suppliers (
  supplier_id, name, email, phone, country, address, 
  payment_terms, credit_limit, reliability_rating, 
  total_purchase_history, status, performance_notes
) VALUES 
(
  'SUP001', 'Diamond Direct Ltd', 'contact@diamonddirect.com', '+1-555-0001', 'India',
  '123 Diamond Street, Mumbai, Maharashtra, India',
  'Net 30', 100000, 5, 45000, 'active', 'Excellent quality diamonds, reliable delivery'
),
(
  'SUP002', 'Emerald Excellence Inc', 'sales@emeraldexcellence.com', '+57-555-0002', 'Colombia',
  '456 Emerald Ave, Bogotá, Colombia',
  'Net 45', 75000, 4, 32000, 'active', 'Premium emeralds, occasional delays'
),
(
  'SUP003', 'Ruby Royal Gems', 'info@rubyroyal.com', '+66-555-0003', 'Thailand',
  '789 Ruby Road, Bangkok, Thailand',
  'Net 15', 50000, 3, 18500, 'active', 'Good selection, competitive prices'
),
(
  'SUP004', 'Sapphire Sources', 'orders@sapphiresources.com', '+94-555-0004', 'Sri Lanka',
  '321 Sapphire Lane, Colombo, Sri Lanka',
  'Net 60', 80000, 4, 28000, 'active', 'High-quality sapphires, good communication'
),
(
  'SUP005', 'Global Gem Trading', 'trade@globalgems.com', '+1-555-0005', 'USA',
  '654 Trade Center, New York, NY, USA',
  'Net 30', 120000, 5, 67000, 'active', 'Diverse inventory, excellent service'
);

-- Insert sample purchases
INSERT INTO public.purchases (
  purchase_id, invoice_number, supplier_id, purchase_date, due_date,
  subtotal, tax_rate, tax_amount, total_amount, currency, status, notes
) VALUES 
(
  'PUR001', 'INV-2024-001', 
  (SELECT id FROM suppliers WHERE supplier_id = 'SUP001'),
  '2024-01-15', '2024-02-14',
  15000, 8.5, 1275, 16275, 'USD', 'paid', 'Premium diamond collection'
),
(
  'PUR002', 'INV-2024-002',
  (SELECT id FROM suppliers WHERE supplier_id = 'SUP002'),
  '2024-02-10', '2024-03-26',
  12000, 8.5, 1020, 13020, 'USD', 'paid', 'High-grade emeralds for special collection'
),
(
  'PUR003', 'INV-2024-003',
  (SELECT id FROM suppliers WHERE supplier_id = 'SUP003'),
  '2024-03-05', '2024-03-20',
  8500, 8.5, 722.5, 9222.5, 'USD', 'pending', 'Ruby selection for spring collection'
),
(
  'PUR004', 'INV-2024-004',
  (SELECT id FROM suppliers WHERE supplier_id = 'SUP004'),
  '2024-03-20', '2024-05-19',
  18000, 8.5, 1530, 19530, 'USD', 'partial', 'Sapphire bulk order'
),
(
  'PUR005', 'INV-2024-005',
  (SELECT id FROM suppliers WHERE supplier_id = 'SUP005'),
  '2024-04-01', '2024-05-01',
  25000, 8.5, 2125, 27125, 'USD', 'paid', 'Mixed gemstone inventory restock'
);

-- Insert sample purchase items
INSERT INTO public.purchase_items (
  purchase_id, gem_type, carat, quantity, price_per_unit, total_price,
  shape, color, treatment, measurements, certificate_type, origin, description
) VALUES 
-- Items for PUR001
(
  (SELECT id FROM purchases WHERE purchase_id = 'PUR001'),
  'Diamond', 2.5, 5, 3000, 15000,
  'Round', 'White', 'none', '8.0 x 8.0 x 5.0 mm', 'GIA', 'India', 'Premium white diamonds'
),
-- Items for PUR002
(
  (SELECT id FROM purchases WHERE purchase_id = 'PUR002'),
  'Emerald', 3.2, 8, 1500, 12000,
  'Oval', 'Green', 'oiled', '10.0 x 8.0 x 6.0 mm', 'Gübelin', 'Colombia', 'High-grade Colombian emeralds'
),
-- Items for PUR003
(
  (SELECT id FROM purchases WHERE purchase_id = 'PUR003'),
  'Ruby', 1.8, 10, 850, 8500,
  'Cushion', 'Red', 'heated', '7.0 x 7.0 x 4.5 mm', 'SSEF', 'Thailand', 'Heat-treated Thai rubies'
),
-- Items for PUR004
(
  (SELECT id FROM purchases WHERE purchase_id = 'PUR004'),
  'Sapphire', 4.1, 12, 1500, 18000,
  'Oval', 'Blue', 'none', '9.0 x 7.0 x 5.5 mm', 'Lotus', 'Sri Lanka', 'Unheated Ceylon sapphires'
),
-- Items for PUR005
(
  (SELECT id FROM purchases WHERE purchase_id = 'PUR005'),
  'Mixed', 15.6, 20, 1250, 25000,
  'Various', 'Various', 'various', 'Various sizes', 'various', 'Various', 'Mixed gemstone lot for inventory'
);