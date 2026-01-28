-- Add asset URL columns and metadata JSONB to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS logo TEXT,
  ADD COLUMN IF NOT EXISTS header TEXT,
  ADD COLUMN IF NOT EXISTS footer TEXT,
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Ensure updated_at trigger exists (clients migration created it already)