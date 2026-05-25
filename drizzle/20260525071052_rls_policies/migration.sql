-- Encounters: full CRUD scoped to the owning profile
CREATE POLICY "encounters_select_own"
ON "encounters"
FOR SELECT
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "encounters_insert_own"
ON "encounters"
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "encounters_update_own"
ON "encounters"
FOR UPDATE
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "encounters_delete_own"
ON "encounters"
FOR DELETE
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint

-- Characters: DM's reusable player roster, full CRUD scoped to owning profile
CREATE POLICY "characters_select_own"
ON "characters"
FOR SELECT
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "characters_insert_own"
ON "characters"
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
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
CREATE POLICY "characters_delete_own"
ON "characters"
FOR DELETE
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint

-- Reference tables: read-only to any authenticated user
CREATE POLICY "monsters_select_authenticated"
ON "monsters"
FOR SELECT
TO authenticated
USING (true);
--> statement-breakpoint
CREATE POLICY "spells_select_authenticated"
ON "spells"
FOR SELECT
TO authenticated
USING (true);
--> statement-breakpoint
CREATE POLICY "magic_items_select_authenticated"
ON "magic_items"
FOR SELECT
TO authenticated
USING (true);
--> statement-breakpoint
CREATE POLICY "damage_types_select_authenticated"
ON "damage_types"
FOR SELECT
TO authenticated
USING (true);
--> statement-breakpoint

-- Profile creation trigger: keeps public.profiles in sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
--> statement-breakpoint
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();
