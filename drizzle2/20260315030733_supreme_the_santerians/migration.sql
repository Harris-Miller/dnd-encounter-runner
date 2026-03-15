CREATE TABLE "alignments" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "armor" (
	"id" char(26) PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "casting_times" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL,
	"qualifier_text" text
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conditions" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creature_types" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "damage_types" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "descriptive_tags" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "durations" (
	"amount" integer,
	"display_text" text,
	"id" char(26) PRIMARY KEY,
	"is_concentration" boolean NOT NULL,
	"name" text NOT NULL,
	"unit" text
);
--> statement-breakpoint
CREATE TABLE "magic_item_categories" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_item_charges" (
	"magic_item_id" char(26) PRIMARY KEY,
	"max_charges" integer NOT NULL,
	"recharge_text" text
);
--> statement-breakpoint
CREATE TABLE "magic_item_crafting_tools" (
	"magic_item_category_id" char(26),
	"tool_id" char(26),
	CONSTRAINT "magic_item_crafting_tools_pkey" PRIMARY KEY("magic_item_category_id","tool_id")
);
--> statement-breakpoint
CREATE TABLE "magic_item_damage_resistances" (
	"damage_type_id" char(26),
	"magic_item_id" char(26),
	CONSTRAINT "magic_item_damage_resistances_pkey" PRIMARY KEY("magic_item_id","damage_type_id")
);
--> statement-breakpoint
CREATE TABLE "magic_item_damage_vulnerabilities" (
	"damage_type_id" char(26),
	"magic_item_id" char(26),
	CONSTRAINT "magic_item_damage_vulnerabilities_pkey" PRIMARY KEY("magic_item_id","damage_type_id")
);
--> statement-breakpoint
CREATE TABLE "magic_item_rarities" (
	"crafting_cost_gp" numeric(12,2),
	"crafting_days" integer,
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL,
	"value_gp" numeric(12,2)
);
--> statement-breakpoint
CREATE TABLE "magic_item_spells" (
	"magic_item_id" char(26),
	"spell_id" char(26),
	"usage" text,
	CONSTRAINT "magic_item_spells_pkey" PRIMARY KEY("magic_item_id","spell_id")
);
--> statement-breakpoint
CREATE TABLE "magic_items" (
	"base_armor_id" char(26),
	"base_weapon_id" char(26),
	"category_specifier_text" text,
	"description_text" text,
	"id" char(26) PRIMARY KEY,
	"is_consumable" boolean NOT NULL,
	"is_cursed" boolean NOT NULL,
	"magic_item_category_id" char(26) NOT NULL,
	"magic_item_rarity_id" char(26) NOT NULL,
	"name" text NOT NULL,
	"requires_attunement" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monster_actions" (
	"description_text" text,
	"id" char(26) PRIMARY KEY,
	"monster_id" char(26) NOT NULL,
	"name" text NOT NULL,
	"section" text,
	"sort_order" integer NOT NULL,
	"usage_limit_text" text
);
--> statement-breakpoint
CREATE TABLE "monster_condition_immunities" (
	"condition_id" char(26),
	"monster_id" char(26),
	CONSTRAINT "monster_condition_immunities_pkey" PRIMARY KEY("monster_id","condition_id")
);
--> statement-breakpoint
CREATE TABLE "monster_damage_immunities" (
	"damage_type_id" char(26),
	"monster_id" char(26),
	CONSTRAINT "monster_damage_immunities_pkey" PRIMARY KEY("monster_id","damage_type_id")
);
--> statement-breakpoint
CREATE TABLE "monster_damage_resistances" (
	"damage_type_id" char(26),
	"monster_id" char(26),
	CONSTRAINT "monster_damage_resistances_pkey" PRIMARY KEY("monster_id","damage_type_id")
);
--> statement-breakpoint
CREATE TABLE "monster_damage_vulnerabilities" (
	"damage_type_id" char(26),
	"monster_id" char(26),
	CONSTRAINT "monster_damage_vulnerabilities_pkey" PRIMARY KEY("monster_id","damage_type_id")
);
--> statement-breakpoint
CREATE TABLE "monster_descriptive_tags" (
	"descriptive_tag_id" char(26),
	"monster_id" char(26),
	CONSTRAINT "monster_descriptive_tags_pkey" PRIMARY KEY("monster_id","descriptive_tag_id")
);
--> statement-breakpoint
CREATE TABLE "monster_speeds" (
	"distance_ft" integer NOT NULL,
	"id" char(26) PRIMARY KEY,
	"monster_id" char(26) NOT NULL,
	"note" text,
	"speed_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monster_spellcasting" (
	"component_note" text,
	"monster_id" char(26) PRIMARY KEY,
	"spell_attack_bonus" integer NOT NULL,
	"spell_save_dc" integer NOT NULL,
	"spellcasting_ability" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monster_spells" (
	"monster_id" char(26),
	"spell_id" char(26),
	"usage" text,
	CONSTRAINT "monster_spells_pkey" PRIMARY KEY("monster_id","spell_id","usage")
);
--> statement-breakpoint
CREATE TABLE "monster_traits" (
	"description_text" text,
	"id" char(26) PRIMARY KEY,
	"monster_id" char(26) NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"usage_limit_text" text
);
--> statement-breakpoint
CREATE TABLE "monsters" (
	"ac" integer NOT NULL,
	"alignment_id" char(26) NOT NULL,
	"cha" integer NOT NULL,
	"cha_save" integer,
	"con" integer NOT NULL,
	"con_save" integer,
	"cr" numeric(6,2),
	"creature_type_id" char(26) NOT NULL,
	"dex" integer NOT NULL,
	"dex_save" integer,
	"gear_text" text,
	"hp_average" integer NOT NULL,
	"hp_dice" text NOT NULL,
	"id" char(26) PRIMARY KEY,
	"initiative_modifier" integer NOT NULL,
	"initiative_score" integer NOT NULL,
	"int_save" integer,
	"int_score" integer NOT NULL,
	"languages_text" text,
	"legendary_action_uses" integer,
	"legendary_action_uses_in_lair" integer,
	"name" text NOT NULL,
	"proficiency_bonus" integer NOT NULL,
	"senses_text" text,
	"size_id" char(26) NOT NULL,
	"skills_text" text,
	"speed_text" text,
	"str" integer NOT NULL,
	"str_save" integer,
	"wis" integer NOT NULL,
	"wis_save" integer,
	"xp" integer,
	"xp_in_lair" integer
);
--> statement-breakpoint
CREATE TABLE "ranges" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL,
	"sort_feet" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sentient_magic_items" (
	"alignment_id" char(26) NOT NULL,
	"cha_score" integer NOT NULL,
	"communication_type" text,
	"int_score" integer NOT NULL,
	"magic_item_id" char(26) PRIMARY KEY,
	"senses_text" text,
	"special_purpose_text" text,
	"wis_score" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sizes" (
	"id" char(26) PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spell_class_map" (
	"class_id" char(26),
	"spell_id" char(26),
	CONSTRAINT "spell_class_map_pkey" PRIMARY KEY("spell_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "spell_components" (
	"material" boolean NOT NULL,
	"material_consumed" boolean NOT NULL,
	"material_cost_gp" numeric(12,2),
	"material_description" text,
	"somatic" boolean NOT NULL,
	"spell_id" char(26) PRIMARY KEY,
	"verbal" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spell_damage_types" (
	"damage_type_id" char(26),
	"spell_id" char(26),
	CONSTRAINT "spell_damage_types_pkey" PRIMARY KEY("spell_id","damage_type_id")
);
--> statement-breakpoint
CREATE TABLE "spells" (
	"cantrip_upgrade_description" text,
	"casting_time_id" char(26) NOT NULL,
	"description" text,
	"duration_id" char(26) NOT NULL,
	"id" char(26) PRIMARY KEY,
	"is_ritual" boolean NOT NULL,
	"level" integer NOT NULL,
	"name" text NOT NULL,
	"range_id" char(26) NOT NULL,
	"school_id" char(26) NOT NULL,
	"upcast_description" text
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" char(26) PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "weapons" (
	"id" char(26) PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "magic_item_charges" ADD CONSTRAINT "magic_item_charges_magic_item_id_magic_items_id_fkey" FOREIGN KEY ("magic_item_id") REFERENCES "magic_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_crafting_tools" ADD CONSTRAINT "magic_item_crafting_tools_eus65jsq5heI_fkey" FOREIGN KEY ("magic_item_category_id") REFERENCES "magic_item_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_crafting_tools" ADD CONSTRAINT "magic_item_crafting_tools_tool_id_tools_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_damage_resistances" ADD CONSTRAINT "magic_item_damage_resistances_y6ELwl5oc9Th_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "damage_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_damage_resistances" ADD CONSTRAINT "magic_item_damage_resistances_magic_item_id_magic_items_id_fkey" FOREIGN KEY ("magic_item_id") REFERENCES "magic_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_damage_vulnerabilities" ADD CONSTRAINT "magic_item_damage_vulnerabilities_8I1XAndqRMbT_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "damage_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_damage_vulnerabilities" ADD CONSTRAINT "magic_item_damage_vulnerabilities_UeZ3GZA6FImD_fkey" FOREIGN KEY ("magic_item_id") REFERENCES "magic_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_spells" ADD CONSTRAINT "magic_item_spells_magic_item_id_magic_items_id_fkey" FOREIGN KEY ("magic_item_id") REFERENCES "magic_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_item_spells" ADD CONSTRAINT "magic_item_spells_spell_id_spells_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spells"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_items" ADD CONSTRAINT "magic_items_base_armor_id_armor_id_fkey" FOREIGN KEY ("base_armor_id") REFERENCES "armor"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "magic_items" ADD CONSTRAINT "magic_items_base_weapon_id_weapons_id_fkey" FOREIGN KEY ("base_weapon_id") REFERENCES "weapons"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "magic_items" ADD CONSTRAINT "magic_items_xCfgyZ0ZUpfc_fkey" FOREIGN KEY ("magic_item_category_id") REFERENCES "magic_item_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "magic_items" ADD CONSTRAINT "magic_items_magic_item_rarity_id_magic_item_rarities_id_fkey" FOREIGN KEY ("magic_item_rarity_id") REFERENCES "magic_item_rarities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_actions" ADD CONSTRAINT "monster_actions_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_condition_immunities" ADD CONSTRAINT "monster_condition_immunities_condition_id_conditions_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_condition_immunities" ADD CONSTRAINT "monster_condition_immunities_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_damage_immunities" ADD CONSTRAINT "monster_damage_immunities_damage_type_id_damage_types_id_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "damage_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_damage_immunities" ADD CONSTRAINT "monster_damage_immunities_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_damage_resistances" ADD CONSTRAINT "monster_damage_resistances_damage_type_id_damage_types_id_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "damage_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_damage_resistances" ADD CONSTRAINT "monster_damage_resistances_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_damage_vulnerabilities" ADD CONSTRAINT "monster_damage_vulnerabilities_40ghFgfiD4Hc_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "damage_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_damage_vulnerabilities" ADD CONSTRAINT "monster_damage_vulnerabilities_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_descriptive_tags" ADD CONSTRAINT "monster_descriptive_tags_aDODfMDi0tBe_fkey" FOREIGN KEY ("descriptive_tag_id") REFERENCES "descriptive_tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_descriptive_tags" ADD CONSTRAINT "monster_descriptive_tags_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_speeds" ADD CONSTRAINT "monster_speeds_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_spellcasting" ADD CONSTRAINT "monster_spellcasting_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_spells" ADD CONSTRAINT "monster_spells_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_spells" ADD CONSTRAINT "monster_spells_spell_id_spells_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spells"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monster_traits" ADD CONSTRAINT "monster_traits_monster_id_monsters_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monsters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monsters" ADD CONSTRAINT "monsters_alignment_id_alignments_id_fkey" FOREIGN KEY ("alignment_id") REFERENCES "alignments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monsters" ADD CONSTRAINT "monsters_creature_type_id_creature_types_id_fkey" FOREIGN KEY ("creature_type_id") REFERENCES "creature_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "monsters" ADD CONSTRAINT "monsters_size_id_sizes_id_fkey" FOREIGN KEY ("size_id") REFERENCES "sizes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sentient_magic_items" ADD CONSTRAINT "sentient_magic_items_alignment_id_alignments_id_fkey" FOREIGN KEY ("alignment_id") REFERENCES "alignments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sentient_magic_items" ADD CONSTRAINT "sentient_magic_items_magic_item_id_magic_items_id_fkey" FOREIGN KEY ("magic_item_id") REFERENCES "magic_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spell_class_map" ADD CONSTRAINT "spell_class_map_class_id_classes_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spell_class_map" ADD CONSTRAINT "spell_class_map_spell_id_spells_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spells"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spell_components" ADD CONSTRAINT "spell_components_spell_id_spells_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spells"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spell_damage_types" ADD CONSTRAINT "spell_damage_types_damage_type_id_damage_types_id_fkey" FOREIGN KEY ("damage_type_id") REFERENCES "damage_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spell_damage_types" ADD CONSTRAINT "spell_damage_types_spell_id_spells_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spells"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spells" ADD CONSTRAINT "spells_casting_time_id_casting_times_id_fkey" FOREIGN KEY ("casting_time_id") REFERENCES "casting_times"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spells" ADD CONSTRAINT "spells_duration_id_durations_id_fkey" FOREIGN KEY ("duration_id") REFERENCES "durations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spells" ADD CONSTRAINT "spells_range_id_ranges_id_fkey" FOREIGN KEY ("range_id") REFERENCES "ranges"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "spells" ADD CONSTRAINT "spells_school_id_schools_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;