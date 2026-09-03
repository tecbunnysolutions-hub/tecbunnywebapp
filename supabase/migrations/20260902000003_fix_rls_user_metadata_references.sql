-- Replace editable Auth user_metadata references with server-managed app_metadata.
-- app_metadata is not writable by end users and is therefore suitable for RLS.

DROP POLICY IF EXISTS "Sales and admin can read abandoned assessments" ON public.abandoned_assessments;

CREATE POLICY "Sales and admin can read abandoned assessments"
  ON public.abandoned_assessments
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'sales_manager', 'sales_executive', 'marketing_manager', 'marketing_executive'
    )
  );

DROP POLICY IF EXISTS "Sales and analytics teams can read funnel events" ON public.funnel_events;

CREATE POLICY "Sales and analytics teams can read funnel events"
  ON public.funnel_events
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'authenticated'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'sales_manager', 'sales_executive', 'marketing_manager', 'marketing_executive'
    )
  );