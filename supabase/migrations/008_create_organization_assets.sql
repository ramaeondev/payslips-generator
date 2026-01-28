-- Create organization_assets table to support multiple assets per org (logo, header, footer, signature)

CREATE TABLE IF NOT EXISTS public.organization_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('logo','header','footer','signature')),
  name TEXT NOT NULL,
  url TEXT, -- For uploaded assets (images, PDFs, etc.)
  content TEXT, -- For HTML/text content (e.g., footer HTML, signature HTML)
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default asset per org per type
CREATE UNIQUE INDEX IF NOT EXISTS ux_organization_asset_default_per_type ON public.organization_assets (organization_id, type) WHERE is_default = true;

-- Enable RLS
ALTER TABLE public.organization_assets ENABLE ROW LEVEL SECURITY;

-- Allow org members to SELECT assets
CREATE POLICY "Org members can view assets"
  ON public.organization_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = organization_assets.organization_id
        AND uo.user_id = auth.uid()::uuid
    )
  );

-- Allow org members to INSERT assets
CREATE POLICY "Org members can insert assets"
  ON public.organization_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = organization_assets.organization_id
        AND uo.user_id = auth.uid()::uuid
    )
  );

-- Allow org members to UPDATE assets
CREATE POLICY "Org members can update assets"
  ON public.organization_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = organization_assets.organization_id
        AND uo.user_id = auth.uid()::uuid
    )
  );

-- Allow org members to DELETE assets
CREATE POLICY "Org members can delete assets"
  ON public.organization_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = organization_assets.organization_id
        AND uo.user_id = auth.uid()::uuid
    )
  );

-- Migrate existing logo_url into organization_assets (if present)
INSERT INTO public.organization_assets (organization_id, type, name, url, is_default, created_at, updated_at)
SELECT id, 'logo', 'default-logo', logo_url, true, now(), now()
FROM public.organizations
WHERE logo_url IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_organization_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_assets_updated_at
  BEFORE UPDATE ON public.organization_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_organization_assets_updated_at();
