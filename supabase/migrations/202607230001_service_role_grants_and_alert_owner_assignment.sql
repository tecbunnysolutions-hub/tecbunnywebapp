-- =============================================================================
-- CONSOLIDATED MIGRATION (2026-07-23): service-role table grants + alert
-- owner assignment. Merges 3 originally separate migration files (deleted
-- after this merge) into one, in their original chronological order. No SQL
-- logic was changed -- this is a pure concatenation for file-count reduction.
--   1. 202607230001_crm_customers_service_role_grant.sql
--   2. 202607230002_dashboard_service_role_grants.sql
--   3. 202607230003_alert_owner_assignment.sql
-- All statements below are already idempotent (GRANT, ALTER DEFAULT
-- PRIVILEGES, DROP POLICY IF EXISTS + CREATE POLICY, ADD COLUMN IF NOT
-- EXISTS, dynamic constraint lookup/replace), so safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Originally: 202607230001_crm_customers_service_role_grant.sql
-- -----------------------------------------------------------------------------
-- Fix: Superadmin command-center dashboard query against public.crm_customers
-- returns zero/partial rows because the table (added by the enterprise CRM
-- module 20260715000007_crm_customers.sql) never received explicit table-level
-- GRANTs, unlike the "legacy hot tables" block further down in the baseline
-- migration (products, orders, profiles, carts, blog_posts). The dashboard's
-- service-role client (packages/database/src/admin.ts -> getAdminClient) uses
-- the real `service_role` Postgres role, which bypasses RLS but still requires
-- standard GRANTs to SELECT from a table. Apply the same grant + defensive RLS
-- pattern already used for referral_codes/referral_claims (see baseline.sql).

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'crm_customers' AND table_type = 'BASE TABLE'
    ) THEN
        GRANT ALL ON public.crm_customers TO service_role;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_customers TO authenticated;
        GRANT SELECT ON public.crm_customers TO anon;
    END IF;
END $$;

-- Ensure RLS is on (idempotent; module 000007 already enables it for related
-- ledger tables, but crm_customers itself relies on table creation defaults).
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;

-- Defensive policies: the service role and platform superadmins must always
-- retain full access to crm_customers regardless of any end-user policies
-- defined elsewhere for this table.
DROP POLICY IF EXISTS "service_role_manage_crm_customers" ON public.crm_customers;
CREATE POLICY "service_role_manage_crm_customers" ON public.crm_customers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Superadmin full access on crm_customers" ON public.crm_customers;
CREATE POLICY "Superadmin full access on crm_customers" ON public.crm_customers
  FOR ALL USING (public.is_superadmin());

-- End-user self-service policy (customers can view/manage their own profile),
-- matching the get_my_customer_ids() helper defined alongside this table.
DROP POLICY IF EXISTS "Users manage own crm_customers profile" ON public.crm_customers;
CREATE POLICY "Users manage own crm_customers profile" ON public.crm_customers
  FOR SELECT USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 2. Originally: 202607230002_dashboard_service_role_grants.sql
-- -----------------------------------------------------------------------------
-- Fix: Superadmin command-center dashboard queries against mkt_campaigns,
-- wab_messages, prd_products, org_organizations, prd_categories, sys_users
-- (and, by the same root cause, every other table added by the enterprise
-- modules after baseline.sql's "legacy hot tables" GRANT block) return
-- zero/partial rows for the Superadmin service role dashboard query.
--
-- Root cause: baseline.sql's ONLY explicit table-level GRANT statement grants
-- service_role/authenticated/anon on just `products, orders, profiles, carts,
-- blog_posts` (see the "Table-level grants for legacy hot tables" comment).
-- Every table added by the newer enterprise modules (org_/sys_/prd_/inv_/
-- cms_/crm_/sls_/oms_/wab_/mkt_/sup_/fin_/hr_/ntf_/rpt_/pm_/sub_ prefixes)
-- never received an explicit GRANT, relying entirely on database-level
-- default privileges. Those defaults are not guaranteed to exist on this
-- self-hosted Supabase stack (docker-compose.yml) or may only apply to
-- objects created by a specific role. The dashboard's data layer
-- (packages/database/src/admin.ts -> getAdminClient) authenticates as the
-- real `service_role` Postgres role, which bypasses RLS entirely but still
-- requires standard GRANTs to SELECT/INSERT/UPDATE/DELETE on a table.
--
-- Fix: grant service_role full privileges on every base table currently in
-- the public schema (safe -- service_role is a trusted, server-only
-- credential never exposed to browsers/clients, so this does not widen any
-- anon/authenticated exposure), plus set default privileges so tables
-- created in the future automatically grant service_role access too,
-- preventing this exact class of bug from recurring per-table.

DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('GRANT ALL ON public.%I TO service_role;', tbl.table_name);
    END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure this holds for tables/sequences/functions created after this
-- migration runs too (objects created by whichever role executes this
-- statement -- normally the migration-running owner role).
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;

-- -----------------------------------------------------------------------------
-- 3. Originally: 202607230003_alert_owner_assignment.sql
-- -----------------------------------------------------------------------------
-- Adds owner assignment to the Superadmin command-center alert acknowledgement
-- lifecycle so high-severity notifications (e.g. "Platform reliability",
-- "Security") can be assigned to a named owner, not just acknowledged/resolved.

ALTER TABLE public.enterprise_alert_acknowledgements
  ADD COLUMN IF NOT EXISTS assigned_to TEXT,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Widen the status CHECK constraint to allow a pure "assigned" event (owner
-- assignment without acknowledging/resolving yet). The constraint name isn't
-- guaranteed across environments (inline CHECK vs. named), so look it up
-- dynamically via pg_constraint rather than hardcoding a name.
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT con.conname INTO v_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'enterprise_alert_acknowledgements'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%status%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.enterprise_alert_acknowledgements DROP CONSTRAINT %I', v_constraint_name);
  END IF;

  ALTER TABLE public.enterprise_alert_acknowledgements
    ADD CONSTRAINT enterprise_alert_acknowledgements_status_check
    CHECK (status IN ('acknowledged', 'resolved', 'dismissed', 'assigned'));
END $$;

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_assigned_to
  ON public.enterprise_alert_acknowledgements(assigned_to)
  WHERE assigned_to IS NOT NULL;
