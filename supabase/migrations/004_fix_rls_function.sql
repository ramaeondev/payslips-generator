-- Drop the restrictive INSERT policy on user_organizations
DROP POLICY IF EXISTS "Users can link themselves to organizations" ON user_organizations;

-- Verify the function has proper grants
GRANT EXECUTE ON FUNCTION create_organization_with_user(UUID, TEXT, TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION create_organization_with_user(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_organization_with_user(UUID, TEXT, TEXT) TO anon;

-- Recreate the function with explicit schema and better error handling
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
BEGIN
  -- Insert the organization (bypasses RLS with SECURITY DEFINER)
  INSERT INTO public.organizations (name, slug)
  VALUES (p_org_name, p_org_slug)
  RETURNING organizations.id INTO v_org_id;
  
  -- Link user to organization (bypasses RLS with SECURITY DEFINER)
  INSERT INTO public.user_organizations (user_id, organization_id, role)
  VALUES (p_user_id, v_org_id, 'admin');
  
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
