-- Ensure owner update policy exists (idempotent recreate).
DROP POLICY IF EXISTS "characters_update_own" ON "characters";
--> statement-breakpoint
CREATE POLICY "characters_update_own"
ON "characters"
FOR UPDATE
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint

DROP POLICY IF EXISTS "characters_update_campaign_owner" ON "characters";
--> statement-breakpoint
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
--> statement-breakpoint

-- Campaign owners remove enrolled characters without tripping post-update SELECT RLS.
CREATE OR REPLACE FUNCTION public.remove_character_from_campaign(
  p_campaign_id uuid,
  p_character_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.user_owns_campaign(p_campaign_id) THEN
    RAISE EXCEPTION 'Campaign not found or not owned by caller';
  END IF;

  UPDATE public.characters
  SET campaign_id = NULL
  WHERE id = p_character_id
    AND campaign_id = p_campaign_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found in campaign';
  END IF;

  RETURN p_character_id;
END;
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.remove_character_from_campaign(uuid, uuid) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.remove_character_from_campaign(uuid, uuid) TO authenticated;
