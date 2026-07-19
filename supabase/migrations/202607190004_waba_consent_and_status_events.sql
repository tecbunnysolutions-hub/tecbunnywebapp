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

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);