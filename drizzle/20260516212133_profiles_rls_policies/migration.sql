CREATE POLICY "profiles_select_own"
ON "profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = "user_id");
--> statement-breakpoint
CREATE POLICY "profiles_update_own"
ON "profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = "user_id")
WITH CHECK (auth.uid() = "user_id");
