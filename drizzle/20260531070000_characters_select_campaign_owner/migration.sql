-- Campaign owners: read-only SELECT on characters enrolled in their campaigns
CREATE POLICY "characters_select_campaign_owner"
ON "characters"
FOR SELECT
TO authenticated
USING (
  campaign_id IN (
    SELECT c.id
    FROM public.campaigns c
    JOIN public.profiles p ON c.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);
