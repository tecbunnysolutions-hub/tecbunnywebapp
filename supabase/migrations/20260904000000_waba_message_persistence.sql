-- Restore the Supabase tables used by the WABA worker.
-- The worker uses the quoted Prisma-compatible names, not whatsapp_messages.

DO $$
DECLARE
  conversation_relkind "char";
  message_relkind "char";
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind = 'v' THEN
    IF to_regclass('public."Conversation_legacy"') IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot migrate public."Conversation": public."Conversation_legacy" already exists';
    END IF;
    ALTER VIEW public."Conversation" RENAME TO "Conversation_legacy";
    conversation_relkind := NULL;
  END IF;

  IF conversation_relkind IS NULL THEN
    CREATE TABLE public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT NOT NULL UNIQUE,
      last_interaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      contact_name TEXT,
      address TEXT,
      pincode TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      priority TEXT NOT NULL DEFAULT 'NORMAL',
      tags TEXT[] NOT NULL DEFAULT '{}',
      notes TEXT,
      assigned_to UUID,
      department TEXT NOT NULL DEFAULT 'UNASSIGNED',
      ai_active BOOLEAN NOT NULL DEFAULT TRUE,
      deal_value TEXT,
      active_flow TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    IF to_regclass('public."Conversation_legacy"') IS NOT NULL THEN
      INSERT INTO public."Conversation" (sender_number)
      SELECT sender_number
      FROM public."Conversation_legacy"
      WHERE sender_number IS NOT NULL
      ON CONFLICT (sender_number) DO NOTHING;
    END IF;
  ELSIF conversation_relkind NOT IN ('r', 'p') THEN
    RAISE EXCEPTION 'WABA message migration cannot use public."Conversation" relation kind %', conversation_relkind;
  END IF;

  SELECT c.relkind
    INTO message_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Message';

  IF message_relkind = 'v' THEN
    IF to_regclass('public."Message_legacy"') IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot migrate public."Message": public."Message_legacy" already exists';
    END IF;
    ALTER VIEW public."Message" RENAME TO "Message_legacy";
    message_relkind := NULL;
  END IF;

  IF message_relkind IS NULL THEN
    CREATE TABLE public."Message" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id TEXT,
      sender_number TEXT NOT NULL REFERENCES public."Conversation"(sender_number) ON DELETE CASCADE,
      direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
      message_content TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'DELIVERED',
      media_url TEXT,
      media_type TEXT,
      sent_by TEXT
    );
  ELSIF message_relkind IN ('r', 'p') THEN
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS message_id TEXT;
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS sender_number TEXT;
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS direction TEXT;
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS message_content TEXT;
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'DELIVERED';
    ALTER TABLE public."Message" ADD COLUMN IF NOT EXISTS sent_by TEXT;
    ALTER TABLE public."Message" ALTER COLUMN message_id DROP NOT NULL;
  ELSE
    RAISE EXCEPTION 'WABA message migration cannot use public."Message" relation kind %', message_relkind;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_message_provider_id
  ON public."Message" (message_id)
  WHERE message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_message_sender_timestamp
  ON public."Message" (sender_number, timestamp DESC);

ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;