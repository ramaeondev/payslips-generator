-- Add website column to clients

ALTER TABLE IF EXISTS public.clients
ADD COLUMN IF NOT EXISTS website TEXT;

-- No further changes required; RLS policies unaffected.
