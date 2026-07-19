ALTER TABLE public."Template"
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
  ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
  ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
  ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status
  ON public."Template"(provider_status, status);