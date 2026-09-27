-- Restrict database objects that are reachable with the public anon key or a
-- signed-in user's token. Every statement is idempotent and skips objects that
-- do not exist in a given installation.

-- 1. Server-only functions. Supabase grants EXECUTE on new public functions to
--    anon/authenticated by default, so a grant to service_role alone restricts
--    nothing. All application callers of these functions use the service role.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY (ARRAY[
        'award_commission_atomic',
        'increment_agent_points',
        'recalculate_lead_score',
        'recalculate_all_lead_scores',
        'calculate_advanced_lead_score',
        'log_lead_engagement',
        'create_lead_followup_tasks',
        'complete_followup_task',
        'snooze_followup_task',
        'get_pending_followup_tasks',
        'get_dashboard_revenue_metrics',
        'get_dashboard_lead_metrics',
        'get_dashboard_order_trend',
        'get_dashboard_lead_source_performance',
        'get_dashboard_lead_assignment_status',
        'get_hot_leads_priority_queue',
        'claim_waba_outbound_retries',
        'get_waba_outbound_metrics'
      ])
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.signature);
  END LOOP;
END $$;

-- SECURITY DEFINER functions must not resolve objects through a caller-controlled path.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'award_commission_atomic'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn.signature);
  END LOOP;
END $$;

-- 2. Tables created without row level security. They hold lead, message and
--    campaign data that only server code (service role) reads or writes.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'waba_outbound_events',
    'waba_outbound_retry_history',
    'waba_outbound_metrics',
    'lead_followup_tasks',
    'followup_communication_log',
    'followup_automation_rules',
    'lead_engagement_history',
    'lead_scoring_factors',
    'lead_conversion_patterns',
    'campaign_halt_audit',
    'service_quote_components'
  ]
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);
      EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', tbl);
    END IF;
  END LOOP;
END $$;

-- 3. Privileged profile columns. Users may edit their own profile through RLS,
--    but role, tenant, activation, second-factor and B2B pricing fields are
--    authorization inputs and may only be changed by the service role.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  protected_columns text[] := ARRAY[
    'role', 'company_id', 'branch_id', 'is_active', 'email',
    'two_factor_secret', 'two_factor_backup_codes', 'two_factor_backup_codes_used', 'two_factor_enabled',
    'customer_type', 'customer_category', 'b2b_category', 'gst_verified', 'gst_verification_date'
  ];
  col text;
  new_row jsonb := to_jsonb(NEW);
  old_row jsonb;
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF coalesce(lower(new_row->>'role'), 'customer') <> 'customer' THEN
      RAISE EXCEPTION 'profiles.role can only be assigned by the service role' USING ERRCODE = '42501';
    END IF;
    FOREACH col IN ARRAY protected_columns LOOP
      IF col NOT IN ('role', 'email', 'is_active') AND new_row ? col AND new_row->col <> 'null'::jsonb
        AND NOT (col = 'two_factor_enabled' AND new_row->col = 'false'::jsonb)
        AND NOT (col = 'gst_verified' AND new_row->col = 'false'::jsonb)
        AND NOT (col = 'customer_type' AND lower(new_row->>col) = 'b2c') THEN
        RAISE EXCEPTION 'profiles.% can only be set by the service role', col USING ERRCODE = '42501';
      END IF;
    END LOOP;
    RETURN NEW;
  END IF;

  old_row := to_jsonb(OLD);
  FOREACH col IN ARRAY protected_columns LOOP
    IF (new_row->col) IS DISTINCT FROM (old_row->col) THEN
      RAISE EXCEPTION 'profiles.% can only be changed by the service role', col USING ERRCODE = '42501';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS protect_profile_privileged_columns ON public.profiles;
    CREATE TRIGGER protect_profile_privileged_columns
      BEFORE INSERT OR UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();
  END IF;
END $$;
