DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT UNIQUE,
      contact_name TEXT,
      status TEXT DEFAULT 'OPEN',
      last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
      assigned_to UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Conversation"'::regclass;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS ai_active BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS deal_value TEXT,
      ADD COLUMN IF NOT EXISTS active_flow TEXT
  $sql$, target_table);
END $$;