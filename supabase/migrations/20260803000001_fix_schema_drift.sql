-- ============================================================================
-- 20260803000001_fix_schema_drift.sql
-- Fixes schema drift found by comparing live DB (392 public tables) against
-- code references (supabase .from('...') calls across apps/ and packages/).
--
--   PART 1: Creates 16 tables referenced in code but MISSING from the DB.
--   PART 2: Creates 3 views referenced in code but MISSING from the DB.
--   PART 3: (COMMENTED OUT — reversible archive of 279 unwired tables.
--            Review before enabling. Nothing is dropped.)
--
-- Everything is idempotent (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- ============================================================================
-- PART 1 — MISSING TABLES (code breaks at runtime without these)
-- ============================================================================

-- 1. addresses  (apps/api: user GDPR export/delete)
create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text,
  phone         text,
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  postal_code   text,
  country       text default 'IN',
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- 2. app_config  (packages/core/config-service.ts — single-row config, id = 1)
create table if not exists public.app_config (
  id                 integer primary key check (id = 1),
  company_name       text,
  registered_address text,
  support_email      text,
  support_phone      text,
  gstin              text,
  cin                text,
  pan                text,
  tan                text,
  logo_url           text,
  font_regular_url   text,
  font_bold_url      text,
  updated_at         timestamptz not null default now()
);
-- Seed singleton row only if the table matches this shape (an app_config table
-- with a uuid id may already exist in some environments — leave it untouched).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'app_config'
      and column_name = 'id' and data_type = 'integer'
  ) then
    insert into public.app_config (id) values (1) on conflict (id) do nothing;
  end if;
end $$;

-- 3. app_settings  (packages/core/config-db.ts — key/value store)
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4. area_notification_deliveries  (packages/core/area-notifications.ts)
create table if not exists public.area_notification_deliveries (
  id                   uuid primary key default gen_random_uuid(),
  source_type          text not null,
  source_id            text not null,
  notification_kind    text not null,
  area_id              uuid,
  manager_id           uuid,
  pincode              text,
  routing_status       text,
  recipients           text[] not null default '{}',
  provider_message_ids text[] not null default '{}',
  error_message        text,
  created_at           timestamptz not null default now()
);

