-- profile_id must never change via UPDATE; RLS WITH CHECK cannot compare OLD vs NEW.

CREATE OR REPLACE FUNCTION public.prevent_character_profile_id_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    RAISE EXCEPTION 'Cannot reassign character ownership';
  END IF;

  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS characters_profile_id_immutable ON public.characters;
--> statement-breakpoint
CREATE TRIGGER characters_profile_id_immutable
BEFORE UPDATE ON public.characters
FOR EACH ROW
EXECUTE FUNCTION public.prevent_character_profile_id_change();
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

DROP FUNCTION IF EXISTS public.character_profile_id(uuid);
