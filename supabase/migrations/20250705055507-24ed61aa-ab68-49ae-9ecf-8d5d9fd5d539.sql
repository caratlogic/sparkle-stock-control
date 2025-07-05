-- Function to calculate and update customer total purchases
CREATE OR REPLACE FUNCTION public.update_customer_total_purchases()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the customer's total purchases based on all their paid invoices
  UPDATE public.customers 
  SET 
    total_purchases = (
      SELECT COALESCE(SUM(i.total), 0)
      FROM public.invoices i
      WHERE i.customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
      AND i.status IN ('paid', 'sent', 'overdue')
    ),
    last_purchase_date = (
      SELECT MAX(i.date_created)
      FROM public.invoices i
      WHERE i.customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
      AND i.status IN ('paid', 'sent', 'overdue')
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update customer totals when invoices change
DROP TRIGGER IF EXISTS trigger_update_customer_totals ON public.invoices;
CREATE TRIGGER trigger_update_customer_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_total_purchases();

-- Function to recalculate all customer totals (useful for initial setup)
CREATE OR REPLACE FUNCTION public.recalculate_all_customer_totals()
RETURNS void AS $$
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
    WHERE i.status IN ('paid', 'sent', 'overdue')
    GROUP BY i.customer_id
  ) as invoice_totals
  WHERE customers.id = invoice_totals.customer_id;
  
  -- Set zero totals for customers with no invoices
  UPDATE public.customers 
  SET 
    total_purchases = 0,
    last_purchase_date = NULL,
    updated_at = NOW()
  WHERE id NOT IN (
    SELECT DISTINCT customer_id 
    FROM public.invoices 
    WHERE status IN ('paid', 'sent', 'overdue')
  );
END;
$$ LANGUAGE plpgsql;

-- Run the recalculation function to update existing data
SELECT public.recalculate_all_customer_totals();