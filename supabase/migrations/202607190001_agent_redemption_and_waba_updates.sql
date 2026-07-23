-- =============================================================================
-- CONSOLIDATED MIGRATION (2026-07-23): agent redemption RPCs + WABA schema
-- updates. Merges 5 originally separate migration files (deleted after this
-- merge) into one, in their original chronological order. No SQL logic was
-- changed -- this is a pure concatenation for file-count reduction.
--   1. 202607190001_agent_redemption_transactions.sql
--   2. 202607190002_waba_conversation_notes.sql
--   3. 202607190003_waba_conversation_profile_fields.sql
--   4. 202607190004_waba_consent_and_status_events.sql
--   5. 202607190005_waba_template_provider_metadata.sql
-- All statements below are already idempotent (CREATE OR REPLACE FUNCTION,
-- CREATE TABLE/INDEX IF NOT EXISTS, guarded DO blocks), so safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Originally: 202607190001_agent_redemption_transactions.sql
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Originally: 202607190002_waba_conversation_notes.sql
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 3. Originally: 202607190003_waba_conversation_profile_fields.sql
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 4. Originally: 202607190004_waba_consent_and_status_events.sql
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.waba_contact_consent (
  phone TEXT PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'unknown',
  last_opt_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_contact_consent_opted_in
  ON public.waba_contact_consent(opted_in, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.waba_message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_message_status_events_message
  ON public.waba_message_status_events(message_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  message_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_campaign_sent
  ON public.mkt_campaign_analytics(campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_status_sent
  ON public.mkt_campaign_analytics(status, sent_at DESC);

-- -----------------------------------------------------------------------------
-- 5. Originally: 202607190005_waba_template_provider_metadata.sql
-- -----------------------------------------------------------------------------

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
