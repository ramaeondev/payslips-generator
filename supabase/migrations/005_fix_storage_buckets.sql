-- Enable RLS on storage.buckets if not already enabled
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create buckets (for org creation)
CREATE POLICY "Authenticated users can create buckets"
  ON storage.buckets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view all buckets
CREATE POLICY "Users can view buckets"
  ON storage.buckets FOR SELECT
  USING (true);

-- Update the create_organization_with_user function to also create the bucket
CREATE OR REPLACE FUNCTION public.create_organization_with_user(
  p_user_id UUID,
  p_org_name TEXT,
  p_org_slug TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_org_id UUID;
  v_bucket_name TEXT;
BEGIN
  -- Insert the organization (bypasses RLS with SECURITY DEFINER)
  INSERT INTO public.organizations (name, slug)
  VALUES (p_org_name, p_org_slug)
  RETURNING organizations.id INTO v_org_id;
  
  -- Link user to organization (bypasses RLS with SECURITY DEFINER)
  INSERT INTO public.user_organizations (user_id, organization_id, role)
  VALUES (p_user_id, v_org_id, 'admin');
  
  -- Create storage bucket for the organization
  v_bucket_name := 'org-' || v_org_id::text;
  
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    v_bucket_name,
    v_bucket_name,
    true,
    5242880, -- 5MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Return the created organization
  RETURN QUERY
  SELECT o.id, o.name, o.slug, o.created_at
  FROM public.organizations o
  WHERE o.id = v_org_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating organization: %', SQLERRM;
END;
$$;

-- Ensure grants are applied
GRANT EXECUTE ON FUNCTION public.create_organization_with_user(UUID, TEXT, TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION public.create_organization_with_user(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization_with_user(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_organization_with_user(UUID, TEXT, TEXT) TO service_role;
