
-- Create customer_communications table for follow-ups and replies
CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('note', 'email', 'follow_up', 'reply')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('owner', 'customer')),
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  related_consignment_id UUID REFERENCES consignments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON customer_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON customer_communications(communication_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER customer_communications_updated_at
  BEFORE UPDATE ON customer_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_communications_updated_at();

-- Add RLS policies
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this based on your auth needs)
CREATE POLICY "Allow all operations on customer_communications" ON customer_communications
  FOR ALL USING (true);
