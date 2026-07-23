-- =============================================================================
-- CONSOLIDATED MIGRATION (2026-07-23): enterprise analytics/audit logging +
-- mgmt profile preferences + superadmin command-center ops. Merges 3
-- originally separate migration files (deleted after this merge) into one,
-- in their original chronological order. No SQL logic was changed -- this is
-- a pure concatenation for file-count reduction.
--   1. 202607190006_enterprise_analytics_logging.sql
--   2. 202607190007_mgmt_profile_preferences.sql
--   3. 202607190008_superadmin_command_center_ops.sql
-- All statements below are already idempotent (CREATE TABLE/INDEX IF NOT
-- EXISTS, ADD COLUMN IF NOT EXISTS, ON CONFLICT DO NOTHING, DROP TRIGGER IF
-- EXISTS + CREATE TRIGGER, CREATE OR REPLACE FUNCTION), so safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Originally: 202607190006_enterprise_analytics_logging.sql
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.enterprise_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL DEFAULT 'feature_usage',
  description TEXT,
  application TEXT NOT NULL,
  module TEXT,
  screen TEXT,
  action TEXT,
  trigger_type TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  user_id TEXT,
  user_email TEXT,
  role TEXT,
  company_id TEXT,
  company_name TEXT,
  branch_id TEXT,
  branch_name TEXT,
  department TEXT,
  session_id TEXT,
  request_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  database_table TEXT,
  api_endpoint TEXT,
  http_method TEXT,
  http_status INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  value_numeric NUMERIC,
  currency TEXT,
  device TEXT,
  browser TEXT,
  operating_system TEXT,
  ip_address INET,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  dashboard TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  retention_period TEXT NOT NULL DEFAULT '26 months',
  retention_until TIMESTAMPTZ,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_analytics_events_time
  ON public.enterprise_analytics_events(application, event_category, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_analytics_events_user
  ON public.enterprise_analytics_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_analytics_events_request
  ON public.enterprise_analytics_events(request_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_analytics_events_metadata
  ON public.enterprise_analytics_events USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.enterprise_staff_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_email TEXT,
  role TEXT,
  company_id TEXT,
  company_name TEXT,
  branch_id TEXT,
  branch_name TEXT,
  department TEXT,
  application TEXT NOT NULL,
  module TEXT NOT NULL,
  screen TEXT,
  action TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id TEXT,
  session_id TEXT,
  request_id TEXT,
  ip_address INET,
  browser TEXT,
  operating_system TEXT,
  device TEXT,
  api_endpoint TEXT,
  http_method TEXT,
  http_status INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  retention_period TEXT NOT NULL DEFAULT '7 years',
  retention_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_staff_activity_time
  ON public.enterprise_staff_activity_logs(application, module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_staff_activity_user
  ON public.enterprise_staff_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_staff_activity_request
  ON public.enterprise_staff_activity_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_staff_activity_metadata
  ON public.enterprise_staff_activity_logs USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.enterprise_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_email TEXT,
  role TEXT,
  company_id TEXT,
  company_name TEXT,
  branch_id TEXT,
  branch_name TEXT,
  application TEXT NOT NULL,
  module TEXT NOT NULL,
  screen TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  browser TEXT,
  operating_system TEXT,
  request_id TEXT,
  api_endpoint TEXT,
  http_method TEXT,
  http_status INTEGER,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  remarks TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  retention_period TEXT NOT NULL DEFAULT '7 years',
  retention_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_time
  ON public.enterprise_audit_logs(application, module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_entity
  ON public.enterprise_audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_request
  ON public.enterprise_audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_logs_metadata
  ON public.enterprise_audit_logs USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.enterprise_kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_key TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  application TEXT,
  dashboard_role TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  value_numeric NUMERIC NOT NULL DEFAULT 0,
  target_numeric NUMERIC,
  currency TEXT,
  dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_tables TEXT[] NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kpi_key, dashboard_role, period_start, period_end, dimensions)
);

CREATE INDEX IF NOT EXISTS idx_enterprise_kpi_snapshots_period
  ON public.enterprise_kpi_snapshots(dashboard_role, category, period_start DESC);

CREATE TABLE IF NOT EXISTS public.enterprise_saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('analytics', 'staff_activity', 'audit', 'reports')),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_saved_filters_user
  ON public.enterprise_saved_filters(user_id, scope, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.enterprise_report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'excel', 'pdf', 'print')),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_enterprise_report_exports_user
  ON public.enterprise_report_exports(requested_by, created_at DESC);

CREATE TABLE IF NOT EXISTS public.enterprise_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_domain TEXT NOT NULL UNIQUE,
  retention_period TEXT NOT NULL,
  archive_after TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.enterprise_retention_policies (data_domain, retention_period, archive_after)
VALUES
  ('analytics_events', '26 months', '13 months'),
  ('staff_activity_logs', '7 years', '24 months'),
  ('audit_logs', '7 years', '24 months'),
  ('security_audit_logs', '10 years', '36 months'),
  ('financial_audit_logs', '10 years', '36 months')
ON CONFLICT (data_domain) DO NOTHING;

CREATE OR REPLACE FUNCTION public.prevent_enterprise_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Enterprise analytics, staff activity, and audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_staff_activity_update ON public.enterprise_staff_activity_logs;
CREATE TRIGGER prevent_staff_activity_update
  BEFORE UPDATE OR DELETE ON public.enterprise_staff_activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_enterprise_log_mutation();

DROP TRIGGER IF EXISTS prevent_audit_log_update ON public.enterprise_audit_logs;
CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE OR DELETE ON public.enterprise_audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_enterprise_log_mutation();

ALTER TABLE public.enterprise_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_staff_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_retention_policies ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Originally: 202607190007_mgmt_profile_preferences.sql
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_name ON public.profiles(branch_name);

-- -----------------------------------------------------------------------------
-- 3. Originally: 202607190008_superadmin_command_center_ops.sql
-- -----------------------------------------------------------------------------
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
