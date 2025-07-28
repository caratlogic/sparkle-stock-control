-- Clean database by removing most data while keeping minimal samples for functionality

-- Delete most gems but keep a few samples
DELETE FROM gems WHERE id NOT IN (
  SELECT id FROM gems ORDER BY created_at DESC LIMIT 5
);

-- Delete most customers but keep a few samples
DELETE FROM customers WHERE id NOT IN (
  SELECT id FROM customers ORDER BY created_at DESC LIMIT 3
);

-- Delete most invoices but keep a few samples
DELETE FROM invoices WHERE id NOT IN (
  SELECT id FROM invoices ORDER BY created_at DESC LIMIT 3
);

-- Delete most consignments but keep a few samples
DELETE FROM consignments WHERE id NOT IN (
  SELECT id FROM consignments ORDER BY created_at DESC LIMIT 2
);

-- Delete most quotations but keep a few samples
DELETE FROM quotations WHERE id NOT IN (
  SELECT id FROM quotations ORDER BY created_at DESC LIMIT 2
);

-- Clean up orphaned records
DELETE FROM invoice_items WHERE invoice_id NOT IN (SELECT id FROM invoices);
DELETE FROM consignment_items WHERE consignment_id NOT IN (SELECT id FROM consignments);
DELETE FROM quotation_items WHERE quotation_id NOT IN (SELECT id FROM quotations);
DELETE FROM gem_certificates WHERE gem_id NOT IN (SELECT id FROM gems);

-- Delete most transaction history to save space
DELETE FROM partner_transactions WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM associated_entity_transactions WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM merge_split_history WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete old communications and reminders
DELETE FROM customer_communications WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM customer_reminders WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete most invoice payments but keep recent ones
DELETE FROM invoice_payments WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete most credit notes but keep a few samples
DELETE FROM credit_notes WHERE id NOT IN (
  SELECT id FROM credit_notes ORDER BY created_at DESC LIMIT 2
);

-- Keep only active partners and associated entities
DELETE FROM partners WHERE status != 'active';
DELETE FROM associated_entities WHERE status != 'active';

-- Clean up old column customizations
DELETE FROM column_customizations WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up old QR code settings
DELETE FROM qr_code_settings WHERE created_at < NOW() - INTERVAL '90 days';

-- Update gems to have minimal data
UPDATE gems SET 
  description = NULL,
  notes = NULL,
  measurements = NULL,
  stone_description = NULL,
  shape_detail = NULL,
  color_comment = 'none',
  image_url = NULL
WHERE description IS NOT NULL OR notes IS NOT NULL;