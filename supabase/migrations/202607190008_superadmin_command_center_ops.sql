-- Superadmin command center operations: alert acknowledgement lifecycle and
-- privileged database connection statistics for the executive dashboard.

CREATE TABLE IF NOT EXISTS public.enterprise_alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'acknowledged' CHECK (status IN ('acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_key
  ON public.enterprise_alert_acknowledgements(alert_key, created_at DESC);

ALTER TABLE public.enterprise_alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Privileged connection statistics for the Superadmin dashboard. SECURITY DEFINER
-- so the service role can read pg_stat_activity without broad grants.
CREATE OR REPLACE FUNCTION public.superadmin_connection_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
  )
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM anon;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_connection_stats() TO service_role;
