-- Clean database by removing data in correct order to avoid foreign key conflicts

-- First, delete related records before deleting main records

-- Delete old transaction history to save space
DELETE FROM partner_transactions WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM associated_entity_transactions WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM merge_split_history WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete old communications and reminders
DELETE FROM customer_communications WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM customer_reminders WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete most invoice payments but keep recent ones
DELETE FROM invoice_payments WHERE created_at < NOW() - INTERVAL '30 days';

-- Delete gem certificates for gems we'll be removing
DELETE FROM gem_certificates WHERE gem_id NOT IN (
  SELECT id FROM gems ORDER BY created_at DESC LIMIT 5
);

-- Delete invoice items for invoices we'll be removing
DELETE FROM invoice_items WHERE invoice_id NOT IN (
  SELECT id FROM invoices ORDER BY created_at DESC LIMIT 3
);

-- Delete consignment items for consignments we'll be removing
DELETE FROM consignment_items WHERE consignment_id NOT IN (
  SELECT id FROM consignments ORDER BY created_at DESC LIMIT 2
);

-- Delete quotation items for quotations we'll be removing
DELETE FROM quotation_items WHERE quotation_id NOT IN (
  SELECT id FROM quotations ORDER BY created_at DESC LIMIT 2
);

-- Now delete most main records but keep samples
DELETE FROM gems WHERE id NOT IN (
  SELECT id FROM gems ORDER BY created_at DESC LIMIT 5
);

DELETE FROM invoices WHERE id NOT IN (
  SELECT id FROM invoices ORDER BY created_at DESC LIMIT 3
);

DELETE FROM consignments WHERE id NOT IN (
  SELECT id FROM consignments ORDER BY created_at DESC LIMIT 2
);

DELETE FROM quotations WHERE id NOT IN (
  SELECT id FROM quotations ORDER BY created_at DESC LIMIT 2
);

DELETE FROM customers WHERE id NOT IN (
  SELECT id FROM customers ORDER BY created_at DESC LIMIT 3
);

-- Delete most credit notes but keep a few samples
DELETE FROM credit_notes WHERE id NOT IN (
  SELECT id FROM credit_notes ORDER BY created_at DESC LIMIT 2
);

-- Keep only active partners and associated entities
DELETE FROM partners WHERE status != 'active';
DELETE FROM associated_entities WHERE status != 'active';

-- Clean up old settings
DELETE FROM column_customizations WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM qr_code_settings WHERE created_at < NOW() - INTERVAL '90 days';

-- Update gems to have minimal data to save space
UPDATE gems SET 
  description = CASE WHEN LENGTH(description) > 100 THEN SUBSTRING(description, 1, 100) ELSE description END,
  notes = NULL,
  measurements = NULL,
  stone_description = NULL,
  shape_detail = NULL,
  color_comment = 'none',
  image_url = NULL;