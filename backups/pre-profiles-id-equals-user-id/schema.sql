


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."magic_item_variant_rarity" AS ENUM (
    'Artifact',
    'Legendary',
    'Rare',
    'Uncommon',
    'Very Rare'
);


ALTER TYPE "public"."magic_item_variant_rarity" OWNER TO "postgres";


CREATE TYPE "public"."profile_avatar_source" AS ENUM (
    'oauth',
    'uploaded'
);


ALTER TYPE "public"."profile_avatar_source" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_add_combatant"("p_encounter_id" "uuid", "p_combatant" "jsonb", "p_next_initiative_order" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_state jsonb;
  v_combatant_id text;
BEGIN
  v_combatant_id := p_combatant ->> 'id';

  IF v_combatant_id IS NULL OR v_combatant_id = '' THEN
    RAISE EXCEPTION 'p_combatant must include an id';
  END IF;

  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  v_state := jsonb_set(
    v_state,
    ARRAY['combatants', v_combatant_id],
    p_combatant,
    true
  );

  v_state := jsonb_set(v_state, ARRAY['initiativeOrder'], p_next_initiative_order);

  UPDATE public.encounters
  SET state = v_state, updated_at = now()
  WHERE id = p_encounter_id;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_add_combatant"("p_encounter_id" "uuid", "p_combatant" "jsonb", "p_next_initiative_order" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_adjust_hp"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_delta" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_current_hp integer;
  v_max_hp integer;
  v_next_hp integer;
  v_state jsonb;
