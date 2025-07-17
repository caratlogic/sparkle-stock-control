-- Update the recalculate_all_customer_totals function to match frontend logic
CREATE OR REPLACE FUNCTION public.recalculate_all_customer_totals()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.customers 
  SET 
    total_purchases = COALESCE(invoice_totals.total, 0),
    last_purchase_date = invoice_totals.last_date,
    updated_at = NOW()
  FROM (
    SELECT 
      i.customer_id,
      SUM(i.total) as total,
      MAX(i.date_created) as last_date
    FROM public.invoices i
    WHERE i.status IN ('sent', 'overdue', 'paid', 'partial')
    GROUP BY i.customer_id
  ) as invoice_totals
  WHERE customers.id = invoice_totals.customer_id;
  
  -- Set zero totals for customers with no revenue-generating invoices
  UPDATE public.customers 
  SET 
    total_purchases = 0,
    last_purchase_date = NULL,
    updated_at = NOW()
  WHERE id NOT IN (
    SELECT DISTINCT customer_id 
    FROM public.invoices 
    WHERE status IN ('sent', 'overdue', 'paid', 'partial')
  );
END;
$function$;

-- Update the trigger function to match frontend logic
CREATE OR REPLACE FUNCTION public.update_customer_total_purchases()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update the customer's total purchases based on all their revenue-generating invoices
  UPDATE public.customers 
  SET 
    total_purchases = (
      SELECT COALESCE(SUM(i.total), 0)
      FROM public.invoices i
      WHERE i.customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
      AND i.status IN ('sent', 'overdue', 'paid', 'partial')
    ),
    last_purchase_date = (
      SELECT MAX(i.date_created)
      FROM public.invoices i
      WHERE i.customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
      AND i.status IN ('sent', 'overdue', 'paid', 'partial')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Run the recalculation to fix existing data
SELECT recalculate_all_customer_totals();