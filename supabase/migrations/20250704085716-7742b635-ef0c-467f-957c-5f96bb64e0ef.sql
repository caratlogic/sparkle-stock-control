-- Create credit_notes table
CREATE TABLE public.credit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_note_number TEXT NOT NULL,
  customer_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  date_created DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_notes
CREATE POLICY "Allow all operations on credit_notes" 
ON public.credit_notes 
FOR ALL 
USING (true);

-- Add foreign key constraint
ALTER TABLE public.credit_notes 
ADD CONSTRAINT credit_notes_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_credit_notes_updated_at
BEFORE UPDATE ON public.credit_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_reminders_updated_at();