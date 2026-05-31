-- Campaign owners: UPDATE on characters enrolled in their campaigns.

CREATE POLICY "characters_update_campaign_owner"
ON "characters"
FOR UPDATE
TO authenticated
USING (
  campaign_id IS NOT NULL
  AND public.user_owns_campaign(campaign_id)
)
WITH CHECK (
  campaign_id IS NOT NULL
  AND public.user_owns_campaign(campaign_id)
);
