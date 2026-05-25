-- Custom SQL migration file, put your code below! --
DROP FUNCTION IF EXISTS public.encounter_create(uuid, uuid, text, jsonb);
