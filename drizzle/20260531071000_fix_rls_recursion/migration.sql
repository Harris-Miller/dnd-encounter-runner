-- Helper functions bypass RLS to break campaigns <-> characters policy recursion.

CREATE OR REPLACE FUNCTION public.user_owns_campaign(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaigns c
    JOIN public.profiles p ON c.profile_id = p.id
    WHERE c.id = p_campaign_id
      AND p.user_id = auth.uid()
  );
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.user_is_campaign_member(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.characters ch
    JOIN public.profiles p ON ch.profile_id = p.id
    WHERE ch.campaign_id = p_campaign_id
      AND p.user_id = auth.uid()
  );
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.user_owns_campaign(uuid) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.user_is_campaign_member(uuid) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.user_owns_campaign(uuid) TO authenticated;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.user_is_campaign_member(uuid) TO authenticated;
--> statement-breakpoint

DROP POLICY IF EXISTS "campaigns_select_member" ON "campaigns";
--> statement-breakpoint
CREATE POLICY "campaigns_select_member"
ON "campaigns"
FOR SELECT
TO authenticated
USING (public.user_is_campaign_member(id));
--> statement-breakpoint

DROP POLICY IF EXISTS "characters_select_campaign_owner" ON "characters";
--> statement-breakpoint
CREATE POLICY "characters_select_campaign_owner"
ON "characters"
FOR SELECT
TO authenticated
USING (
  campaign_id IS NOT NULL
  AND public.user_owns_campaign(campaign_id)
);
