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