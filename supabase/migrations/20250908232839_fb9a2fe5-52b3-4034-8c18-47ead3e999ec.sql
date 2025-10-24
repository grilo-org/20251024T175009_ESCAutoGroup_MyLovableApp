-- Update RLS policies for historical_performance table to protect sensitive financial data
-- This ensures users can only access business performance data for shops they're authorized to view

-- Drop the existing overly permissive policy that exposes financial data publicly
DROP POLICY IF EXISTS "Anyone can view historical performance data" ON public.historical_performance;

-- Create shop-specific access policy using the existing user_has_shop_access function
CREATE POLICY "Users can view historical performance for authorized shops" 
ON public.historical_performance 
FOR SELECT 
TO authenticated
USING (public.user_has_shop_access(auth.uid(), shop_id));

-- Service role maintains full access for sync operations (keep existing policy)
-- "Service role can manage historical performance data" policy already exists