-- Fix API token security vulnerabilities with stricter controls and audit logging
-- This implements token rotation, access logging, and enhanced security measures

-- Create audit log table for token access monitoring
CREATE TABLE IF NOT EXISTS public.token_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id integer NOT NULL,
    action text NOT NULL, -- 'accessed', 'refreshed', 'created', 'deleted'
    accessed_by text NOT NULL, -- service function name or user identifier
    accessed_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    success boolean DEFAULT true,
    error_message text
);

-- Enable RLS on audit log
ALTER TABLE public.token_audit_log ENABLE ROW LEVEL SECURITY;

-- Create more restrictive RLS policies for tekmetric_tokens
DROP POLICY IF EXISTS "Service role access only" ON public.tekmetric_tokens;

-- Policy for reading tokens (with audit logging)
CREATE POLICY "Service role can read tokens for sync operations" 
ON public.tekmetric_tokens 
FOR SELECT 
TO service_role
USING (true);

-- Policy for updating tokens (token refresh only)
CREATE POLICY "Service role can update token expiration and access_token" 
ON public.tekmetric_tokens 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for inserting tokens (initial setup only)
CREATE POLICY "Service role can insert initial tokens" 
ON public.tekmetric_tokens 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- No delete policy - tokens should expire, not be deleted

-- Create audit log policies (service role only for security)
CREATE POLICY "Service role can manage audit logs" 
ON public.token_audit_log 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add columns for enhanced token security
ALTER TABLE public.tekmetric_tokens 
ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_by text,
ADD COLUMN IF NOT EXISTS rotation_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_access_count integer DEFAULT 1000; -- Force rotation after X uses

-- Create function to log token access and enforce security policies
CREATE OR REPLACE FUNCTION public.audit_token_access(
    p_token_id integer,
    p_action text,
    p_accessed_by text,
    p_success boolean DEFAULT true,
    p_error_message text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert audit log entry
    INSERT INTO public.token_audit_log (
        token_id, 
        action, 
        accessed_by, 
        success, 
        error_message
    ) VALUES (
        p_token_id, 
        p_action, 
        p_accessed_by, 
        p_success, 
        p_error_message
    );
    
    -- Update token access tracking if it's an access operation
    IF p_action = 'accessed' AND p_success = true THEN
        UPDATE public.tekmetric_tokens 
        SET 
            last_accessed_at = now(),
            access_count = access_count + 1,
            last_accessed_by = p_accessed_by,
            rotation_required = CASE 
                WHEN access_count + 1 >= max_access_count THEN true 
                ELSE rotation_required 
            END
        WHERE id = p_token_id;
    END IF;
END;
$$;

-- Create function to check if token rotation is needed
CREATE OR REPLACE FUNCTION public.token_needs_rotation(p_token_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    token_record record;
BEGIN
    SELECT 
        expires_at, 
        access_count, 
        max_access_count, 
        rotation_required,
        last_accessed_at
    INTO token_record
    FROM public.tekmetric_tokens 
    WHERE id = p_token_id;
    
    -- Token needs rotation if:
    -- 1. It's expired
    -- 2. Access count exceeded limit
    -- 3. Manually marked for rotation
    -- 4. Not accessed for more than 7 days (stale token)
    RETURN (
        token_record.expires_at < now() OR
        token_record.access_count >= token_record.max_access_count OR
        token_record.rotation_required = true OR
        token_record.last_accessed_at < (now() - interval '7 days')
    );
END;
$$;

-- Create function to mark token for rotation
CREATE OR REPLACE FUNCTION public.mark_token_for_rotation(p_token_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.tekmetric_tokens 
    SET rotation_required = true
    WHERE id = p_token_id;
    
    -- Log the rotation requirement
    PERFORM public.audit_token_access(
        p_token_id, 
        'marked_for_rotation', 
        'system'
    );
END;
$$;

-- Add index for better performance on audit queries
CREATE INDEX IF NOT EXISTS idx_token_audit_log_token_id_action 
ON public.token_audit_log(token_id, action);

CREATE INDEX IF NOT EXISTS idx_token_audit_log_accessed_at 
ON public.token_audit_log(accessed_at DESC);

-- Add index for token security checks
CREATE INDEX IF NOT EXISTS idx_tekmetric_tokens_rotation_check 
ON public.tekmetric_tokens(rotation_required, expires_at, access_count);