-- 5. areas  (apps/superadmin: superadmin/areas route)
create table if not exists public.areas (
  id                 uuid primary key default gen_random_uuid(),
  code               text unique,
  name               text not null,
  is_active          boolean not null default true,
  services_enabled   boolean not null default true,
  sales_manager_id   uuid,
  service_manager_id uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 6. customer_categories  (packages/core/config-db.ts)
create table if not exists public.customer_categories (
  id            uuid primary key default gen_random_uuid(),
  category_name text not null,
  description   text,
  created_at    timestamptz not null default now()
);

-- 7. customer_interactions  (apps/api: customer notifications + webhooks)
create table if not exists public.customer_interactions (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid,
  interaction_type text not null,
  direction        text not null default 'system',
  interaction_data jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

-- 8. customer_offers  (apps/api discounts/calculate + admin-ui dialog)
create table if not exists public.customer_offers (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  discount_percentage numeric(5,2) not null default 0,
  target_categories   text[] not null default '{}',
  valid_from          timestamptz,
  valid_to            timestamptz,
  is_active           boolean not null default true,
  minimum_order_value numeric(12,2),
  max_discount_amount numeric(12,2),
  created_at          timestamptz not null default now()
);

-- 9. order_cancellations  (apps/api webhooks/orders/cancelled)
create table if not exists public.order_cancellations (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null unique,
  customer_phone      text,
  cancellation_reason text,
  cancelled_by        text,
  refund_amount       numeric(12,2),
  refund_status       text,
  source              text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- 10. otp_codes  (packages/core/otp-manager.ts + health check)
create table if not exists public.otp_codes (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  otp        text,
  otp_code   text,          -- legacy column name kept for fallback path
  type       text not null, -- 'signup' | 'recovery'
  used       boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 11. policies  (packages/core/settings.ts — CMS-style legal/policy pages)
create table if not exists public.policies (
  key          text primary key,
  title        text,
  content      jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  updated_at   timestamptz not null default now()
);

-- 12. roles_permissions  (packages/core/config-db.ts)
create table if not exists public.roles_permissions (
  role        text primary key,
  permissions jsonb not null default '[]'::jsonb
);

-- 13. system_settings  (apps/api customer-promotions — key/value store)
create table if not exists public.system_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 14. user_communication_preferences (apps/api — NOTE: camelCase columns are
--     what the code actually reads/writes, so they must be quoted identifiers)
create table if not exists public.user_communication_preferences (
  "userId"                uuid primary key references auth.users(id) on delete cascade,
  "preferredOTPChannel"   text not null default 'email',
  "emailNotifications"    boolean not null default true,
  "whatsappNotifications" boolean not null default true,
  "orderUpdates"          boolean not null default true,
  "serviceUpdates"        boolean not null default true,
  "securityAlerts"        boolean not null default true,
  phone                   text,
  email                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- 15. user_milestones  (apps/api blueprints/attribution/conversion)
create table if not exists public.user_milestones (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  type       text not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 16. whatsapp_messages  (apps/api customer/notifications)
create table if not exists public.whatsapp_messages (
  id             uuid primary key default gen_random_uuid(),
  phone_number   text not null,
  message_type   text,
  direction      text not null default 'outbound',
  content        text,
  message_status text not null default 'sent',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES — guarded: only created when the relation is a real TABLE (some of
-- these names may already exist in the DB as views or differently-shaped
-- tables that IF NOT EXISTS silently skipped) and the columns exist.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('addresses',                    'idx_addresses_user_id',               'create index idx_addresses_user_id on public.addresses(user_id)',                                                                       array['user_id']),
      ('area_notification_deliveries', 'uq_area_notif_deliveries_source',     'create unique index uq_area_notif_deliveries_source on public.area_notification_deliveries(source_type, source_id, notification_kind)', array['source_type','source_id','notification_kind']),
      ('areas',                        'idx_areas_name',                      'create index idx_areas_name on public.areas(name)',                                                                                     array['name']),
      ('customer_interactions',        'idx_customer_interactions_customer',  'create index idx_customer_interactions_customer on public.customer_interactions(customer_id, created_at desc)',                        array['customer_id','created_at']),
      ('customer_interactions',        'idx_customer_interactions_type',      'create index idx_customer_interactions_type on public.customer_interactions(interaction_type)',                                        array['interaction_type']),
      ('customer_offers',              'idx_customer_offers_active',          'create index idx_customer_offers_active on public.customer_offers(is_active, valid_from, valid_to)',                                   array['is_active','valid_from','valid_to']),
      ('otp_codes',                    'idx_otp_codes_lookup',                'create index idx_otp_codes_lookup on public.otp_codes(email, type, used)',                                                             array['email','type','used']),
      ('otp_codes',                    'idx_otp_codes_expiry',                'create index idx_otp_codes_expiry on public.otp_codes(expires_at)',                                                                    array['expires_at']),
      ('user_milestones',              'idx_user_milestones_user',            'create index idx_user_milestones_user on public.user_milestones(user_id, created_at desc)',                                            array['user_id','created_at']),
      ('whatsapp_messages',            'idx_whatsapp_messages_phone',         'create index idx_whatsapp_messages_phone on public.whatsapp_messages(phone_number, created_at desc)',                                  array['phone_number','created_at'])
    ) as v(tbl, iname, ddl, cols)
  loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = r.tbl)
       and not exists (select 1 from pg_indexes
                       where schemaname = 'public' and indexname = r.iname)
       and not exists (select 1 from unnest(r.cols) col
                       where not exists (select 1 from information_schema.columns
                                         where table_schema = 'public' and table_name = r.tbl
                                           and column_name = col))
    then
      begin
        execute r.ddl;
      exception when others then
        raise notice 'skip index % on %: %', r.iname, r.tbl, sqlerrm;
      end;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RLS: enable on all new tables (skipped for any name that turns out to be a
-- view or is otherwise not a plain table).
-- service_role bypasses RLS; user-scoped tables get owner policies;
-- config tables get authenticated read.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'addresses','app_config','app_settings','area_notification_deliveries',
    'areas','customer_categories','customer_interactions','customer_offers',
    'order_cancellations','otp_codes','policies','roles_permissions',
    'system_settings','user_communication_preferences','user_milestones',
    'whatsapp_messages']
  loop
    -- pg_tables lists ONLY real tables (never views/matviews), so a name that
    -- exists as a view (e.g. app_config, whatsapp_messages) is skipped here.
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      begin
        execute format('alter table public.%I enable row level security', t);
      exception when others then
        raise notice 'skip RLS enable on %: %', t, sqlerrm;
      end;
    end if;
  end loop;
end $$;

do $$
declare
  r record;
begin
  -- (table, policy name, policy DDL, required columns) — created only when the
  -- relation is a real table, the policy is absent, and the columns exist.
  for r in
    select * from (values
      ('addresses', 'addresses_owner_all',
       'create policy addresses_owner_all on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
       array['user_id']),
      ('user_communication_preferences', 'ucp_owner_all',
       'create policy ucp_owner_all on public.user_communication_preferences for all using (auth.uid() = "userId") with check (auth.uid() = "userId")',
       array['userId']),
      ('user_milestones', 'user_milestones_owner_read',
       'create policy user_milestones_owner_read on public.user_milestones for select using (auth.uid() = user_id)',
       array['user_id']),
      ('policies', 'policies_public_read',
       'create policy policies_public_read on public.policies for select using (is_published = true)',
       array['is_published']),
      ('customer_offers', 'customer_offers_public_read',
       'create policy customer_offers_public_read on public.customer_offers for select using (is_active = true)',
       array['is_active']),
      ('areas', 'areas_auth_read',
       'create policy areas_auth_read on public.areas for select to authenticated using (true)',
       array[]::text[]),
      ('customer_categories', 'customer_categories_auth_read',
       'create policy customer_categories_auth_read on public.customer_categories for select to authenticated using (true)',
       array[]::text[])
    ) as v(tbl, pname, ddl, cols)
  loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = r.tbl)
       and not exists (select 1 from pg_policies
                       where schemaname = 'public' and tablename = r.tbl and policyname = r.pname)
       and not exists (select 1 from unnest(r.cols) col
                       where not exists (select 1 from information_schema.columns
                                         where table_schema = 'public' and table_name = r.tbl
                                           and column_name = col))
    then
      begin
        execute r.ddl;
      exception when others then
        raise notice 'skip policy % on %: %', r.pname, r.tbl, sqlerrm;
      end;
    end if;
  end loop;
  -- everything else (app_config, app_settings, system_settings, otp_codes,
  -- roles_permissions, order_cancellations, customer_interactions,
  -- whatsapp_messages, area_notification_deliveries) is service-role only:
  -- RLS enabled with no policies = deny for anon/authenticated.
end $$;

-- ============================================================================
-- PART 2 — MISSING VIEWS
-- (guarded: skipped if the name is already taken by a table; pre-existing
--  views are dropped and recreated — views hold no data, so this is safe)
-- ============================================================================

do $$
begin
  -- auth_users_summary: admin-only summary of auth.users
  -- (used by packages/infra supabase-user.repository via service-role client)
  if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public' and c.relname = 'auth_users_summary'
                   and c.relkind in ('r','p')) then
    execute 'drop view if exists public.auth_users_summary';
    execute $v$
      create view public.auth_users_summary as
      select
        u.id,
        u.email,
        u.phone,
        u.created_at,
        u.last_sign_in_at,
        u.banned_until,
        u.email_confirmed_at
      from auth.users u
    $v$;
    execute 'revoke all on public.auth_users_summary from anon, authenticated';
    execute 'grant select on public.auth_users_summary to service_role';
  end if;

  -- product_analytics_view: id, title, view_count
  -- (products has no view_count column; popularity is the closest live metric)
  if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public' and c.relname = 'product_analytics_view'
                   and c.relkind in ('r','p')) then
    execute 'drop view if exists public.product_analytics_view';
    execute $v$
      create view public.product_analytics_view as
      select
        p.id,
        coalesce(p.title, p.name) as title,
        coalesce(p.popularity, 0) as view_count
      from public.products p
      where p.deleted_at is null
    $v$;
  end if;

  -- products_columns_view: runtime introspection of products columns
  if not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public' and c.relname = 'products_columns_view'
                   and c.relkind in ('r','p')) then
    execute 'drop view if exists public.products_columns_view';
    execute $v$
      create view public.products_columns_view as
      select c.column_name::text as column_name
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = 'products'
    $v$;
  end if;
