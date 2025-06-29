
-- Create invoice_payments table
CREATE TABLE public.invoice_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'check', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_invoice_payments_invoice_id ON public.invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_payment_date ON public.invoice_payments(payment_date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (assuming no authentication for now, but can be modified later)
CREATE POLICY "Enable read access for all users" ON public.invoice_payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.invoice_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.invoice_payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.invoice_payments FOR DELETE USING (true);
