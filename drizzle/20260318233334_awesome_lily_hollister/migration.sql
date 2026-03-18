CREATE TABLE "monsters" (
	"actions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"alignment" text NOT NULL,
	"armor_class" integer NOT NULL,
	"bonus_actions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"challenge_rating" text NOT NULL,
	"charisma" integer NOT NULL,
	"charisma_save" integer NOT NULL,
	"constitution" integer NOT NULL,
	"constitution_save" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"creature_type" text NOT NULL,
	"descriptive_tags" text,
	"dexterity" integer NOT NULL,
	"dexterity_save" integer NOT NULL,
	"experience_points" integer,
	"experience_points_alt" text,
	"gear" text,
	"hit_point_dice" text NOT NULL,
	"hit_points" integer NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"immunities" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"initiative_modifier" text NOT NULL,
	"initiative_score" integer NOT NULL,
	"intelligence" integer NOT NULL,
	"intelligence_save" integer NOT NULL,
	"languages" text NOT NULL,
	"legendary_actions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"name" text NOT NULL,
	"proficiency_bonus" integer NOT NULL,
	"reactions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"resistances" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"senses" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"size" text NOT NULL,
	"skills" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"speed" text NOT NULL,
	"speed_burrow" text,
	"speed_climb" text,
	"speed_fly" text,
	"speed_swim" text,
	"strength" integer NOT NULL,
	"strength_save" integer NOT NULL,
	"traits" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"vulnerabilities" text,
	"wisdom" integer NOT NULL,
	"wisdom_save" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monsters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "damage_types" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "spells" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mastery" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "weapon_properties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "weapon_to_weapon_properties" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "weapons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "encounters" ENABLE ROW LEVEL SECURITY;