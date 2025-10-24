-- Add missing deposit_amount column to aging_wip table
ALTER TABLE public.aging_wip 
ADD COLUMN IF NOT EXISTS deposit_amount integer DEFAULT 0;

-- Add index for better performance on deposits queries
CREATE INDEX IF NOT EXISTS idx_aging_wip_deposit_amount 
ON public.aging_wip(deposit_amount);

-- Update the comment to include deposit information
COMMENT ON COLUMN public.aging_wip.deposit_amount IS 'Amount of deposits received for this work order in dollars';