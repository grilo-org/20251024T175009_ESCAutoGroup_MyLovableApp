-- Add test user shop access for development
-- This allows the aging_wip data to be visible during development

-- Insert test user shop access for all existing shops
-- Note: In production, this should be replaced with proper user management
INSERT INTO public.user_shop_access (user_id, shop_id, shop_name, role)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid as user_id, -- Anonymous user for testing
    '2536' as shop_id,
    'European Service Center Preston' as shop_name,
    'viewer' as role
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_shop_access 
    WHERE shop_id = '2536' AND user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Add other shop IDs that might exist based on the data
INSERT INTO public.user_shop_access (user_id, shop_id, shop_name, role)
VALUES 
('00000000-0000-0000-0000-000000000000'::uuid, '2537', 'Test Shop 1', 'viewer'),
('00000000-0000-0000-0000-000000000000'::uuid, '2538', 'Test Shop 2', 'viewer'),
('00000000-0000-0000-0000-000000000000'::uuid, '2539', 'Test Shop 3', 'viewer'),
('00000000-0000-0000-0000-000000000000'::uuid, '2540', 'Test Shop 4', 'viewer')
ON CONFLICT (user_id, shop_id) DO NOTHING;

-- Create a temporary policy to allow anonymous access for development
-- This should be removed in production with proper authentication
CREATE POLICY "Allow anonymous access for development" 
ON public.aging_wip 
FOR SELECT 
TO anon
USING (true);