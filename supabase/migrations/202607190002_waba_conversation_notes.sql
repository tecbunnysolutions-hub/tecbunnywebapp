CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    RAISE NOTICE 'No table target found for public."Conversation". Creating waba_conversation_notes without a conversation foreign key.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'sender_number'
      AND NOT attisdropped
  ) THEN
    RAISE NOTICE 'Resolved conversation table % does not expose sender_number. Creating waba_conversation_notes without a conversation foreign key.', target_table;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waba_conversation_notes_sender_number_fkey'
      AND conrelid = 'public.waba_conversation_notes'::regclass
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE public.waba_conversation_notes ADD CONSTRAINT waba_conversation_notes_sender_number_fkey FOREIGN KEY (sender_number) REFERENCES %s(sender_number) ON DELETE CASCADE',
      target_table
    );
  EXCEPTION
    WHEN invalid_foreign_key THEN
      RAISE NOTICE 'Resolved conversation table % cannot support a sender_number foreign key. Creating waba_conversation_notes without it.', target_table;
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Existing waba_conversation_notes rows do not all match %. Creating waba_conversation_notes without a conversation foreign key.', target_table;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);