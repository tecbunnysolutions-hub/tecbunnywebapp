CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Phase 14: API Platform & Integrations
CREATE TABLE IF NOT EXISTS public.api_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  base_path text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  deprecated_at timestamptz NULL,
  sunset_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  contact_email text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE',
  allowed_ip_ranges text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.api_clients(id) ON DELETE CASCADE,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  secret_hint text NULL,
  permission_scopes text[] NOT NULL DEFAULT '{}',
  expires_at timestamptz NULL,
  last_used_at timestamptz NULL,
  total_requests integer NOT NULL DEFAULT 0,
  failed_requests integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.api_clients(id) ON DELETE CASCADE,
  per_minute integer NOT NULL,
  per_hour integer NOT NULL,
  per_day integer NOT NULL,
  burst_limit integer NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NULL REFERENCES public.api_clients(id) ON DELETE SET NULL,
  api_key_id uuid NULL REFERENCES public.api_keys(id) ON DELETE SET NULL,
  method text NOT NULL,
  endpoint text NOT NULL,
  status_code integer NOT NULL,
  response_time_ms numeric NOT NULL,
  request_size_bytes numeric NULL,
  response_size_bytes numeric NULL,
  correlation_id text NOT NULL,
  error_code text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.api_clients(id) ON DELETE CASCADE,
  callback_url text NOT NULL,
  secret text NOT NULL,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  events text[] NOT NULL DEFAULT '{}',
  max_retries integer NOT NULL DEFAULT 3,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.webhook_subscriptions(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  payload_hash text NOT NULL,
  http_status integer NULL,
  attempt_number integer NOT NULL,
  delivered_at timestamptz NULL,
  next_retry_at timestamptz NULL,
  status text NOT NULL DEFAULT 'PENDING',
  error_message text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type text NOT NULL,
  provider_name text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  key text NOT NULL,
  value_encrypted text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type text NOT NULL,
  trigger_mode text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  last_cursor text NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_job_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_job_id uuid NOT NULL REFERENCES public.sync_jobs(id) ON DELETE CASCADE,
  status text NOT NULL,
  records_processed integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  summary text NULL,
  executed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.integration_providers(id) ON DELETE RESTRICT,
  reference_number text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'CREATED',
  settlement_status text NOT NULL DEFAULT 'PENDING',
  external_transaction_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  status text NOT NULL,
  response_time_ms numeric NOT NULL,
  error_rate_percent numeric NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.developer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL,
  owner_name text NOT NULL,
  owner_email text NOT NULL,
  client_id uuid NOT NULL REFERENCES public.api_clients(id) ON DELETE CASCADE,
  oauth_redirect_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'PENDING_APPROVAL',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 15: QA, Performance, Deployment, Hypercare
CREATE TABLE IF NOT EXISTS public.releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  release_date timestamptz NULL,
  status text NOT NULL DEFAULT 'PLANNED',
  build_success_rate_percent numeric NOT NULL DEFAULT 0,
  failed_builds_count integer NOT NULL DEFAULT 0,
  created_by_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deployment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  environment text NOT NULL,
  status text NOT NULL DEFAULT 'QUEUED',
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  deployed_by_id uuid NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rollback_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.deployment_history(id) ON DELETE CASCADE,
  rollback_reason text NOT NULL,
  rolled_back_to_version text NOT NULL,
  initiated_by_id uuid NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  status text NOT NULL DEFAULT 'RUNNING',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_name text NOT NULL,
  test_type text NOT NULL,
  module_scope text NOT NULL,
  is_automated boolean NOT NULL DEFAULT true,
  is_required_for_release boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_suite_id uuid NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  release_id uuid NULL REFERENCES public.releases(id) ON DELETE SET NULL,
  status text NOT NULL,
  passed_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  blocked_count integer NOT NULL DEFAULT 0,
  pending_count integer NOT NULL DEFAULT 0,
  executed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_coverage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  line_coverage_percent numeric NOT NULL,
  branch_coverage_percent numeric NOT NULL,
  function_coverage_percent numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NULL REFERENCES public.releases(id) ON DELETE SET NULL,
  metric_name text NOT NULL,
  module_name text NOT NULL,
  value numeric NOT NULL,
  target_value numeric NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.load_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NULL REFERENCES public.releases(id) ON DELETE SET NULL,
  concurrent_users integer NOT NULL,
  throughput_rps numeric NOT NULL,
  avg_latency_ms numeric NOT NULL,
  p95_latency_ms numeric NOT NULL,
  cpu_usage_percent numeric NOT NULL,
  memory_usage_percent numeric NOT NULL,
  db_load_percent numeric NOT NULL,
  status text NOT NULL DEFAULT 'PASS',
  executed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monitoring_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'MEDIUM',
  event_name text NOT NULL,
  message text NOT NULL,
  correlation_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.application_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'INFO',
  module text NOT NULL,
  message text NOT NULL,
  correlation_id text NULL,
  context jsonb NULL,
  logged_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  owner_user_id uuid NULL,
  detected_at timestamptz NULL,
  resolved_at timestamptz NULL,
  post_incident_notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.release_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  summary text NOT NULL,
  fixed_bugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  known_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  breaking_changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  migration_notes text NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.go_live_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  checklist_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_by_id uuid NULL,
  approved_at timestamptz NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.environment_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL,
  key text NOT NULL,
  value_encrypted text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.migration_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id uuid NULL REFERENCES public.releases(id) ON DELETE SET NULL,
  migration_name text NOT NULL,
  applied_by_id uuid NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  status text NOT NULL DEFAULT 'RUNNING',
  rollback_script_reference text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hypercare_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NULL REFERENCES public.incident_reports(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  response_sla text NOT NULL,
  assigned_to_user_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at ON public.api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_subscription ON public.webhook_delivery_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_deployment_history_release ON public.deployment_history(release_id);
CREATE INDEX IF NOT EXISTS idx_test_results_release ON public.test_results(release_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_created_at ON public.monitoring_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_logs_logged_at ON public.application_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_release_notes_release ON public.release_notes(release_id);