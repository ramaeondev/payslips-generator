-- Add INSERT policy for organizations table
-- Allows authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add INSERT policy for user_organizations
-- Allows authenticated users to link themselves to organizations
CREATE POLICY "Users can link themselves to organizations"
  ON user_organizations FOR INSERT
  WITH CHECK (user_id = auth.uid());