BEGIN
  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  v_current_hp := (v_state #>> ARRAY['combatants', p_combatant_id, 'currentHp'])::int;
  v_max_hp := (v_state #>> ARRAY['combatants', p_combatant_id, 'maxHp'])::int;

  IF v_current_hp IS NULL OR v_max_hp IS NULL THEN
    RAISE EXCEPTION 'Combatant % not found in encounter %', p_combatant_id, p_encounter_id;
  END IF;

  v_next_hp := GREATEST(0, LEAST(v_max_hp, v_current_hp + p_delta));

  UPDATE public.encounters
  SET state = jsonb_set(state, ARRAY['combatants', p_combatant_id, 'currentHp'], to_jsonb(v_next_hp)),
      updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state INTO v_state;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_adjust_hp"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_delta" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_advance_round"("p_encounter_id" "uuid", "p_next_state" "jsonb") RETURNS "jsonb"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.encounters
  SET state = p_next_state, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;


ALTER FUNCTION "public"."encounter_advance_round"("p_encounter_id" "uuid", "p_next_state" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_advance_turn"("p_encounter_id" "uuid", "p_next_state" "jsonb") RETURNS "jsonb"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.encounters
  SET state = p_next_state, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;


ALTER FUNCTION "public"."encounter_advance_turn"("p_encounter_id" "uuid", "p_next_state" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_apply_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_existing jsonb;
  v_state jsonb;
BEGIN
  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  v_existing := COALESCE(v_state #> ARRAY['combatants', p_combatant_id, 'effects'], '[]'::jsonb);

  UPDATE public.encounters
  SET state = jsonb_set(
        state,
        ARRAY['combatants', p_combatant_id, 'effects'],
        v_existing || jsonb_build_array(p_effect)
      ),
      updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state INTO v_state;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_apply_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_dismiss_reminder"("p_encounter_id" "uuid", "p_reminder_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_state jsonb;
  v_reminders jsonb;
  v_next jsonb;
BEGIN
  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  v_reminders := COALESCE(v_state -> 'reminders', '[]'::jsonb);

  SELECT COALESCE(
    jsonb_agg(
      CASE
        WHEN elem ->> 'id' = p_reminder_id THEN jsonb_set(elem, ARRAY['dismissed'], 'true'::jsonb)
        ELSE elem
      END
    ),
    '[]'::jsonb
  )
  INTO v_next
  FROM jsonb_array_elements(v_reminders) AS elem;

  v_state := jsonb_set(v_state, ARRAY['reminders'], v_next);

  UPDATE public.encounters
  SET state = v_state, updated_at = now()
  WHERE id = p_encounter_id;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_dismiss_reminder"("p_encounter_id" "uuid", "p_reminder_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_mark_reaction_used"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_used" boolean) RETURNS "jsonb"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.encounters
  SET state = jsonb_set(
        state,
        ARRAY['combatants', p_combatant_id, 'actionEconomy', 'reactionUsed'],
        to_jsonb(p_used)
      ),
      updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;


ALTER FUNCTION "public"."encounter_mark_reaction_used"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_used" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_record_event"("p_encounter_id" "uuid", "p_next_state" "jsonb") RETURNS "jsonb"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.encounters
  SET state = p_next_state, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;


ALTER FUNCTION "public"."encounter_record_event"("p_encounter_id" "uuid", "p_next_state" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_remove_combatant"("p_encounter_id" "uuid", "p_combatant_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_state jsonb;
  v_order jsonb;
  v_next_order jsonb;
  v_turn_index integer;
  v_next_turn_index integer;
BEGIN
  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  -- Remove from combatants map
  v_state := v_state #- ARRAY['combatants', p_combatant_id];

  -- Rebuild initiativeOrder without the removed id
  v_order := COALESCE(v_state -> 'initiativeOrder', '[]'::jsonb);

  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  INTO v_next_order
  FROM jsonb_array_elements_text(v_order) AS elem
  WHERE elem <> p_combatant_id;

  v_state := jsonb_set(v_state, ARRAY['initiativeOrder'], v_next_order);

  -- Clamp turnIndex if it is now out of bounds
  v_turn_index := COALESCE((v_state ->> 'turnIndex')::int, 0);
  v_next_turn_index := LEAST(v_turn_index, GREATEST(0, jsonb_array_length(v_next_order) - 1));
  v_state := jsonb_set(v_state, ARRAY['turnIndex'], to_jsonb(v_next_turn_index));

  UPDATE public.encounters
  SET state = v_state, updated_at = now()
  WHERE id = p_encounter_id;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_remove_combatant"("p_encounter_id" "uuid", "p_combatant_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_remove_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_existing jsonb;
  v_filtered jsonb;
  v_state jsonb;
BEGIN
  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  v_existing := COALESCE(v_state #> ARRAY['combatants', p_combatant_id, 'effects'], '[]'::jsonb);

  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  INTO v_filtered
  FROM jsonb_array_elements(v_existing) AS elem
  WHERE elem->>'id' <> p_effect_id;

  UPDATE public.encounters
  SET state = jsonb_set(
        state,
        ARRAY['combatants', p_combatant_id, 'effects'],
        v_filtered
      ),
      updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state INTO v_state;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_remove_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."encounters" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "active" boolean DEFAULT false NOT NULL,
    "name" "text" DEFAULT 'Untitled Encounter'::"text" NOT NULL,
    "state" "jsonb" DEFAULT '{"round": 1, "events": [], "reminders": [], "turnIndex": 0, "combatants": {}, "initiativeOrder": []}'::"jsonb" NOT NULL,
    "campaign_id" "uuid" NOT NULL
);


ALTER TABLE "public"."encounters" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_set_active"("p_encounter_id" "uuid", "p_active" boolean) RETURNS SETOF "public"."encounters"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.encounters
  SET active = p_active, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING *;
$$;


ALTER FUNCTION "public"."encounter_set_active"("p_encounter_id" "uuid", "p_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_set_initiative"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_initiative" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_state jsonb;
  v_combatants jsonb;
  v_next_order jsonb;
BEGIN
  SELECT state INTO v_state FROM public.encounters WHERE id = p_encounter_id;

  IF v_state IS NULL THEN
    RAISE EXCEPTION 'Encounter % not found', p_encounter_id;
  END IF;

  IF v_state #> ARRAY['combatants', p_combatant_id] IS NULL THEN
    RAISE EXCEPTION 'Combatant % not found in encounter %', p_combatant_id, p_encounter_id;
  END IF;

  v_state := jsonb_set(
    v_state,
    ARRAY['combatants', p_combatant_id, 'initiative'],
    to_jsonb(p_initiative)
  );

  v_combatants := v_state -> 'combatants';

  SELECT COALESCE(jsonb_agg(id ORDER BY (v_combatants -> id ->> 'initiative')::int DESC NULLS LAST, id), '[]'::jsonb)
  INTO v_next_order
  FROM jsonb_object_keys(v_combatants) AS id;

  v_state := jsonb_set(v_state, ARRAY['initiativeOrder'], v_next_order);

  UPDATE public.encounters
  SET state = v_state, updated_at = now()
  WHERE id = p_encounter_id;

  RETURN v_state;
END;
$$;


ALTER FUNCTION "public"."encounter_set_initiative"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_initiative" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."encounter_set_name"("p_encounter_id" "uuid", "p_name" "text") RETURNS SETOF "public"."encounters"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.encounters
  SET name = p_name, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING *;
$$;


ALTER FUNCTION "public"."encounter_set_name"("p_encounter_id" "uuid", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_campaign_by_invite"("p_invite_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT c.id, c.name
  FROM public.campaigns c
  WHERE c.invite_id = p_invite_id;
$$;


ALTER FUNCTION "public"."get_campaign_by_invite"("p_invite_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_campaign_via_invite"("p_invite_id" "uuid", "p_character_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_campaign_id uuid;
  v_profile_id uuid;
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

  SELECT p.id INTO v_profile_id
  FROM public.profiles p
  WHERE p.user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.characters ch
    WHERE ch.id = p_character_id
      AND ch.profile_id = v_profile_id
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


ALTER FUNCTION "public"."join_campaign_via_invite"("p_invite_id" "uuid", "p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_character_profile_id_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  IF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    RAISE EXCEPTION 'Cannot reassign character ownership';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_character_profile_id_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_character_from_campaign"("p_campaign_id" "uuid", "p_character_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.user_owns_campaign(p_campaign_id) THEN
    RAISE EXCEPTION 'Campaign not found or not owned by caller';
  END IF;

  UPDATE public.characters
  SET campaign_id = NULL
  WHERE id = p_character_id
    AND campaign_id = p_campaign_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found in campaign';
  END IF;

  RETURN p_character_id;
END;
$$;


ALTER FUNCTION "public"."remove_character_from_campaign"("p_campaign_id" "uuid", "p_character_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_is_campaign_member"("p_campaign_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.characters ch
    JOIN public.profiles p ON ch.profile_id = p.id
    WHERE ch.campaign_id = p_campaign_id
      AND p.user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."user_is_campaign_member"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_owns_campaign"("p_campaign_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaigns c
    JOIN public.profiles p ON c.profile_id = p.id
    WHERE c.id = p_campaign_id
      AND p.user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."user_owns_campaign"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint,
    "name" "text",
    "applied_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT 'Untitled Campaign'::"text" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "invite_id" "uuid"
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."characters" (
    "armor_class" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" integer DEFAULT 1 NOT NULL,
    "max_hit_points" integer NOT NULL,
    "name" "text" NOT NULL,
    "notes" "text",
    "profile_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" "uuid"
);


ALTER TABLE "public"."characters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."damage_types" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."damage_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."magic_items" (
    "category_specifier_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ddb_id" "text",
    "description_text" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_consumable" boolean NOT NULL,
    "is_cursed" boolean NOT NULL,
    "magic_item_category" "text" NOT NULL,
    "magic_item_rarity_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "requires_attunement" boolean NOT NULL,
    "slug" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "variant_rarities" "public"."magic_item_variant_rarity"[]
);


ALTER TABLE "public"."magic_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mastery" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mastery" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monsters" (
    "actions" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "alignment" "text" NOT NULL,
    "armor_class" integer NOT NULL,
    "bonus_actions" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "challenge_rating" "text" NOT NULL,
    "charisma" integer NOT NULL,
    "charisma_save" integer NOT NULL,
    "constitution" integer NOT NULL,
    "constitution_save" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "creature_type" "text" NOT NULL,
    "descriptive_tags" "text",
    "dexterity" integer NOT NULL,
    "dexterity_save" integer NOT NULL,
    "experience_points" integer,
    "experience_points_alt" "text",
    "gear" "text",
    "hit_point_dice" "text" NOT NULL,
    "hit_points" integer NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "immunities" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "initiative_modifier" "text" NOT NULL,
    "initiative_score" integer NOT NULL,
    "intelligence" integer NOT NULL,
    "intelligence_save" integer NOT NULL,
    "languages" "text" NOT NULL,
    "legendary_actions" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "name" "text" NOT NULL,
    "proficiency_bonus" integer NOT NULL,
    "reactions" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "resistances" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "senses" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "size" "text" NOT NULL,
    "skills" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "speed" "text" NOT NULL,
    "speed_burrow" "text",
    "speed_climb" "text",
    "speed_fly" "text",
    "speed_swim" "text",
    "strength" integer NOT NULL,
    "strength_save" integer NOT NULL,
    "traits" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vulnerabilities" "text",
    "wisdom" integer NOT NULL,
    "wisdom_save" integer NOT NULL
);


ALTER TABLE "public"."monsters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "avatar_source" "public"."profile_avatar_source" DEFAULT 'oauth'::"public"."profile_avatar_source" NOT NULL,
    "uploaded_avatar_id" "uuid",
    "gravatar_id" character(64)
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spells" (
    "casting_time" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "duration" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_concentration" boolean NOT NULL,
    "is_material" boolean NOT NULL,
    "is_ritual" boolean NOT NULL,
    "is_somatic" boolean NOT NULL,
    "is_verbal" boolean NOT NULL,
    "level" integer NOT NULL,
    "material_description" "text",
    "name" "text" NOT NULL,
    "range" "text" NOT NULL,
    "school" "text" NOT NULL,
    "upcast_description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."spells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weapon_properties" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "range_long" integer,
    "range_short" integer,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "versatile_damage_die" "text"
);


ALTER TABLE "public"."weapon_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weapon_to_weapon_properties" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "weapon_id" "uuid" NOT NULL,
    "weapon_property_id" "uuid" NOT NULL
);


ALTER TABLE "public"."weapon_to_weapon_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weapons" (
    "category" "text" NOT NULL,
    "classification" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mastery_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."weapons" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_invite_id_key" UNIQUE ("invite_id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."characters"
    ADD CONSTRAINT "characters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."damage_types"
    ADD CONSTRAINT "damage_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."encounters"
    ADD CONSTRAINT "encounters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."magic_items"
    ADD CONSTRAINT "magic_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mastery"
    ADD CONSTRAINT "mastery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monsters"
    ADD CONSTRAINT "monsters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."spells"
    ADD CONSTRAINT "spells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weapon_properties"
    ADD CONSTRAINT "weapon_properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weapons"
    ADD CONSTRAINT "weapons_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."weapons"
    ADD CONSTRAINT "weapons_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "characters_profile_id_immutable" BEFORE UPDATE ON "public"."characters" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_character_profile_id_change"();



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."characters"
    ADD CONSTRAINT "characters_campaign_id_campaigns_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."characters"
    ADD CONSTRAINT "characters_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounters"
    ADD CONSTRAINT "encounters_campaign_id_campaigns_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounters"
    ADD CONSTRAINT "encounters_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weapon_to_weapon_properties"
    ADD CONSTRAINT "weapon_to_weapon_properties_L1T3dSQbrwct_fkey" FOREIGN KEY ("weapon_property_id") REFERENCES "public"."weapon_properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weapon_to_weapon_properties"
    ADD CONSTRAINT "weapon_to_weapon_properties_weapon_id_weapons_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "public"."weapons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weapons"
    ADD CONSTRAINT "weapons_mastery_id_mastery_id_fkey" FOREIGN KEY ("mastery_id") REFERENCES "public"."mastery"("id");



ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "campaigns_delete_own" ON "public"."campaigns" FOR DELETE TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "campaigns_insert_own" ON "public"."campaigns" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "campaigns_select_member" ON "public"."campaigns" FOR SELECT TO "authenticated" USING ("public"."user_is_campaign_member"("id"));



CREATE POLICY "campaigns_select_own" ON "public"."campaigns" FOR SELECT TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "campaigns_update_own" ON "public"."campaigns" FOR UPDATE TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())))) WITH CHECK (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."characters" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "characters_delete_own" ON "public"."characters" FOR DELETE TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "characters_insert_own" ON "public"."characters" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "characters_select_campaign_owner" ON "public"."characters" FOR SELECT TO "authenticated" USING ((("campaign_id" IS NOT NULL) AND "public"."user_owns_campaign"("campaign_id")));



CREATE POLICY "characters_select_own" ON "public"."characters" FOR SELECT TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "characters_update_campaign_owner" ON "public"."characters" FOR UPDATE TO "authenticated" USING ((("campaign_id" IS NOT NULL) AND "public"."user_owns_campaign"("campaign_id"))) WITH CHECK ((("campaign_id" IS NOT NULL) AND "public"."user_owns_campaign"("campaign_id")));



CREATE POLICY "characters_update_own" ON "public"."characters" FOR UPDATE TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())))) WITH CHECK (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."damage_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "damage_types_select_authenticated" ON "public"."damage_types" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."encounters" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "encounters_delete_own" ON "public"."encounters" FOR DELETE TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "encounters_insert_own" ON "public"."encounters" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "encounters_select_own" ON "public"."encounters" FOR SELECT TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



CREATE POLICY "encounters_update_own" ON "public"."encounters" FOR UPDATE TO "authenticated" USING (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"())))) WITH CHECK (("profile_id" IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."magic_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "magic_items_select_authenticated" ON "public"."magic_items" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."mastery" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monsters" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "monsters_select_authenticated" ON "public"."monsters" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."spells" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "spells_select_authenticated" ON "public"."spells" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."weapon_properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weapon_to_weapon_properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weapons" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."encounter_add_combatant"("p_encounter_id" "uuid", "p_combatant" "jsonb", "p_next_initiative_order" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_add_combatant"("p_encounter_id" "uuid", "p_combatant" "jsonb", "p_next_initiative_order" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_add_combatant"("p_encounter_id" "uuid", "p_combatant" "jsonb", "p_next_initiative_order" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_adjust_hp"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_delta" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_adjust_hp"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_delta" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_adjust_hp"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_delta" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_advance_round"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_advance_round"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_advance_round"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_advance_turn"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_advance_turn"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_advance_turn"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_apply_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_apply_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_apply_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_dismiss_reminder"("p_encounter_id" "uuid", "p_reminder_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_dismiss_reminder"("p_encounter_id" "uuid", "p_reminder_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_dismiss_reminder"("p_encounter_id" "uuid", "p_reminder_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_mark_reaction_used"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_used" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_mark_reaction_used"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_used" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_mark_reaction_used"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_used" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_record_event"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_record_event"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_record_event"("p_encounter_id" "uuid", "p_next_state" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_remove_combatant"("p_encounter_id" "uuid", "p_combatant_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_remove_combatant"("p_encounter_id" "uuid", "p_combatant_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_remove_combatant"("p_encounter_id" "uuid", "p_combatant_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_remove_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_remove_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_remove_effect"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_effect_id" "text") TO "service_role";



GRANT ALL ON TABLE "public"."encounters" TO "anon";
GRANT ALL ON TABLE "public"."encounters" TO "authenticated";
GRANT ALL ON TABLE "public"."encounters" TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_set_active"("p_encounter_id" "uuid", "p_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_set_active"("p_encounter_id" "uuid", "p_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_set_active"("p_encounter_id" "uuid", "p_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_set_initiative"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_initiative" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_set_initiative"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_initiative" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_set_initiative"("p_encounter_id" "uuid", "p_combatant_id" "text", "p_initiative" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."encounter_set_name"("p_encounter_id" "uuid", "p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."encounter_set_name"("p_encounter_id" "uuid", "p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."encounter_set_name"("p_encounter_id" "uuid", "p_name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_campaign_by_invite"("p_invite_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_campaign_by_invite"("p_invite_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_by_invite"("p_invite_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_by_invite"("p_invite_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."join_campaign_via_invite"("p_invite_id" "uuid", "p_character_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."join_campaign_via_invite"("p_invite_id" "uuid", "p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."join_campaign_via_invite"("p_invite_id" "uuid", "p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_campaign_via_invite"("p_invite_id" "uuid", "p_character_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_character_profile_id_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_character_profile_id_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_character_profile_id_change"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."remove_character_from_campaign"("p_campaign_id" "uuid", "p_character_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remove_character_from_campaign"("p_campaign_id" "uuid", "p_character_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_character_from_campaign"("p_campaign_id" "uuid", "p_character_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_character_from_campaign"("p_campaign_id" "uuid", "p_character_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."user_is_campaign_member"("p_campaign_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."user_is_campaign_member"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_is_campaign_member"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_is_campaign_member"("p_campaign_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."user_owns_campaign"("p_campaign_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."user_owns_campaign"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_owns_campaign"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_owns_campaign"("p_campaign_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."characters" TO "anon";
GRANT ALL ON TABLE "public"."characters" TO "authenticated";
GRANT ALL ON TABLE "public"."characters" TO "service_role";



GRANT ALL ON TABLE "public"."damage_types" TO "anon";
GRANT ALL ON TABLE "public"."damage_types" TO "authenticated";
GRANT ALL ON TABLE "public"."damage_types" TO "service_role";



GRANT ALL ON TABLE "public"."magic_items" TO "anon";
GRANT ALL ON TABLE "public"."magic_items" TO "authenticated";
GRANT ALL ON TABLE "public"."magic_items" TO "service_role";



GRANT ALL ON TABLE "public"."mastery" TO "anon";
GRANT ALL ON TABLE "public"."mastery" TO "authenticated";
GRANT ALL ON TABLE "public"."mastery" TO "service_role";



GRANT ALL ON TABLE "public"."monsters" TO "anon";
GRANT ALL ON TABLE "public"."monsters" TO "authenticated";
GRANT ALL ON TABLE "public"."monsters" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."spells" TO "anon";
GRANT ALL ON TABLE "public"."spells" TO "authenticated";
GRANT ALL ON TABLE "public"."spells" TO "service_role";



GRANT ALL ON TABLE "public"."weapon_properties" TO "anon";
GRANT ALL ON TABLE "public"."weapon_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."weapon_properties" TO "service_role";



GRANT ALL ON TABLE "public"."weapon_to_weapon_properties" TO "anon";
GRANT ALL ON TABLE "public"."weapon_to_weapon_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."weapon_to_weapon_properties" TO "service_role";



GRANT ALL ON TABLE "public"."weapons" TO "anon";
GRANT ALL ON TABLE "public"."weapons" TO "authenticated";
GRANT ALL ON TABLE "public"."weapons" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































