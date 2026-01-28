-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create a function to handle organization creation with user linkage
-- This function runs with elevated privileges (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION create_organization_with_user(
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
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Insert the organization
  INSERT INTO organizations (name, slug)
  VALUES (p_org_name, p_org_slug)
  RETURNING organizations.id INTO v_org_id;
  
  -- Link user to organization
  INSERT INTO user_organizations (user_id, organization_id, role)
  VALUES (p_user_id, v_org_id, 'admin');
  
  -- Return the created organization
  RETURN QUERY
  SELECT o.id, o.name, o.slug, o.created_at
  FROM organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_user(UUID, TEXT, TEXT) TO authenticated;

-- Grant execute permission to anon users (for signup flow)
GRANT EXECUTE ON FUNCTION create_organization_with_user(UUID, TEXT, TEXT) TO anon;
