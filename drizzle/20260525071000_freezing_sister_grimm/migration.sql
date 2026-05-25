CREATE TABLE "characters" (
	"armor_class" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"level" integer DEFAULT 1 NOT NULL,
	"max_hit_points" integer NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"profile_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "characters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "encounters" ADD COLUMN "active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "encounters" ADD COLUMN "name" text DEFAULT 'Untitled Encounter' NOT NULL;--> statement-breakpoint
ALTER TABLE "encounters" ADD COLUMN "state" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;