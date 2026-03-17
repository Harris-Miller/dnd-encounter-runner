DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_schema, c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'updatedAt'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I.%I',
      r.table_schema, r.table_name
    );
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()',
      r.table_schema, r.table_name
    );
  END LOOP;
END;
$$;