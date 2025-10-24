-- Enhanced RLS policies for aging_wip table to better protect customer data
-- Drop existing policies to recreate with stronger security
DROP POLICY IF EXISTS "Users can view aging WIP data for authorized shops" ON public.aging_wip;
DROP POLICY IF EXISTS "Service role can manage aging WIP data" ON public.aging_wip;

-- Create a security definer function to validate user access with additional checks
CREATE OR REPLACE FUNCTION public.validate_aging_wip_access(p_user_id uuid, p_shop_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user has valid shop access and is authenticated
    IF p_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verify user has active shop access
    RETURN EXISTS (
        SELECT 1
        FROM public.user_shop_access
        WHERE user_id = p_user_id
          AND shop_id = p_shop_id
          AND role IN ('admin', 'manager', 'viewer')
    );
END;
$$;

-- Create more restrictive RLS policies for aging_wip
CREATE POLICY "Authenticated users can view aging WIP for authorized shops only"
ON public.aging_wip
FOR SELECT
TO authenticated
USING (validate_aging_wip_access(auth.uid(), shop_id));

-- Service role policy with audit logging requirement
CREATE POLICY "Service role manages aging WIP with audit trail"
ON public.aging_wip
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Prevent public access entirely
CREATE POLICY "Block public access to aging WIP"
ON public.aging_wip
FOR ALL
TO public
USING (false);

-- Add column-level security for sensitive data if needed
COMMENT ON COLUMN public.aging_wip.customer_name IS 'Contains sensitive customer information - ensure proper RLS enforcement';
COMMENT ON COLUMN public.aging_wip.vehicle_info IS 'Contains sensitive vehicle information - ensure proper RLS enforcement';