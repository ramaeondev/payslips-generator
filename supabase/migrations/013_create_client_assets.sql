-- Create client_assets table for client-level logo/header/footer/signature

CREATE TABLE IF NOT EXISTS public.client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('logo','header','footer','signature')),
  name TEXT NOT NULL,
  url TEXT,
  content TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_assets_client_id ON public.client_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assets_type ON public.client_assets(type);

-- Enable RLS
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;

-- RLS policies referencing clients -> organization
CREATE POLICY "Org members can select client assets"
  ON public.client_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c JOIN public.user_organizations uo ON uo.organization_id = c.organization_id
      WHERE c.id = client_assets.client_id AND uo.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Org members can insert client assets"
  ON public.client_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c JOIN public.user_organizations uo ON uo.organization_id = c.organization_id
      WHERE c.id = client_assets.client_id AND uo.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Org members can update client assets"
  ON public.client_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c JOIN public.user_organizations uo ON uo.organization_id = c.organization_id
      WHERE c.id = client_assets.client_id AND uo.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Org members can delete client assets"
  ON public.client_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c JOIN public.user_organizations uo ON uo.organization_id = c.organization_id
      WHERE c.id = client_assets.client_id AND uo.user_id = auth.uid()::uuid
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_client_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_assets_updated_at
  BEFORE UPDATE ON public.client_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_client_assets_updated_at();
