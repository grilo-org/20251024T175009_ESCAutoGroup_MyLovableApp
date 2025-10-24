-- Create user profiles and shop access system to fix the security vulnerability
-- This ensures users can only access customer data for shops they're authorized to view

-- Create profiles table to store user information
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email text,
    full_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user_shop_access table to define which shops a user can access
CREATE TABLE IF NOT EXISTS public.user_shop_access (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shop_id text NOT NULL,
    shop_name text NOT NULL,
    role text DEFAULT 'viewer',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, shop_id)
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shop_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_shop_access table
CREATE POLICY "Users can view their own shop access" 
ON public.user_shop_access 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Service role can manage shop access assignments
CREATE POLICY "Service role can manage shop access" 
ON public.user_shop_access 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create security definer function to check shop access
CREATE OR REPLACE FUNCTION public.user_has_shop_access(user_id uuid, target_shop_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_shop_access
    WHERE user_shop_access.user_id = $1
      AND user_shop_access.shop_id = $2
  )
$$;

-- Update aging_wip RLS policy to use shop-specific access
DROP POLICY IF EXISTS "Authenticated users can view aging WIP data" ON public.aging_wip;

CREATE POLICY "Users can view aging WIP data for authorized shops" 
ON public.aging_wip 
FOR SELECT 
TO authenticated
USING (public.user_has_shop_access(auth.uid(), shop_id));

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Service role maintains full access for sync operations (keep existing policy)
-- CREATE POLICY "Service role can manage aging WIP data" already exists