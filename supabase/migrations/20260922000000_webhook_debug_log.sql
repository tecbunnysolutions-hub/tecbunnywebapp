-- Persistent webhook debug trail for the WABA inline (serverless) path.
-- Vercel Hobby hides runtime logs, so each webhook stage is written here for
-- traceability: inline_started -> triage_done -> inline_processed / inline_failed.

CREATE TABLE IF NOT EXISTS public.webhook_debug_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stage TEXT NOT NULL,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webhook_debug_log_created_at_idx
  ON public.webhook_debug_log (created_at DESC);

-- Service-role only: this is an internal ops/debug table, not public data.
ALTER TABLE public.webhook_debug_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_debug_log_service_all
  ON public.webhook_debug_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
