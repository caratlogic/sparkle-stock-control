-- Create table to permanently store QR code settings per user
CREATE TABLE IF NOT EXISTS public.qr_code_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  field_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email)
);

-- Enable RLS
ALTER TABLE public.qr_code_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for QR code settings
CREATE POLICY "Users can manage their own QR code settings"
ON public.qr_code_settings
FOR ALL
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_qr_code_settings_updated_at
  BEFORE UPDATE ON public.qr_code_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();