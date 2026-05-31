-- Campaign members: view-only SELECT for campaigns where the user has a character enrolled
CREATE POLICY "campaigns_select_member"
ON "campaigns"
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT c.campaign_id
    FROM public.characters c
    JOIN public.profiles p ON c.profile_id = p.id
    WHERE p.user_id = auth.uid()
      AND c.campaign_id IS NOT NULL
  )
);
--> statement-breakpoint

-- Resolve a campaign by its active invite id (minimal public surface for invitees)
CREATE OR REPLACE FUNCTION public.get_campaign_by_invite(p_invite_id uuid)
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT c.id, c.name
  FROM public.campaigns c
  WHERE c.invite_id = p_invite_id;
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.get_campaign_by_invite(uuid) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_campaign_by_invite(uuid) TO authenticated;
--> statement-breakpoint

-- Join the caller's unassigned character to the campaign behind a valid invite
CREATE OR REPLACE FUNCTION public.join_campaign_via_invite(
  p_invite_id uuid,
  p_character_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_campaign_id uuid;
  v_profile_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT c.id INTO v_campaign_id
  FROM public.campaigns c
  WHERE c.invite_id = p_invite_id;

  IF v_campaign_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  SELECT p.id INTO v_profile_id
  FROM public.profiles p
  WHERE p.user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.characters ch
    WHERE ch.id = p_character_id
      AND ch.profile_id = v_profile_id
      AND ch.campaign_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Character not found or already in a campaign';
  END IF;

  UPDATE public.characters
  SET campaign_id = v_campaign_id
  WHERE id = p_character_id;

  RETURN v_campaign_id;
END;
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.join_campaign_via_invite(uuid, uuid) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.join_campaign_via_invite(uuid, uuid) TO authenticated;
