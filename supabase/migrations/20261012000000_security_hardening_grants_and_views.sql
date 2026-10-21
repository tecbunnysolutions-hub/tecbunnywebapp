-- Security hardening: function grants, search_path, and view invoker rights.
-- All statements are guarded so the migration is idempotent.

DO $$
DECLARE
  r record;
BEGIN
  -- (1) award_commission_atomic: service_role only, fixed search_path
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'award_commission_atomic'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
  END LOOP;

  -- (5) Dashboard RPCs: no anon/PUBLIC access
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'get_dashboard_revenue_metrics',
        'get_dashboard_lead_metrics',
        'get_dashboard_order_trend',
        'get_dashboard_lead_source_performance',
        'get_dashboard_lead_assignment_status',
        'get_hot_leads_priority_queue',
        'recalculate_lead_score')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', r.sig);
  END LOOP;
END $$;

-- (2)(3)(4) Views: security_invoker and revoked client access
DO $$
DECLARE
  v text;
  locked text[] := ARRAY['sys_users_prisma', 'affiliate_commission_reports', 'products_columns_view'];
  invoker_only text[] := ARRAY['product_analytics_view'];
BEGIN
  FOREACH v IN ARRAY (locked || invoker_only) LOOP
    IF to_regclass('public.' || v) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v);
    END IF;
  END LOOP;

  FOREACH v IN ARRAY locked LOOP
    IF to_regclass('public.' || v) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', v);
      EXECUTE format('GRANT SELECT ON public.%I TO service_role', v);
    END IF;
  END LOOP;
END $$;
