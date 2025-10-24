-- Add anonymous access policy for historical_performance table (development only)
-- This matches the fix applied to aging_wip table

CREATE POLICY "Allow anonymous access for development" 
ON public.historical_performance 
FOR SELECT 
TO anon
USING (true);