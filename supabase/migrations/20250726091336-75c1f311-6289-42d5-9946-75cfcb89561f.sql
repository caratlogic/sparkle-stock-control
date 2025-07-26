-- Create merge_split_history table for tracking gem merge and split operations
CREATE TABLE public.merge_split_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('Merge', 'Split')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  original_stock_numbers TEXT[] NOT NULL,
  new_stock_numbers TEXT[] NOT NULL,
  original_carat NUMERIC(12,2) NOT NULL,
  new_carat NUMERIC(12,2) NOT NULL,
  original_total_cost NUMERIC(12,2),
  new_total_cost NUMERIC(12,2),
  original_total_selling NUMERIC(12,2),
  new_total_selling NUMERIC(12,2),
  notes TEXT CHECK (length(notes) <= 500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.merge_split_history ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on merge_split_history" 
ON public.merge_split_history 
FOR ALL 
USING (true);

-- Create index for better performance
CREATE INDEX idx_merge_split_history_operation_type ON public.merge_split_history(operation_type);
CREATE INDEX idx_merge_split_history_created_at ON public.merge_split_history(created_at DESC);
CREATE INDEX idx_merge_split_history_user_email ON public.merge_split_history(user_email);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_merge_split_history_updated_at
BEFORE UPDATE ON public.merge_split_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();