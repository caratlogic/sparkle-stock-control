-- Fix the QR code settings policy to restrict access to user's own settings
DROP POLICY IF EXISTS "Users can manage their own QR code settings" ON public.qr_code_settings;

CREATE POLICY "Users can manage their own QR code settings"
ON public.qr_code_settings
FOR ALL
USING (auth.uid()::text = user_email OR user_email = current_setting('request.jwt.claims')::json->>'email')
WITH CHECK (auth.uid()::text = user_email OR user_email = current_setting('request.jwt.claims')::json->>'email');