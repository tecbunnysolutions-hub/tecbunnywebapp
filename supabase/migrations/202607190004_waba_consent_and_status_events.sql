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