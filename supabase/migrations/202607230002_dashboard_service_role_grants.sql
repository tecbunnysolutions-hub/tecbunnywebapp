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
-- the public schema (safe — service_role is a trusted, server-only
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
-- statement — normally the migration-running owner role).
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;
