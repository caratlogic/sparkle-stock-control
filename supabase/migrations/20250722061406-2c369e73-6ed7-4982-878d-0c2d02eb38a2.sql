-- Create table for gem certificates to support multiple certificates per gem
CREATE TABLE public.gem_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gem_id UUID NOT NULL,
  certificate_type TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_gem_certificates_gem_id FOREIGN KEY (gem_id) REFERENCES public.gems(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.gem_certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on gem_certificates" 
ON public.gem_certificates 
FOR ALL 
USING (true);

-- Create index for better performance
CREATE INDEX idx_gem_certificates_gem_id ON public.gem_certificates(gem_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gem_certificates_updated_at
BEFORE UPDATE ON public.gem_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();