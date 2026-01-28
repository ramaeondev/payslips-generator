-- Undo migration for user_organizations.is_default
-- 1) Drop unique index protecting single default per user
DROP INDEX IF EXISTS ux_user_default_organization;

-- 2) Remove column if exists
ALTER TABLE public.user_organizations DROP COLUMN IF EXISTS is_default;
