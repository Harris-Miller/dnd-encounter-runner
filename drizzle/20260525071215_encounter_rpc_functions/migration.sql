-- Encounter transform RPCs.
-- These functions perform atomic updates on encounters.state (jsonb).
-- They all run as security invoker so RLS on the encounters table applies.

-- Simple single-column transforms ------------------------------------------------

CREATE OR REPLACE FUNCTION public.encounter_create(
  p_profile_id uuid,
  p_encounter_id uuid,
  p_name text,
  p_state jsonb
)
RETURNS SETOF public.encounters
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO public.encounters (id, profile_id, name, state)
  VALUES (p_encounter_id, p_profile_id, p_name, p_state)
  RETURNING *;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_set_name(
  p_encounter_id uuid,
  p_name text
)
RETURNS SETOF public.encounters
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.encounters
  SET name = p_name, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING *;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_set_active(
  p_encounter_id uuid,
  p_active boolean
)
RETURNS SETOF public.encounters
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.encounters
  SET active = p_active, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING *;
$$;
--> statement-breakpoint

-- Surgical JSONB transforms ------------------------------------------------------
-- These touch a single specific path so concurrent writes against different
-- paths land cleanly without read-modify-write.

CREATE OR REPLACE FUNCTION public.encounter_adjust_hp(
  p_encounter_id uuid,
  p_combatant_id text,
  p_delta integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_mark_reaction_used(
  p_encounter_id uuid,
  p_combatant_id text,
  p_used boolean
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_apply_effect(
  p_encounter_id uuid,
  p_combatant_id text,
  p_effect jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_remove_effect(
  p_encounter_id uuid,
  p_combatant_id text,
  p_effect_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_set_initiative(
  p_encounter_id uuid,
  p_combatant_id text,
  p_initiative integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_remove_combatant(
  p_encounter_id uuid,
  p_combatant_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_dismiss_reminder(
  p_encounter_id uuid,
  p_reminder_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

-- Multi-path transforms ----------------------------------------------------------
-- These touch multiple paths and the logic for computing the next state lives in
-- the client reducer. The function accepts the precomputed next state and writes
-- it atomically. The parity test guarantees the SQL functions and the TS reducer
-- produce identical states.

CREATE OR REPLACE FUNCTION public.encounter_add_combatant(
  p_encounter_id uuid,
  p_combatant jsonb,
  p_next_initiative_order jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_advance_turn(
  p_encounter_id uuid,
  p_next_state jsonb
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.encounters
  SET state = p_next_state, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_advance_round(
  p_encounter_id uuid,
  p_next_state jsonb
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.encounters
  SET state = p_next_state, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.encounter_record_event(
  p_encounter_id uuid,
  p_next_state jsonb
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.encounters
  SET state = p_next_state, updated_at = now()
  WHERE id = p_encounter_id
  RETURNING state;
$$;
