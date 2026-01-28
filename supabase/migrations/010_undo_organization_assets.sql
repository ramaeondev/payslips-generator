-- Undo migration for organization_assets
-- 1) Drop RLS policies
DROP POLICY IF EXISTS "Org members can view assets" ON public.organization_assets;
DROP POLICY IF EXISTS "Org members can insert assets" ON public.organization_assets;
DROP POLICY IF EXISTS "Org members can update assets" ON public.organization_assets;
DROP POLICY IF EXISTS "Org members can delete assets" ON public.organization_assets;

-- 2) Drop trigger and function if exist
DROP TRIGGER IF EXISTS update_organization_assets_updated_at ON public.organization_assets;
DROP FUNCTION IF EXISTS public.update_organization_assets_updated_at();

-- 3) Drop unique index
DROP INDEX IF EXISTS ux_organization_asset_default_per_type;

-- 4) Drop table
DROP TABLE IF EXISTS public.organization_assets;
