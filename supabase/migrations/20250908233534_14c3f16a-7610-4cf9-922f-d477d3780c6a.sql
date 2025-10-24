-- Create a temporary policy to allow anonymous access for development
-- This allows the aging_wip data to be visible without authentication
-- NOTE: This should be removed in production with proper authentication

CREATE POLICY "Allow anonymous access for development" 
ON public.aging_wip 
FOR SELECT 
TO anon
USING (true);