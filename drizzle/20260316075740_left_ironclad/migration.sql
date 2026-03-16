CREATE TABLE "damage_types" (
	"created_at" timestamp with time zone DEFAULT now(),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spells" (
	"casting_time" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"description" text,
	"duration" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"is_concentration" boolean NOT NULL,
	"is_material" boolean NOT NULL,
	"is_ritual" boolean NOT NULL,
	"is_somatic" boolean NOT NULL,
	"is_verbal" boolean NOT NULL,
	"level" integer NOT NULL,
	"material_description" text,
	"name" text NOT NULL,
	"range" text NOT NULL,
	"school" text NOT NULL,
	"upcast_description" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mastery" (
	"created_at" timestamp with time zone DEFAULT now(),
	"description" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weapon_properties" (
	"created_at" timestamp with time zone DEFAULT now(),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"range_long" integer,
	"range_short" integer,
	"updated_at" timestamp with time zone DEFAULT now(),
	"versatile_damage_die" text
);
--> statement-breakpoint
CREATE TABLE "weapon_to_weapon_properties" (
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"weapon_id" uuid NOT NULL,
	"weapon_property_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weapons" (
	"category" text NOT NULL,
	"classification" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"mastery_id" uuid NOT NULL,
	"name" text NOT NULL UNIQUE,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"created_at" timestamp with time zone DEFAULT now(),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"profile_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"email" text UNIQUE,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "weapon_to_weapon_properties" ADD CONSTRAINT "weapon_to_weapon_properties_weapon_id_weapons_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "weapons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "weapon_to_weapon_properties" ADD CONSTRAINT "weapon_to_weapon_properties_L1T3dSQbrwct_fkey" FOREIGN KEY ("weapon_property_id") REFERENCES "weapon_properties"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "weapons" ADD CONSTRAINT "weapons_mastery_id_mastery_id_fkey" FOREIGN KEY ("mastery_id") REFERENCES "mastery"("id");--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;