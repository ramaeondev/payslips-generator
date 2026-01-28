-- Allow users who are members of an organization to upload/update files in per-org buckets
-- and make objects in org-* buckets publicly readable (for logos).

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow org members to INSERT into objects for buckets named 'org-<uuid>'
CREATE POLICY "Org members can insert into their org buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id LIKE 'org-%' AND
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()::uuid
        AND uo.organization_id = replace(bucket_id, 'org-', '')::uuid
    )
  );

-- Allow org members to UPDATE objects in their org buckets
CREATE POLICY "Org members can update objects in their org buckets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id LIKE 'org-%' AND
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()::uuid
        AND uo.organization_id = replace(bucket_id, 'org-', '')::uuid
    )
  );

-- Allow public SELECT for objects in org buckets (logos should be publicly accessible)
CREATE POLICY "Org bucket objects are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id LIKE 'org-%');

-- Note: If you want to restrict SELECT access to org members only, replace the last policy with
-- a policy that checks the user is a member, similar to the INSERT/UPDATE policies above.
