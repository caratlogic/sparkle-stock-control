-- Create storage buckets for gem images and certificates
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('gem-images', 'gem-images', true),
  ('gem-certificates', 'gem-certificates', true);

-- Create policies for gem images bucket
CREATE POLICY "Anyone can view gem images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gem-images');

CREATE POLICY "Anyone can upload gem images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gem-images');

CREATE POLICY "Anyone can update gem images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gem-images');

CREATE POLICY "Anyone can delete gem images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gem-images');

-- Create policies for gem certificates bucket
CREATE POLICY "Anyone can view gem certificates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gem-certificates');

CREATE POLICY "Anyone can upload gem certificates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gem-certificates');

CREATE POLICY "Anyone can update gem certificates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gem-certificates');

CREATE POLICY "Anyone can delete gem certificates" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gem-certificates');