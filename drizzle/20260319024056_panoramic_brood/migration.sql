CREATE TABLE "magic_items" (
	"category_specifier_text" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"ddb_id" text,
	"description_text" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"is_consumable" boolean NOT NULL,
	"is_cursed" boolean NOT NULL,
	"magic_item_category" text NOT NULL,
	"magic_item_rarity_id" text NOT NULL,
	"name" text NOT NULL,
	"requires_attunement" boolean NOT NULL,
	"slug" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "magic_items" ENABLE ROW LEVEL SECURITY;