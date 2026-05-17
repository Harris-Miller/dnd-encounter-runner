CREATE TYPE "profile_avatar_source" AS ENUM('oauth', 'uploaded');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_source" "profile_avatar_source" DEFAULT 'oauth'::"profile_avatar_source" NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "uploaded_avatar_id" uuid;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "avatar_url";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "email" SET NOT NULL;