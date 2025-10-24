-- Fix security issue: Restrict tekmetric_tokens table access to service role only
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations" ON public.tekmetric_tokens;

-- Create a new policy that only allows service role access
CREATE POLICY "Service role access only" 
ON public.tekmetric_tokens 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);