end $$;

-- ============================================================================
-- PART 3 — UNWIRED / DUPLICATE TABLES (REVIEW BEFORE ENABLING — COMMENTED OUT)
-- ============================================================================
-- 279 public tables are never referenced by any .from() call in the codebase.
-- They fall into two groups:
--
--  A) Legacy duplicates of wired tables, e.g.:
--     carts+cart_items vs crm_carts+crm_cart_items   (carts IS wired, crm_carts is NOT)
--     orders/order_items vs oms_orders (both partially wired — keep both for now)
--     products vs prd_products (both wired), categories/brands vs prd_* (neither wired)
--     blog_posts (wired) vs cms_blogs (not), faqs+cms_faqs (both wired)
--     attendance vs hr_attendance, leave_requests vs hr_leave_requests (none wired)
--     warehouses vs inv_warehouses vs wms_warehouses (none wired)
--     roles/user_roles (wired) vs sys_roles/sys_user_roles (not)
--     audit_logs (wired) vs sys_audit_logs (not)
--
--  B) Pre-provisioned module schemas not yet wired: cms_*, crm_* (except
--     crm_customers), fin_*, hr_*, inv_*, mkt_seller_*, ntf_* (except
--     ntf_queue), oms_* (except oms_orders/oms_payments), pm_*, prd_* (except
--     prd_products), rpt_*, sub_*, sup_* (except sup_tickets), sys_* (except
--     sys_users), wab_*, wms_*.
--
-- RECOMMENDATION: do NOT drop group B (planned modules). Archive group A
-- legacy tables to a hidden schema instead of dropping — fully reversible
-- (move back with the same command) and removes them from the public API.
--
-- To restore any table: alter table zz_archive.<name> set schema public;
--
-- create schema if not exists zz_archive;
-- do $archive$
-- declare
--   t text;
--   tables text[] := array[
--     -- legacy duplicates whose replacement IS wired in code:
--     'cart_items',            -- replaced by carts flow (items unused)
--     'crm_carts','crm_cart_items','crm_addresses','crm_wishlists',
--     'crm_customer_group_mapping','crm_customer_groups','crm_documents',
--     'crm_loyalty_tiers','crm_notes','crm_preferences','crm_referrals',
--     'crm_reward_point_ledger','crm_reward_points','crm_saved_cards',
--     'crm_timeline','crm_wallet_transactions','crm_wallets',
--     'cms_blogs','cms_blog_categories','cms_blog_post_tags','cms_blog_tags',
--     'chat_messages','whatsapp_conversations',
--     'invoice_items','invoices',      -- oms_invoices/fin_invoices also exist
--     'email_templates','templates',
--     'sys_audit_logs','sys_roles','sys_role_permissions','sys_user_roles',
--     'sys_permissions','sys_auth_otp','sys_auth_sessions','sys_auth_api_keys',
--     'attendance','leave_requests',   -- hr_* module is the intended home
--     'suppliers','warehouses',        -- inv_*/wms_* modules are the intended home
--     'categories','brands',           -- product taxonomy lives on products/prd_*
--     'departments','branches',        -- org_* module is wired instead
--     'permissions','role_permissions' -- roles/user_roles are the wired pair
--   ];
-- begin
--   foreach t in array tables loop
--     if exists (select 1 from information_schema.tables
--                where table_schema = 'public' and table_name = t) then
--       execute format('alter table public.%I set schema zz_archive', t);
--     end if;
--   end loop;
-- end $archive$;

-- Helper: run this anytime to list still-unwired tables that have zero rows
-- (safest candidates for eventual removal):
-- select schemaname, relname, n_live_tup
-- from pg_stat_user_tables
-- where schemaname = 'public' and n_live_tup = 0
-- order by relname;
