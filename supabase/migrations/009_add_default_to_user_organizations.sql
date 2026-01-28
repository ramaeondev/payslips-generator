-- Add is_default column to user_organizations to mark a user's default organization
ALTER TABLE public.user_organizations ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure each user can have at most one default organization
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_default_organization ON public.user_organizations (user_id) WHERE is_default = true;

-- Backfill: if a user has only one org, mark it as default
WITH single_orgs AS (
  SELECT user_id, array_agg(organization_id) AS orgs, count(*) AS cnt
  FROM public.user_organizations
  GROUP BY user_id
  HAVING count(*) = 1
)
UPDATE public.user_organizations uo
SET is_default = true
FROM single_orgs s
WHERE uo.user_id = s.user_id;
