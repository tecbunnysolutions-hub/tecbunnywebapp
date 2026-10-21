-- Tenant ownership for WABA templates. Existing rows stay unowned (NULL) and are
-- visible to global administrators only.
-- public."Template" may be a plain table or a simple single-table view depending
-- on the environment, so handle both.
DO $$
DECLARE
  rel_kind "char";
  base_tables regclass[];
  base_table regclass;
  view_def text;
  from_count int;
BEGIN
  SELECT c.relkind INTO rel_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'Template';

  IF rel_kind IS NULL THEN
    RAISE NOTICE 'public."Template" not found; skipping tenant scope migration';
    RETURN;
  END IF;

  IF rel_kind IN ('r', 'p') THEN
    ALTER TABLE public."Template" ADD COLUMN IF NOT EXISTS organization_id text;
    ALTER TABLE public."Template" ADD COLUMN IF NOT EXISTS branch_id text;
    CREATE INDEX IF NOT EXISTS template_ownership_scope ON public."Template"(organization_id, branch_id);
    RETURN;
  END IF;

  IF rel_kind <> 'v' THEN
    RAISE EXCEPTION 'public."Template" is relkind %, expected table or view', rel_kind;
  END IF;

  SELECT array_agg(DISTINCT d.refobjid::regclass)
  INTO base_tables
  FROM pg_rewrite rw
  JOIN pg_depend d ON d.objid = rw.oid AND d.classid = 'pg_rewrite'::regclass
  JOIN pg_class bc ON bc.oid = d.refobjid
  WHERE rw.ev_class = 'public."Template"'::regclass
    AND bc.relkind IN ('r', 'p')
    AND bc.oid <> 'public."Template"'::regclass;

  IF base_tables IS NULL OR array_length(base_tables, 1) <> 1 THEN
    RAISE EXCEPTION 'public."Template" is a view over % base tables; add organization_id and branch_id to the real table and view manually', COALESCE(array_length(base_tables, 1), 0);
  END IF;
  base_table := base_tables[1];

  EXECUTE format('ALTER TABLE %s ADD COLUMN IF NOT EXISTS organization_id text', base_table);
  EXECUTE format('ALTER TABLE %s ADD COLUMN IF NOT EXISTS branch_id text', base_table);
  EXECUTE format('CREATE INDEX IF NOT EXISTS template_ownership_scope ON %s(organization_id, branch_id)', base_table);

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Template' AND column_name = 'organization_id'
  ) THEN
    RETURN;
  END IF;

  view_def := regexp_replace(pg_get_viewdef('public."Template"'::regclass, true), ';\s*$', '');
  SELECT count(*) INTO from_count FROM regexp_matches(view_def, '\sFROM\s', 'gi');
  IF from_count <> 1 OR view_def ~* '\s(JOIN|UNION|GROUP BY)\s' THEN
    RAISE EXCEPTION 'public."Template" view definition is too complex to rewrite automatically; add organization_id and branch_id to the view manually';
  END IF;

  view_def := regexp_replace(view_def, '\sFROM\s', E',\n    organization_id,\n    branch_id\n   FROM ', 'i');
  EXECUTE 'CREATE OR REPLACE VIEW public."Template" AS ' || view_def;
END $$;
