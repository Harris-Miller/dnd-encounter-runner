-- Collapse profiles.id onto auth.users.id and simplify RLS that referenced user_id.

ALTER TABLE public.campaigns DROP CONSTRAINT campaigns_profile_id_profiles_id_fkey;
--> statement-breakpoint
ALTER TABLE public.characters DROP CONSTRAINT characters_profile_id_profiles_id_fkey;
--> statement-breakpoint
ALTER TABLE public.encounters DROP CONSTRAINT encounters_profile_id_profiles_id_fkey;
--> statement-breakpoint

UPDATE public.campaigns c
SET profile_id = p.user_id
FROM public.profiles p
WHERE p.id = c.profile_id;
--> statement-breakpoint
UPDATE public.characters c
SET profile_id = p.user_id
FROM public.profiles p
WHERE p.id = c.profile_id;
--> statement-breakpoint
UPDATE public.encounters c
SET profile_id = p.user_id
FROM public.profiles p
WHERE p.id = c.profile_id;
--> statement-breakpoint

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
--> statement-breakpoint
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
--> statement-breakpoint
DROP POLICY IF EXISTS "encounters_select_own" ON public.encounters;
--> statement-breakpoint
DROP POLICY IF EXISTS "encounters_insert_own" ON public.encounters;
--> statement-breakpoint
DROP POLICY IF EXISTS "encounters_update_own" ON public.encounters;
--> statement-breakpoint
DROP POLICY IF EXISTS "encounters_delete_own" ON public.encounters;
--> statement-breakpoint
DROP POLICY IF EXISTS "characters_select_own" ON public.characters;
--> statement-breakpoint
DROP POLICY IF EXISTS "characters_insert_own" ON public.characters;
--> statement-breakpoint
DROP POLICY IF EXISTS "characters_update_own" ON public.characters;
--> statement-breakpoint
DROP POLICY IF EXISTS "characters_delete_own" ON public.characters;
--> statement-breakpoint
DROP POLICY IF EXISTS "campaigns_select_own" ON public.campaigns;
--> statement-breakpoint
DROP POLICY IF EXISTS "campaigns_insert_own" ON public.campaigns;
--> statement-breakpoint
DROP POLICY IF EXISTS "campaigns_update_own" ON public.campaigns;
--> statement-breakpoint
DROP POLICY IF EXISTS "campaigns_delete_own" ON public.campaigns;
--> statement-breakpoint
DROP POLICY IF EXISTS "campaigns_select_member" ON public.campaigns;
--> statement-breakpoint
DROP POLICY IF EXISTS "characters_select_campaign_owner" ON public.characters;
--> statement-breakpoint
DROP POLICY IF EXISTS "characters_update_campaign_owner" ON public.characters;
--> statement-breakpoint

ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_users_id_fkey;
--> statement-breakpoint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_key;
--> statement-breakpoint
UPDATE public.profiles SET id = user_id;
--> statement-breakpoint
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE public.profiles DROP COLUMN user_id;
--> statement-breakpoint
ALTER TABLE public.profiles DROP COLUMN created_at;
--> statement-breakpoint
ALTER TABLE public.profiles DROP COLUMN updated_at;
--> statement-breakpoint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_profile_id_profiles_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE public.characters
  ADD CONSTRAINT characters_profile_id_profiles_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE public.encounters
  ADD CONSTRAINT encounters_profile_id_profiles_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.touch_user_updated_at()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users SET updated_at = now() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
--> statement-breakpoint
DROP TRIGGER IF EXISTS profiles_touch_user_updated_at ON public.profiles;
--> statement-breakpoint
CREATE TRIGGER profiles_touch_user_updated_at
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.touch_user_updated_at();
--> statement-breakpoint

CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
--> statement-breakpoint
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
--> statement-breakpoint

CREATE POLICY "encounters_select_own"
ON public.encounters
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "encounters_insert_own"
ON public.encounters
FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "encounters_update_own"
ON public.encounters
FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "encounters_delete_own"
ON public.encounters
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());
--> statement-breakpoint

CREATE POLICY "characters_select_own"
ON public.characters
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "characters_insert_own"
ON public.characters
FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "characters_update_own"
ON public.characters
FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "characters_delete_own"
ON public.characters
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());
--> statement-breakpoint

CREATE POLICY "campaigns_select_own"
ON public.campaigns
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "campaigns_insert_own"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "campaigns_update_own"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());
--> statement-breakpoint
CREATE POLICY "campaigns_delete_own"
ON public.campaigns
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());
--> statement-breakpoint

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
    WHERE c.id = p_campaign_id
      AND c.profile_id = auth.uid()
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
    WHERE ch.campaign_id = p_campaign_id
      AND ch.profile_id = auth.uid()
  );
$$;
--> statement-breakpoint

CREATE POLICY "campaigns_select_member"
ON public.campaigns
FOR SELECT
TO authenticated
USING (public.user_is_campaign_member(id));
--> statement-breakpoint
CREATE POLICY "characters_select_campaign_owner"
ON public.characters
FOR SELECT
TO authenticated
USING (
  campaign_id IS NOT NULL
  AND public.user_owns_campaign(campaign_id)
);
--> statement-breakpoint
CREATE POLICY "characters_update_campaign_owner"
ON public.characters
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

  IF NOT EXISTS (
    SELECT 1
    FROM public.characters ch
    WHERE ch.id = p_character_id
      AND ch.profile_id = auth.uid()
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
