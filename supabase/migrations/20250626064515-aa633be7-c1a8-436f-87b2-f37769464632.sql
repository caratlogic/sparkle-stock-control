
-- Create gems table
CREATE TABLE public.gems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id TEXT NOT NULL UNIQUE,
  gem_type TEXT NOT NULL,
  carat DECIMAL(8,2) NOT NULL,
  cut TEXT NOT NULL,
  color TEXT NOT NULL,
  clarity TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2) NOT NULL,
  certificate_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Stock',
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  tax_id TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  total_purchases DECIMAL(12,2) DEFAULT 0,
  last_purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 8.5,
  tax_amount DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  date_due DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  gem_id UUID NOT NULL REFERENCES public.gems(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consignments table
CREATE TABLE public.consignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consignment_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consignment_items table
CREATE TABLE public.consignment_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consignment_id UUID NOT NULL REFERENCES public.consignments(id) ON DELETE CASCADE,
  gem_id UUID NOT NULL REFERENCES public.gems(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample gems data
INSERT INTO public.gems (stock_id, gem_type, carat, cut, color, clarity, price, cost_price, certificate_number, status, date_added, notes) VALUES
('DM0001', 'Diamond', 1.25, 'Round', 'D', 'VVS1', 12500.00, 8500.00, 'GIA-1234567890', 'In Stock', '2024-06-20', 'Excellent quality diamond with perfect cut'),
('DM0002', 'Diamond', 2.01, 'Princess', 'E', 'VS1', 18750.00, 13200.00, 'GIA-2345678901', 'Sold', '2024-06-18', 'Large princess cut diamond'),
('DM0003', 'Diamond', 0.75, 'Round', 'F', 'VVS2', 6500.00, 4800.00, 'GIA-3456789012', 'In Stock', '2024-06-22', 'Beautiful round brilliant cut'),
('EM0001', 'Emerald', 2.15, 'Emerald', 'Vivid Green', 'VS1', 18500.00, 13200.00, 'GRS-2345678901', 'Reserved', '2024-06-18', 'Large emerald with excellent color'),
('EM0002', 'Emerald', 1.83, 'Oval', 'Green', 'VS2', 12800.00, 9100.00, 'GRS-3456789012', 'In Stock', '2024-06-19', 'High quality emerald'),
('EM0003', 'Emerald', 3.12, 'Emerald', 'Slightly Bluish Green', 'SI1', 15600.00, 11200.00, 'GRS-4567890123', 'Sold', '2024-06-15', 'Large emerald with unique color'),
('RB0001', 'Ruby', 0.95, 'Oval', 'Vivid Red', 'VS2', 8500.00, 6100.00, 'SSEF-3456789012', 'In Stock', '2024-06-15', 'Excellent ruby with vivid color'),
('RB0002', 'Ruby', 1.42, 'Round', 'Red', 'VS1', 12300.00, 8900.00, 'SSEF-4567890123', 'Sold', '2024-06-12', 'Beautiful round ruby'),
('RB0003', 'Ruby', 2.28, 'Cushion', 'Slightly Purplish Red', 'SI1', 16800.00, 12100.00, 'SSEF-5678901234', 'In Stock', '2024-06-17', 'Large cushion cut ruby'),
('SP0001', 'Sapphire', 1.50, 'Round', 'Blue', 'SI1', 9500.00, 6800.00, 'AIGS-4567890123', 'Sold', '2024-06-10', 'Sold to Johnson Jewelry'),
('SP0002', 'Sapphire', 2.75, 'Oval', 'Pink', 'VS2', 14200.00, 10100.00, 'AIGS-5678901234', 'In Stock', '2024-06-16', 'Rare pink sapphire'),
('SP0003', 'Sapphire', 1.95, 'Emerald', 'Yellow', 'VS1', 11800.00, 8500.00, 'AIGS-6789012345', 'Reserved', '2024-06-14', 'Beautiful yellow sapphire'),
('AM0001', 'Amethyst', 3.02, 'Emerald', 'Deep Purple', 'VVS2', 1500.00, 950.00, 'GIT-5678901234', 'In Stock', '2024-06-25', 'Large amethyst with excellent clarity'),
('AM0002', 'Amethyst', 4.55, 'Oval', 'Purple', 'VS1', 2100.00, 1350.00, 'GIT-6789012345', 'In Stock', '2024-06-23', 'Large oval amethyst'),
('AQ0001', 'Aquamarine', 4.25, 'Oval', 'Deep Blue', 'VVS1', 3200.00, 2100.00, 'GUILD-6789012345', 'In Stock', '2024-06-22', 'Beautiful aquamarine with excellent blue color'),
('AQ0002', 'Aquamarine', 5.88, 'Emerald', 'Blue', 'VS2', 4500.00, 3100.00, 'GUILD-7890123456', 'Sold', '2024-06-11', 'Large emerald cut aquamarine'),
('GT0001', 'Garnet', 2.34, 'Round', 'Red', 'VS1', 850.00, 520.00, 'GIT-7890123456', 'In Stock', '2024-06-21', 'Beautiful red garnet'),
('GT0002', 'Garnet', 3.67, 'Oval', 'Orange', 'SI1', 1200.00, 780.00, 'GIT-8901234567', 'In Stock', '2024-06-20', 'Rare orange garnet'),
('OP0001', 'Opal', 1.89, 'Cabochon', 'White', 'Translucent', 950.00, 650.00, 'GIT-9012345678', 'In Stock', '2024-06-24', 'Beautiful white opal with play of color'),
('TP0001', 'Topaz', 6.45, 'Emerald', 'Blue', 'VVS1', 2800.00, 1900.00, 'GIT-0123456789', 'In Stock', '2024-06-19', 'Large blue topaz'),
('TR0001', 'Tourmaline', 2.12, 'Oval', 'Pink', 'VS2', 1650.00, 1100.00, 'GIT-1234567890', 'Reserved', '2024-06-18', 'Beautiful pink tourmaline');

-- Insert sample customers data
INSERT INTO public.customers (customer_id, name, email, phone, company, tax_id, street, city, state, zip_code, country, date_added, total_purchases, last_purchase_date, notes) VALUES
('CUST001', 'John Smith', 'john.smith@example.com', '+1-555-0123', 'Smith Jewelry Co.', 'TAX123456', '123 Main Street', 'New York', 'NY', '10001', 'USA', '2024-01-15', 65000.00, '2024-06-20', 'Frequent customer, prefers emeralds and diamonds'),
('CUST002', 'Sarah Johnson', 'sarah.johnson@example.com', '+1-555-0124', 'Elite Gems LLC', 'TAX234567', '456 Oak Avenue', 'Los Angeles', 'CA', '90210', 'USA', '2024-02-20', 98000.00, '2024-06-22', 'High-end client, interested in large diamonds and rubies'),
('CUST003', 'Michael Brown', 'michael.brown@example.com', '+1-555-0125', NULL, NULL, '789 Pine Road', 'Chicago', 'IL', '60601', 'USA', '2024-03-10', 34000.00, '2024-06-15', 'Collector, focuses on rare colored stones'),
('CUST004', 'Emily Davis', 'emily.davis@example.com', '+1-555-0126', 'Davis Fine Jewelry', 'TAX345678', '321 Elm Street', 'Miami', 'FL', '33101', 'USA', '2024-01-25', 52000.00, '2024-06-18', 'Specializes in sapphires and aquamarines'),
('CUST005', 'Robert Wilson', 'robert.wilson@example.com', '+1-555-0127', 'Wilson Gems & Minerals', 'TAX456789', '654 Maple Drive', 'Seattle', 'WA', '98101', 'USA', '2024-04-05', 28000.00, '2024-06-12', 'Bulk buyer, interested in semi-precious stones'),
('CUST006', 'Lisa Anderson', 'lisa.anderson@example.com', '+1-555-0128', NULL, NULL, '987 Cedar Lane', 'Denver', 'CO', '80201', 'USA', '2024-02-14', 41000.00, '2024-06-16', 'Private collector, prefers certified stones'),
('CUST007', 'David Martinez', 'david.martinez@example.com', '+1-555-0129', 'Martinez Luxury Jewels', 'TAX567890', '147 Birch Boulevard', 'Phoenix', 'AZ', '85001', 'USA', '2024-03-22', 73000.00, '2024-06-21', 'High-volume dealer, quick transactions'),
('CUST008', 'Jennifer Taylor', 'jennifer.taylor@example.com', '+1-555-0130', 'Taylor & Associates', 'TAX678901', '258 Spruce Street', 'Boston', 'MA', '02101', 'USA', '2024-01-08', 36000.00, '2024-06-14', 'Investment buyer, focuses on appreciating gems');

-- Insert sample invoices data
INSERT INTO public.invoices (invoice_number, customer_id, subtotal, tax_rate, tax_amount, total, status, date_created, date_due, notes) VALUES
('INV-2024-001', (SELECT id FROM public.customers WHERE customer_id = 'CUST001'), 31000.00, 8.50, 2635.00, 33635.00, 'paid', '2024-06-15', '2024-07-15', 'Payment received via wire transfer'),
('INV-2024-002', (SELECT id FROM public.customers WHERE customer_id = 'CUST002'), 18750.00, 8.50, 1593.75, 20343.75, 'paid', '2024-06-18', '2024-07-18', 'Large diamond purchase'),
('INV-2024-003', (SELECT id FROM public.customers WHERE customer_id = 'CUST003'), 16800.00, 8.50, 1428.00, 18228.00, 'sent', '2024-06-17', '2024-07-17', 'Ruby purchase, payment pending'),
('INV-2024-004', (SELECT id FROM public.customers WHERE customer_id = 'CUST004'), 9500.00, 8.50, 807.50, 10307.50, 'paid', '2024-06-10', '2024-07-10', 'Sapphire sale to Johnson Jewelry'),
('INV-2024-005', (SELECT id FROM public.customers WHERE customer_id = 'CUST005'), 4500.00, 8.50, 382.50, 4882.50, 'paid', '2024-06-11', '2024-07-11', 'Aquamarine purchase'),
('INV-2024-006', (SELECT id FROM public.customers WHERE customer_id = 'CUST006'), 12300.00, 8.50, 1045.50, 13345.50, 'draft', '2024-06-12', '2024-07-12', 'Ruby purchase draft'),
('INV-2024-007', (SELECT id FROM public.customers WHERE customer_id = 'CUST007'), 15600.00, 8.50, 1326.00, 16926.00, 'paid', '2024-06-15', '2024-07-15', 'Emerald purchase');

-- Insert sample invoice items data
INSERT INTO public.invoice_items (invoice_id, gem_id, quantity, unit_price, total_price) VALUES
-- Invoice 1 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-001'), (SELECT id FROM public.gems WHERE stock_id = 'DM0001'), 1, 12500.00, 12500.00),
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-001'), (SELECT id FROM public.gems WHERE stock_id = 'EM0001'), 1, 18500.00, 18500.00),
-- Invoice 2 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-002'), (SELECT id FROM public.gems WHERE stock_id = 'DM0002'), 1, 18750.00, 18750.00),
-- Invoice 3 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-003'), (SELECT id FROM public.gems WHERE stock_id = 'RB0003'), 1, 16800.00, 16800.00),
-- Invoice 4 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-004'), (SELECT id FROM public.gems WHERE stock_id = 'SP0001'), 1, 9500.00, 9500.00),
-- Invoice 5 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-005'), (SELECT id FROM public.gems WHERE stock_id = 'AQ0002'), 1, 4500.00, 4500.00),
-- Invoice 6 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-006'), (SELECT id FROM public.gems WHERE stock_id = 'RB0002'), 1, 12300.00, 12300.00),
-- Invoice 7 items
((SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-007'), (SELECT id FROM public.gems WHERE stock_id = 'EM0003'), 1, 15600.00, 15600.00);

-- Insert sample consignments data
INSERT INTO public.consignments (consignment_number, customer_id, status, date_created, return_date, notes) VALUES
('CON-2024-001', (SELECT id FROM public.customers WHERE customer_id = 'CUST001'), 'pending', '2024-06-25', '2024-07-25', 'High-value gems on consignment'),
('CON-2024-002', (SELECT id FROM public.customers WHERE customer_id = 'CUST002'), 'returned', '2024-06-20', '2024-07-20', 'Returned after evaluation'),
('CON-2024-003', (SELECT id FROM public.customers WHERE customer_id = 'CUST004'), 'purchased', '2024-06-18', '2024-07-18', 'Customer decided to purchase');

-- Insert sample consignment items data
INSERT INTO public.consignment_items (consignment_id, gem_id, quantity, unit_price, total_price) VALUES
-- Consignment 1 items
((SELECT id FROM public.consignments WHERE consignment_number = 'CON-2024-001'), (SELECT id FROM public.gems WHERE stock_id = 'SP0002'), 1, 14200.00, 14200.00),
((SELECT id FROM public.consignments WHERE consignment_number = 'CON-2024-001'), (SELECT id FROM public.gems WHERE stock_id = 'TR0001'), 1, 1650.00, 1650.00),
-- Consignment 2 items
((SELECT id FROM public.consignments WHERE consignment_number = 'CON-2024-002'), (SELECT id FROM public.gems WHERE stock_id = 'TP0001'), 1, 2800.00, 2800.00),
-- Consignment 3 items
((SELECT id FROM public.consignments WHERE consignment_number = 'CON-2024-003'), (SELECT id FROM public.gems WHERE stock_id = 'SP0003'), 1, 11800.00, 11800.00);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignment_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since this is an inventory management system)
-- Note: In production, you would want to add proper authentication-based policies
CREATE POLICY "Allow all operations on gems" ON public.gems FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoice_items" ON public.invoice_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on consignments" ON public.consignments FOR ALL USING (true);
CREATE POLICY "Allow all operations on consignment_items" ON public.consignment_items FOR ALL USING (true);
