
-- First, let's ensure the customer_communications table exists and add additional fields for activity log
CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('note', 'email', 'follow_up', 'reply', 'call', 'document', 'invoice', 'consignment', 'payment', 'kyc')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('owner', 'customer')),
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  response_status VARCHAR(20) DEFAULT 'pending' CHECK (response_status IN ('pending', 'responded', 'no_response', 'completed')),
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  related_consignment_id UUID REFERENCES consignments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table for auto-reminders
CREATE TABLE IF NOT EXISTS customer_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  communication_id UUID REFERENCES customer_communications(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  staff_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON customer_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON customer_communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_customer_communications_response_status ON customer_communications(response_status);
CREATE INDEX IF NOT EXISTS idx_customer_reminders_date ON customer_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_customer_reminders_customer_id ON customer_reminders(customer_id);

-- Add RLS policies
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reminders ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this based on your auth needs)
CREATE POLICY "Allow all operations on customer_communications" ON customer_communications
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on customer_reminders" ON customer_reminders
  FOR ALL USING (true);

-- Create function to update updated_at timestamp for reminders
CREATE OR REPLACE FUNCTION update_customer_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on reminders
CREATE TRIGGER customer_reminders_updated_at
  BEFORE UPDATE ON customer_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_reminders_updated_at();
