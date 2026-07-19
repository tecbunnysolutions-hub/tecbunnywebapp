DO $$
DECLARE
  template_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO template_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Template';

  IF template_relkind IN ('r', 'p') THEN
    target_table := 'public."Template"'::regclass;
  ELSIF template_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Template"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Template')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;

  END IF;

  IF target_table IS NULL AND to_regclass('public.wab_templates') IS NOT NULL THEN
    target_table := 'public.wab_templates'::regclass;
  END IF;

  IF target_table IS NULL AND template_relkind IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Template" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      body TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Template"'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No writable table target found for public."Template" or public.wab_templates. Skipping WABA template metadata column migration.';
    RETURN;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
      ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
      ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  $sql$, target_table);

  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'status'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status ON %s(provider_status, status)',
      target_table
    );
  ELSE
    RAISE NOTICE 'Skipping idx_waba_template_provider_status because % does not expose a physical status column', target_table;
  END IF;
END $$;