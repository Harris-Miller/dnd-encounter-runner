-- Campaigns: full CRUD scoped to the owning profile
CREATE POLICY "campaigns_select_own"
ON "campaigns"
FOR SELECT
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "campaigns_insert_own"
ON "campaigns"
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "campaigns_update_own"
ON "campaigns"
FOR UPDATE
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
--> statement-breakpoint
CREATE POLICY "campaigns_delete_own"
ON "campaigns"
FOR DELETE
TO authenticated
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);
