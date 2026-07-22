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
