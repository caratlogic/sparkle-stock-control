-- Clean database by removing ALL child records first, then parent records

-- Delete ALL child records to avoid foreign key constraints
DELETE FROM invoice_items;
DELETE FROM consignment_items;
DELETE FROM quotation_items;
DELETE FROM gem_certificates;
DELETE FROM partner_transactions;
DELETE FROM associated_entity_transactions;
DELETE FROM merge_split_history;
DELETE FROM customer_communications;
DELETE FROM customer_reminders;
DELETE FROM invoice_payments;

-- Delete ALL main records
DELETE FROM gems;
DELETE FROM invoices;
DELETE FROM consignments;
DELETE FROM quotations;
DELETE FROM credit_notes;

-- Keep only first 3 customers for testing
DELETE FROM customers WHERE id NOT IN (
  SELECT id FROM customers ORDER BY created_at DESC LIMIT 3
);

-- Clean up settings
DELETE FROM column_customizations;
DELETE FROM qr_code_settings;

-- Keep only active partners and associated entities
DELETE FROM partners WHERE status != 'active';
DELETE FROM associated_entities WHERE status != 'active';