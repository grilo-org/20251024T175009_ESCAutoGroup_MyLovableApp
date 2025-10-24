-- Update RLS policies for aging_wip table to require authentication
-- This fixes the security vulnerability where customer names and vehicle info were publicly accessible

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view aging WIP data" ON public.aging_wip;
DROP POLICY IF EXISTS "Service role can manage aging WIP data" ON public.aging_wip;

-- Create new restrictive policies that require authentication
-- Only authenticated users can view aging WIP data
CREATE POLICY "Authenticated users can view aging WIP data" 
ON public.aging_wip 
FOR SELECT 
TO authenticated
USING (true);

-- Service role maintains full access for sync operations
CREATE POLICY "Service role can manage aging WIP data" 
ON public.aging_wip 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.aging_wip ENABLE ROW LEVEL SECURITY;