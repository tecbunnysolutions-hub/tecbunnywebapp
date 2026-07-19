-- Tecbunny Enterprise PostgreSQL Database Initializer
-- Generated for Public Website, Customer Portal, Management, Superadmin, WABA, Webmail, API, and Authentication.
-- Target: PostgreSQL 15+ / Supabase-compatible PostgreSQL.

BEGIN;

-- =========================================================
-- Phase 1: Core Tables, Extensions, Types, Helpers
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Supabase owns the auth schema, auth.users, auth.uid(), and auth.role().
-- This initializer references those managed objects but must not create or modify them.

DO $$ BEGIN
  CREATE TYPE record_status AS ENUM ('draft','active','inactive','archived','deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('Pending','Awaiting Payment','Payment Confirmed','Confirmed','Processing','Ready to Ship','Shipped','Out for Delivery','Delivered','Completed','Cancelled','Rejected','On Hold','Visit Scheduled','Visit Completed','Diagnosis Done','Quote Sent','Awaiting Customer Approval','Approved','Parts Ordered','Work In Progress','Quality Check','Ready for Pickup','Ready for Delivery','Delivered/Picked Up','Warranty/Support Active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','authorized','paid','failed','refunded','partially_refunded','cancelled','Payment Confirmation Pending','Payment Confirmed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cod','upi','payu','card','bank_transfer','cash','wallet','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('OPEN','IN_PROGRESS','WAITING_ON_CUSTOMER','RESOLVED','CLOSED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('LOW','NORMAL','MEDIUM','HIGH','URGENT','CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE message_direction AS ENUM ('INBOUND','OUTBOUND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE lead_domain AS ENUM ('TECHNICAL_SERVICE','PRODUCT_SALES','CUSTOM_SETUP','GENERAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('DRAFT','SCHEDULED','RUNNING','PAUSED','COMPLETED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('PERCENTAGE','FIXED','FREE_SHIPPING','BOGO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE inventory_movement_type AS ENUM ('purchase','sale','return','adjustment','transfer','reservation','release','damage');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(auth.uid(), nullif(current_setting('app.current_user_id', true), '')::uuid)
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = coalesce(NEW.updated_by, app_current_user_id());
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION set_updated_at() IS 'Maintains updated_at and updated_by audit fields before updates.';

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('superadmin','admin')
      AND p.deleted_at IS NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION current_company_id()
RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE v_company_id uuid;
BEGIN
  SELECT p.company_id INTO v_company_id FROM profiles p WHERE p.id = auth.uid() AND p.deleted_at IS NULL LIMIT 1;
  RETURN v_company_id;
END;
$$;

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  legal_name text NOT NULL,
  display_name text NOT NULL,
  gstin text,
  pan text,
  cin text,
  email citext,
  phone text,
  website text,
  registered_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  billing_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  currency_code char(3) NOT NULL DEFAULT 'INR',
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT companies_code_unique UNIQUE (code),
  CONSTRAINT companies_gstin_unique UNIQUE (gstin),
  CONSTRAINT companies_email_format CHECK (email IS NULL OR position('@' in email::text) > 1)
);
COMMENT ON TABLE companies IS 'Legal operating companies/tenants that own branches, customers, stock, orders, and settings.';

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  status record_status NOT NULL DEFAULT 'active',
  plan text,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT tenants_slug_unique UNIQUE (slug)
);
COMMENT ON TABLE tenants IS 'Application tenant records used by health checks and multi-company isolation.';

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  branch_type text NOT NULL DEFAULT 'store',
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  pincode text,
  phone text,
  email citext,
  is_head_office boolean NOT NULL DEFAULT false,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT branches_company_code_unique UNIQUE (company_id, code)
);
COMMENT ON TABLE branches IS 'Company branch, store, warehouse office, or service location.';

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  parent_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT departments_company_code_unique UNIQUE (company_id, code)
);
COMMENT ON TABLE departments IS 'Organizational departments used for staff, permissions, tickets, and routing.';

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT roles_company_name_unique UNIQUE (company_id, name)
);
COMMENT ON TABLE roles IS 'RBAC role catalog shared by API, management, superadmin, and portals.';

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  resource text,
  description text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT permissions_module_action_unique UNIQUE (module, action, resource)
);
COMMENT ON TABLE permissions IS 'Atomic permissions for least-privilege application authorization.';

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id)
);
COMMENT ON TABLE role_permissions IS 'Many-to-many grant table connecting roles and permissions.';

-- Compatibility with older code that queried roles_permissions.
CREATE OR REPLACE VIEW roles_permissions AS
SELECT id, role_id, permission_id, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at
FROM role_permissions;
COMMENT ON VIEW roles_permissions IS 'Compatibility view for legacy role permission references.';

-- =========================================================
-- Phase 2: Authentication, Users, Staff, Customers, Sessions
-- =========================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  email citext,
  name text,
  full_name text,
  mobile text,
  phone text,
  phone_number text,
  role text NOT NULL DEFAULT 'customer',
  status record_status NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT true,
  first_login_whatsapp_sent boolean NOT NULL DEFAULT false,
  first_login_notified_at timestamptz,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  pincode text,
  state text,
  location jsonb,
  gstin text,
  managed_pincodes text[] NOT NULL DEFAULT '{}',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT profiles_role_not_blank CHECK (length(trim(role)) > 0)
);
COMMENT ON TABLE profiles IS 'Application profile extension for auth.users; supports customers, staff, managers, admins, and superadmins.';

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  scope_branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT user_roles_unique UNIQUE (user_id, role_id, scope_company_id, scope_branch_id)
);
COMMENT ON TABLE user_roles IS 'User-to-role assignments with optional company and branch scope.';

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  employee_code text NOT NULL,
  designation text,
  employment_type text NOT NULL DEFAULT 'full_time',
  joining_date date,
  exit_date date,
  manager_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT staff_employee_code_unique UNIQUE (company_id, employee_code),
  CONSTRAINT staff_exit_after_join CHECK (exit_date IS NULL OR joining_date IS NULL OR exit_date >= joining_date)
);
COMMENT ON TABLE staff IS 'Internal employee and contractor records linked to user profiles.';

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_code text,
  name text NOT NULL,
  email citext,
  mobile text,
  phone text,
  type text NOT NULL DEFAULT 'retail',
  gstin text,
  default_address_id uuid,
  lifetime_value numeric(14,2) NOT NULL DEFAULT 0 CHECK (lifetime_value >= 0),
  status record_status NOT NULL DEFAULT 'active',
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT customers_company_code_unique UNIQUE (company_id, customer_code),
  CONSTRAINT customers_contact_present CHECK (email IS NOT NULL OR mobile IS NOT NULL OR phone IS NOT NULL)
);
COMMENT ON TABLE customers IS 'Customer master records for portal, ecommerce, CRM, service, and invoicing.';

CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'default',
  contact_name text,
  phone text,
  line1 text NOT NULL,
  line2 text,
  city text,
  state text,
  state_code text,
  country text NOT NULL DEFAULT 'IN',
  pincode text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_default boolean NOT NULL DEFAULT false,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE customer_addresses IS 'Normalized customer shipping, billing, pickup, and service addresses.';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_default_address_fk') THEN
    ALTER TABLE customers ADD CONSTRAINT customers_default_address_fk FOREIGN KEY (default_address_id) REFERENCES customer_addresses(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE api_keys IS 'Hashed API keys for integrations and backend service access.';

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  device_fingerprint text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE user_sessions IS 'Application session registry for device, security, and revocation tracking.';

CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  phone text,
  email citext,
  otp_hash text NOT NULL,
  purpose text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE otp_verifications IS 'OTP challenge records for signup, login, and recovery flows.';

-- =========================================================
-- Phase 3: Company Structure, Sales Agents, Areas
-- =========================================================

CREATE TABLE IF NOT EXISTS area_pincodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  pincode text NOT NULL,
  city text,
  state text,
  is_serviceable boolean NOT NULL DEFAULT true,
  service_types text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT area_pincodes_unique UNIQUE (company_id, pincode)
);
COMMENT ON TABLE area_pincodes IS 'Serviceable sales/service pincodes and branch routing metadata.';

CREATE TABLE IF NOT EXISTS user_area_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  area_pincode_id uuid NOT NULL REFERENCES area_pincodes(id) ON DELETE CASCADE,
  assignment_type text NOT NULL DEFAULT 'primary',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT user_area_assignments_unique UNIQUE (user_id, area_pincode_id, assignment_type)
);
COMMENT ON TABLE user_area_assignments IS 'Maps staff and managers to sales/service areas.';

CREATE TABLE IF NOT EXISTS sales_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  agent_code text,
  referral_code text UNIQUE,
  name text,
  email citext,
  mobile text,
  status text NOT NULL DEFAULT 'pending',
  points_balance integer NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  approved_at timestamptz,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  rejected_at timestamptz,
  rejection_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT sales_agents_status_check CHECK (status IN ('pending','approved','rejected','suspended','inactive'))
);
COMMENT ON TABLE sales_agents IS 'External and internal sales agent onboarding, status, referral code, and points ledger balance.';

CREATE TABLE IF NOT EXISTS agent_commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  product_category_id uuid,
  commission_type discount_type NOT NULL DEFAULT 'PERCENTAGE',
  commission_value numeric(12,2) NOT NULL CHECK (commission_value >= 0),
  min_order_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE agent_commission_rules IS 'Configurable sales agent commission rules.';

-- =========================================================
-- Phase 4: Products, Catalog, CMS Product Surfaces
-- =========================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT categories_company_slug_unique UNIQUE (company_id, slug)
);
COMMENT ON TABLE categories IS 'Hierarchical product and service categories.';

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  logo_url text,
  description text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT brands_company_slug_unique UNIQUE (company_id, slug)
);
COMMENT ON TABLE brands IS 'Product brand master data.';

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  handle text,
  slug text,
  permalink text,
  sku text,
  title text,
  name text NOT NULL,
  description text,
  body_html text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  vendor text,
  brand text,
  brand_logo text,
  product_type text,
  category text,
  collection text,
  model_number text,
  product_url text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  image text,
  image_url text,
  image_urls text[] NOT NULL DEFAULT '{}',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  meta_title text,
  seo_description text,
  meta_description text,
  hsn_code text,
  hsncode text,
  hsn text,
  hsn_sac text,
  sac_code text,
  is_service boolean NOT NULL DEFAULT false,
  gst_rate numeric(5,2) NOT NULL DEFAULT 18 CHECK (gst_rate >= 0 AND gst_rate <= 100),
  gst_percentage numeric(5,2),
  tax_ai_confidence numeric(5,4),
  tax_ai_justification text,
  tax_ai_model text,
  tax_ai_classified_at timestamptz,
  tax_ai_requested_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tax_ai_reviewed boolean NOT NULL DEFAULT false,
  tax_ai_reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tax_ai_reviewed_at timestamptz,
  mrp numeric(14,2),
  maximum_retail_price numeric(14,2),
  list_price numeric(14,2),
  price numeric(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  selling_price numeric(14,2),
  unit_price numeric(14,2),
  offer_price numeric(14,2),
  compare_at_price numeric(14,2),
  final_price numeric(14,2),
  dealer_price numeric(14,2),
  discount_percentage numeric(6,2) DEFAULT 0 CHECK (discount_percentage IS NULL OR discount_percentage >= 0),
  discount_source text,
  has_active_discount boolean NOT NULL DEFAULT false,
  applied_offer_title text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  stock_status text NOT NULL DEFAULT 'in_stock',
  min_stock_level integer NOT NULL DEFAULT 0 CHECK (min_stock_level >= 0),
  max_stock_level integer,
  rating numeric(3,2) DEFAULT 0 CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  "reviewCount" integer NOT NULL DEFAULT 0 CHECK ("reviewCount" >= 0),
  popularity integer NOT NULL DEFAULT 0,
  prioritized boolean NOT NULL DEFAULT false,
  prioritized_at timestamptz,
  tags text[] NOT NULL DEFAULT '{}',
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  is_deleted boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(brand,'') || ' ' || coalesce(category,''))) STORED,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT products_company_sku_unique UNIQUE (company_id, sku),
  CONSTRAINT products_company_slug_unique UNIQUE (company_id, slug)
);
COMMENT ON TABLE products IS 'Enterprise catalog product/service master with compatibility columns used by public and management apps.';

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  name text NOT NULL,
  option_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  price numeric(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  mrp numeric(14,2),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  barcode text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT product_variants_sku_unique UNIQUE (sku)
);
COMMENT ON TABLE product_variants IS 'Sellable product variant SKUs with option values and stock.';

CREATE TABLE IF NOT EXISTS product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  values text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT product_options_unique UNIQUE (product_id, name)
);
COMMENT ON TABLE product_options IS 'Variant option definitions such as color, storage, size, or plan.';

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE product_images IS 'Normalized product and variant media gallery.';

CREATE TABLE IF NOT EXISTS product_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  price_list text NOT NULL DEFAULT 'default',
  mrp numeric(14,2),
  price numeric(14,2) NOT NULL CHECK (price >= 0),
  offer_price numeric(14,2),
  starts_at timestamptz,
  ends_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT product_pricing_unique UNIQUE (product_id, variant_id, price_list, starts_at)
);
COMMENT ON TABLE product_pricing IS 'Time-bound product price lists for retail, dealer, quote, and offer pricing.';

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text,
  is_verified boolean NOT NULL DEFAULT false,
  status record_status NOT NULL DEFAULT 'draft',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE product_reviews IS 'Customer product ratings and reviews.';

CREATE TABLE IF NOT EXISTS published_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  blueprint jsonb NOT NULL DEFAULT '{}'::jsonb,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT published_blueprints_slug_unique UNIQUE (company_id, slug)
);
COMMENT ON TABLE published_blueprints IS 'Public custom setup or project blueprint pages.';

CREATE OR REPLACE VIEW products_columns_view AS
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products';
COMMENT ON VIEW products_columns_view IS 'Compatibility view used by API product routes to discover catalog columns.';

CREATE OR REPLACE VIEW product_analytics_view AS
SELECT p.id, p.name, p.category, p.brand, p.price, p.stock_quantity, p.rating, p.review_count, p.created_at, p.updated_at
FROM products p
WHERE p.deleted_at IS NULL AND p.is_deleted = false;
COMMENT ON VIEW product_analytics_view IS 'Read-optimized product analytics projection.';

-- =========================================================
-- Phase 5: Warehouses, Suppliers, Inventory, Purchases
-- =========================================================

CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  type text NOT NULL DEFAULT 'warehouse',
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT warehouses_company_code_unique UNIQUE (company_id, code)
);
COMMENT ON TABLE warehouses IS 'Physical and virtual stock locations.';

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  supplier_code text,
  name text NOT NULL,
  email citext,
  phone text,
  gstin text,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_terms text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT suppliers_company_code_unique UNIQUE (company_id, supplier_code)
);
COMMENT ON TABLE suppliers IS 'Supplier/vendor master data for purchase and warranty traceability.';

CREATE TABLE IF NOT EXISTS product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  warehouse_id uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_on_hand integer NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  reorder_level integer NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT product_inventory_unique UNIQUE (product_id, variant_id, warehouse_id),
  CONSTRAINT product_inventory_reserved_lte_on_hand CHECK (quantity_reserved <= quantity_on_hand)
);
COMMENT ON TABLE product_inventory IS 'Aggregate stock balance by product, variant, and warehouse.';

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  serial_number text,
  imei text,
  batch_number text,
  status text NOT NULL DEFAULT 'available',
  cost_price numeric(14,2),
  warranty_starts_at date,
  warranty_ends_at date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT inventory_items_serial_unique UNIQUE (serial_number),
  CONSTRAINT inventory_items_status_check CHECK (status IN ('available','reserved','sold','installed','returned','damaged','lost'))
);
COMMENT ON TABLE inventory_items IS 'Serialized inventory units for warranty, installation, and service tracking.';

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  serial_number text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  status text NOT NULL DEFAULT 'available',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE inventory IS 'Compatibility inventory table used by management serial number workflows.';

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  purchase_number text NOT NULL,
  invoice_number text,
  purchase_date date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'draft',
  subtotal numeric(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total numeric(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT purchases_number_unique UNIQUE (company_id, purchase_number)
);
COMMENT ON TABLE purchases IS 'Purchase order and supplier invoice headers.';

CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_cost numeric(14,2) NOT NULL CHECK (unit_cost >= 0),
  gst_rate numeric(5,2) NOT NULL DEFAULT 18 CHECK (gst_rate >= 0),
  total numeric(14,2) NOT NULL CHECK (total >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE purchase_items IS 'Purchase line items for products and variants.';

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  movement_type inventory_movement_type NOT NULL,
  quantity integer NOT NULL,
  reference_type text,
  reference_id uuid,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT stock_movements_quantity_nonzero CHECK (quantity <> 0)
);
COMMENT ON TABLE stock_movements IS 'Immutable stock ledger entries for all inventory changes.';

-- =========================================================
-- Phase 6: Orders, Quotes, Cart, Taxes, Discounts
-- =========================================================

CREATE TABLE IF NOT EXISTS gst_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  rate numeric(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  description text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE gst_rates IS 'GST rate catalog for Indian tax calculation.';

CREATE TABLE IF NOT EXISTS hsn_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  gst_rate_id uuid REFERENCES gst_rates(id) ON DELETE SET NULL,
  is_service boolean NOT NULL DEFAULT false,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE hsn_codes IS 'HSN/SAC code catalog mapped to GST rates.';

CREATE TABLE IF NOT EXISTS taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  tax_type text NOT NULL DEFAULT 'GST',
  rate numeric(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  jurisdiction text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE taxes IS 'Tax rules used by quotations, orders, invoices, and reports.';

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  currency_code char(3) NOT NULL DEFAULT 'INR',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT carts_status_check CHECK (status IN ('active','converted','abandoned','expired'))
);
COMMENT ON TABLE carts IS 'Shopping cart headers for logged-in and guest checkout flows.';

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(14,2) NOT NULL CHECK (unit_price >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT cart_items_unique UNIQUE (cart_id, product_id, variant_id)
);
COMMENT ON TABLE cart_items IS 'Shopping cart product lines.';

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  customer_record_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  order_number text UNIQUE,
  quote_id uuid,
  customer_name text,
  customer_email citext,
  customer_phone text NOT NULL,
  delivery_address text,
  delivery_pincode text,
  pickup_store text,
  type text NOT NULL DEFAULT 'Delivery',
  order_type text,
  category text,
  status text NOT NULL DEFAULT 'Pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  subtotal numeric(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  gst_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  cgst_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (cgst_amount >= 0),
  sgst_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (sgst_amount >= 0),
  igst_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (igst_amount >= 0),
  discount_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  shipping_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  total numeric(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  total_amount numeric(14,2) GENERATED ALWAYS AS (total) STORED,
  items jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  cancellation_reason text,
  delivered_at timestamptz,
  agent_id uuid REFERENCES sales_agents(id) ON DELETE SET NULL,
  assigned_sales_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_service_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  area_id uuid REFERENCES area_pincodes(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(order_number,'') || ' ' || coalesce(customer_name,'') || ' ' || coalesce(customer_phone,'') || ' ' || coalesce(customer_email::text,''))) STORED,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE orders IS 'Order headers for ecommerce, walk-in, agent, service, repair, and installation workflows.';

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text,
  sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  unit_price numeric(14,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_price numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  discount_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  gst_rate numeric(5,2) NOT NULL DEFAULT 18 CHECK (gst_rate >= 0),
  hsn_code text,
  sac_code text,
  taxable_base numeric(14,2) NOT NULL DEFAULT 0 CHECK (taxable_base >= 0),
  gst_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  cgst numeric(14,2) NOT NULL DEFAULT 0 CHECK (cgst >= 0),
  sgst numeric(14,2) NOT NULL DEFAULT 0 CHECK (sgst >= 0),
  igst numeric(14,2) NOT NULL DEFAULT 0 CHECK (igst >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE order_items IS 'Normalized order line items for fulfillment, inventory, tax, and analytics.';

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  quote_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  subtotal numeric(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total numeric(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  valid_until date,
  advance_payment_amount numeric(14,2),
  accepted_at timestamptz,
  rejected_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE quotes IS 'Customer quotations and counter-offer records.';

CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  description text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(14,2) NOT NULL CHECK (unit_price >= 0),
  total numeric(14,2) NOT NULL CHECK (total >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE quote_items IS 'Quotation line items.';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_quote_fk') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_quote_fk FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  code text NOT NULL,
  type discount_type NOT NULL DEFAULT 'PERCENTAGE',
  discount numeric(14,2) NOT NULL CHECK (discount >= 0),
  discount_value numeric(14,2),
  min_order_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit >= 0),
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT coupons_company_code_unique UNIQUE (company_id, code)
);
COMMENT ON TABLE coupons IS 'Coupon codes and usage limits for checkout discounts.';

CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type discount_type NOT NULL DEFAULT 'PERCENTAGE',
  value numeric(14,2) NOT NULL CHECK (value >= 0),
  target_type text NOT NULL DEFAULT 'order',
  target_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE discounts IS 'Discount rules applied to orders, products, customers, and promotions.';

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_id uuid REFERENCES discounts(id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE offers IS 'Marketing and checkout offers shown across public and admin apps.';

CREATE TABLE IF NOT EXISTS offer_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE offer_usage IS 'Offer and coupon redemption ledger.';

CREATE TABLE IF NOT EXISTS auto_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  offer_id uuid REFERENCES offers(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE auto_offers IS 'Automated offer rules triggered by behavior, cart, customer, or order context.';

CREATE TABLE IF NOT EXISTS customer_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  discount_id uuid REFERENCES discounts(id) ON DELETE CASCADE,
  starts_at timestamptz,
  ends_at timestamptz,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT customer_discounts_unique UNIQUE (customer_id, discount_id)
);
COMMENT ON TABLE customer_discounts IS 'Customer-specific discount assignments.';

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT wishlists_unique UNIQUE (user_id, customer_id, product_id)
);
COMMENT ON TABLE wishlists IS 'Customer wishlist product saves.';

-- =========================================================
-- Phase 7: Payments, Invoices, Recovery
-- =========================================================

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  payment_number text UNIQUE,
  provider text,
  method text,
  status text NOT NULL DEFAULT 'pending',
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  currency_code char(3) NOT NULL DEFAULT 'INR',
  provider_reference text,
  paid_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE payments IS 'Payment header records across PayU, UPI, COD, cash, and manual methods.';

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  provider text,
  provider_transaction_id text,
  transaction_type text NOT NULL DEFAULT 'payment',
  status text NOT NULL DEFAULT 'pending',
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT payment_transactions_provider_unique UNIQUE (provider, provider_transaction_id)
);
COMMENT ON TABLE payment_transactions IS 'Gateway transaction attempts, callbacks, and refunds.';

CREATE TABLE IF NOT EXISTS advance_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending',
  payment_link text,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE advance_payment_requests IS 'Advance payment links for quotes and service orders.';

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  invoice_date date NOT NULL DEFAULT current_date,
  due_date date,
  status text NOT NULL DEFAULT 'draft',
  subtotal numeric(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total numeric(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  pdf_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE invoices IS 'Tax invoice headers for customer orders and services.';

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(14,2) NOT NULL CHECK (unit_price >= 0),
  tax_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total numeric(14,2) NOT NULL CHECK (total >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE invoice_items IS 'Invoice line items.';

CREATE TABLE IF NOT EXISTS payment_recovery_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  next_attempt_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE payment_recovery_queue IS 'Queue for failed payment recovery and abandoned payment follow-up.';

-- =========================================================
-- Phase 8: Service, Warranty, AMC, Logistics
-- =========================================================

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text,
  category text,
  description text,
  base_price numeric(14,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE services IS 'Service catalog for repair, setup, installation, and AMC offerings.';

CREATE TABLE IF NOT EXISTS service_engineers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  specialization text[] NOT NULL DEFAULT '{}',
  skill_level text,
  availability_status text NOT NULL DEFAULT 'available',
  rating numeric(3,2) DEFAULT 0 CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE service_engineers IS 'Engineer roster and skill metadata for ticket assignment.';

CREATE TABLE IF NOT EXISTS service_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'OPEN',
  priority text NOT NULL DEFAULT 'NORMAL',
  department text NOT NULL DEFAULT 'SUPPORT',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  engineer_id uuid REFERENCES service_engineers(id) ON DELETE SET NULL,
  sender_number text,
  sla_breach_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE service_tickets IS 'Support/service tickets from WABA, portal, management, and order workflows.';

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES service_tickets(id) ON DELETE SET NULL,
  requested_for timestamptz,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE service_requests IS 'Customer service request intake records before or alongside ticket creation.';

CREATE TABLE IF NOT EXISTS installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  engineer_id uuid REFERENCES service_engineers(id) ON DELETE SET NULL,
  installed_at timestamptz,
  address jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'scheduled',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE installations IS 'Product installation lifecycle and engineer assignment.';

CREATE TABLE IF NOT EXISTS warranties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  warranty_number text UNIQUE,
  starts_at date NOT NULL DEFAULT current_date,
  ends_at date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  terms text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT warranties_ends_after_starts CHECK (ends_at >= starts_at)
);
COMMENT ON TABLE warranties IS 'Product warranty registrations and validity windows.';

CREATE TABLE IF NOT EXISTS amc_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  contract_number text NOT NULL UNIQUE,
  starts_at date NOT NULL,
  ends_at date NOT NULL,
  amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'active',
  coverage jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT amc_ends_after_starts CHECK (ends_at >= starts_at)
);
COMMENT ON TABLE amc_contracts IS 'Annual maintenance contracts for customer equipment and services.';

CREATE TABLE IF NOT EXISTS dispatch_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  carrier text,
  tracking_number text,
  status text NOT NULL DEFAULT 'pending',
  dispatched_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE dispatch_records IS 'Shipping and delivery records for orders.';

CREATE TABLE IF NOT EXISTS free_installation_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity > 0),
  booked_count integer NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT free_installation_slots_window CHECK (slot_end > slot_start),
  CONSTRAINT free_installation_slots_capacity CHECK (booked_count <= capacity)
);
COMMENT ON TABLE free_installation_slots IS 'Capacity-managed promotional installation slots.';

-- =========================================================
-- Phase 9: Marketing, CRM, Notifications, Content
-- =========================================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  sender_number text,
  domain lead_domain NOT NULL DEFAULT 'GENERAL',
  sub_category text,
  source text,
  pincode text,
  address text,
  status text NOT NULL DEFAULT 'NEW',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  score integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(sender_number,'') || ' ' || coalesce(sub_category,'') || ' ' || coalesce(address,''))) STORED,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE leads IS 'Unified CRM lead intake table.';

CREATE OR REPLACE VIEW sls_leads AS SELECT * FROM leads;
COMMENT ON VIEW sls_leads IS 'Compatibility view for legacy sales lead routes.';

CREATE TABLE IF NOT EXISTS sls_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  notes text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE sls_activities IS 'Sales lead activity timeline.';

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'NORMAL',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE tasks IS 'Staff and CRM task management.';

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  location text,
  related_type text,
  related_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT calendar_events_window CHECK (ends_at >= starts_at)
);
COMMENT ON TABLE calendar_events IS 'Calendar events for staff, service, sales, and customer scheduling.';

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'in_app',
  title text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'queued',
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE notifications IS 'Unified notification records for in-app, email, SMS, and WhatsApp delivery.';

CREATE TABLE IF NOT EXISTS ntf_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  channel text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE ntf_queue IS 'Notification delivery queue.';

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  channel text NOT NULL,
  topic text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT notification_preferences_unique UNIQUE (user_id, customer_id, channel, topic)
);
COMMENT ON TABLE notification_preferences IS 'Per-user and per-customer notification opt-in settings.';

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  campaign_type text NOT NULL DEFAULT 'broadcast',
  status campaign_status NOT NULL DEFAULT 'DRAFT',
  audience jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE marketing_campaigns IS 'Marketing campaign headers for email, WABA, SMS, and offer workflows.';

CREATE TABLE IF NOT EXISTS broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'whatsapp',
  recipient text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE broadcast_messages IS 'Individual broadcast delivery records.';

CREATE TABLE IF NOT EXISTS marketing_broadcast_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_message_id uuid REFERENCES broadcast_messages(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE marketing_broadcast_logs IS 'Broadcast message lifecycle events.';

CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  page_key text NOT NULL,
  slug text,
  title text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status record_status NOT NULL DEFAULT 'draft',
  is_active boolean NOT NULL DEFAULT false,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT cms_pages_key_unique UNIQUE (company_id, page_key)
);
COMMENT ON TABLE cms_pages IS 'CMS page records for public website content.';

CREATE TABLE IF NOT EXISTS page_content (
  key text PRIMARY KEY,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  page_key text UNIQUE,
  title text,
  content jsonb,
  data jsonb,
  meta_description text,
  meta_keywords text,
  status text NOT NULL DEFAULT 'draft',
  is_active boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE page_content IS 'Compatibility CMS content table used by public and API routes.';

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text,
  body text,
  cover_image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  status record_status NOT NULL DEFAULT 'draft',
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body,''))) STORED,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT blog_posts_slug_unique UNIQUE (company_id, slug)
);
COMMENT ON TABLE blog_posts IS 'Public blog content with full-text search support.';

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE faqs IS 'FAQ content managed by admin and shown publicly.';
CREATE OR REPLACE VIEW cms_faqs AS SELECT * FROM faqs;
COMMENT ON VIEW cms_faqs IS 'Compatibility view for public FAQ routes.';

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  name text,
  email citext,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE contact_messages IS 'Public contact form, promotion claim, and inquiry intake messages.';

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  name text,
  email citext,
  phone text,
  subject text,
  message text,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE inquiries IS 'General sales and support inquiries.';

-- =========================================================
-- Phase 10: WABA, Webmail, Templates
-- =========================================================

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  sender_number text NOT NULL UNIQUE,
  contact_name text,
  address text,
  pincode text,
  status text NOT NULL DEFAULT 'NEW',
  priority text NOT NULL DEFAULT 'NORMAL',
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  ad_source text,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  department text NOT NULL DEFAULT 'UNASSIGNED',
  sla_breach_at timestamptz,
  last_interaction_timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE whatsapp_conversations IS 'WhatsApp/WABA customer conversation routing and state.';
CREATE OR REPLACE VIEW "Conversation" AS SELECT row_number() OVER (ORDER BY created_at)::integer AS id, sender_number, last_interaction_timestamp, contact_name, address, pincode, status, priority, tags, notes, ad_source, assigned_to::text, department, sla_breach_at FROM whatsapp_conversations;
COMMENT ON VIEW "Conversation" IS 'Prisma compatibility projection for legacy WABA Conversation model.';

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  message_id text UNIQUE,
  sender_number text NOT NULL,
  direction message_direction NOT NULL,
  message_content text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'DELIVERED',
  media_url text,
  media_type text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE chat_messages IS 'All inbound and outbound chat messages across WhatsApp and customer chat.';
CREATE OR REPLACE VIEW "Message" AS SELECT id, message_id, sender_number, direction::text AS direction, message_content, timestamp, status, media_url, media_type FROM chat_messages;
COMMENT ON VIEW "Message" IS 'Prisma compatibility projection for legacy WABA Message model.';
CREATE OR REPLACE VIEW whatsapp_messages AS SELECT * FROM chat_messages;
COMMENT ON VIEW whatsapp_messages IS 'Compatibility view for WABA routes that read WhatsApp message records.';

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  channel text NOT NULL DEFAULT 'whatsapp',
  content text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  provider_template_id text,
  status text NOT NULL DEFAULT 'APPROVED',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT templates_company_name_language_unique UNIQUE (company_id, name, language, channel)
);
COMMENT ON TABLE templates IS 'Reusable WhatsApp, email, SMS, and notification templates.';
CREATE OR REPLACE VIEW "Template" AS SELECT id, name, language, content, status, created_at FROM templates;
COMMENT ON VIEW "Template" IS 'Prisma compatibility projection for legacy WABA Template model.';

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT email_templates_name_unique UNIQUE (company_id, name)
);
COMMENT ON TABLE email_templates IS 'Transactional and marketing email templates.';

CREATE TABLE IF NOT EXISTS waba_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE waba_automation_rules IS 'WhatsApp automation and rule engine definitions.';

CREATE TABLE IF NOT EXISTS whatsapp_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  message_id uuid REFERENCES chat_messages(id) ON DELETE SET NULL,
  provider_media_id text,
  url text NOT NULL,
  media_type text,
  mime_type text,
  size_bytes bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE whatsapp_media IS 'WhatsApp media attachments and provider media ids.';

CREATE TABLE IF NOT EXISTS webmail_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email citext NOT NULL,
  display_name text,
  provider text,
  encrypted_credentials bytea,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT webmail_accounts_email_unique UNIQUE (company_id, email)
);
COMMENT ON TABLE webmail_accounts IS 'Webmail account configuration with encrypted credential storage.';

CREATE TABLE IF NOT EXISTS webmail_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES webmail_accounts(id) ON DELETE CASCADE,
  provider_message_id text,
  folder text NOT NULL DEFAULT 'inbox',
  from_email citext,
  to_emails citext[] NOT NULL DEFAULT '{}',
  subject text,
  body_text text,
  body_html text,
  received_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE webmail_messages IS 'Webmail message cache for inbox and sent views.';

CREATE TABLE IF NOT EXISTS failed_api_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload text NOT NULL,
  error text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE failed_api_calls IS 'Failed external API call capture for replay and diagnostics.';
CREATE OR REPLACE VIEW "FailedApiCall" AS SELECT row_number() OVER (ORDER BY created_at)::integer AS id, payload, error, created_at FROM failed_api_calls;
COMMENT ON VIEW "FailedApiCall" IS 'Prisma compatibility projection for legacy FailedApiCall model.';

-- =========================================================
-- Phase 11: Reports, Audit, Activity, Analytics, Webhooks
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE audit_logs IS 'Enterprise immutable audit trail for sensitive data and administrative actions.';

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  subject_type text,
  subject_id uuid,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE activity_logs IS 'Operational user activity stream for timelines and dashboards.';

CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  risk_level text NOT NULL DEFAULT 'low',
  ip_address inet,
  user_agent text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE security_audit_log IS 'Security events for authentication, MFA, role changes, and suspicious activity.';

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  anonymous_id text,
  event_name text NOT NULL,
  event_type text,
  page_url text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE analytics_events IS 'High-volume behavioral analytics event stream.';

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  report_type text NOT NULL,
  definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule jsonb,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE reports IS 'Saved report definitions and schedules.';

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  widget_type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  position jsonb NOT NULL DEFAULT '{}'::jsonb,
  status record_status NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE dashboard_widgets IS 'User and role dashboard widget configuration.';

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE,
  source text,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  success boolean NOT NULL DEFAULT false,
  error text,
  duration_ms integer,
  processed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE webhook_events IS 'Idempotent webhook processing log.';

CREATE TABLE IF NOT EXISTS webhook_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_type text NOT NULL,
  date_bucket date NOT NULL DEFAULT current_date,
  success_count bigint NOT NULL DEFAULT 0 CHECK (success_count >= 0),
  failure_count bigint NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  avg_duration_ms numeric(12,2),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT webhook_stats_unique UNIQUE (source, event_type, date_bucket)
);
COMMENT ON TABLE webhook_stats IS 'Aggregated webhook success/failure metrics.';

CREATE TABLE IF NOT EXISTS custom_webhook_tunnel_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text,
  path text,
  method text,
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE custom_webhook_tunnel_queue IS 'Webhook tunnel queue for custom integration forwarding.';

-- =========================================================
-- Phase 12: Settings, Integrations, Preferences, HR, Files
-- =========================================================

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_secret boolean NOT NULL DEFAULT false,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT settings_company_key_unique UNIQUE (company_id, key)
);
COMMENT ON TABLE settings IS 'Application settings used by API, public site, payment, email, and security modules.';
CREATE OR REPLACE VIEW app_settings AS SELECT * FROM settings;
CREATE OR REPLACE VIEW app_config AS SELECT * FROM settings;
CREATE OR REPLACE VIEW system_settings AS SELECT * FROM settings;
COMMENT ON VIEW app_settings IS 'Compatibility view for application settings.';
COMMENT ON VIEW app_config IS 'Compatibility view for application configuration.';
COMMENT ON VIEW system_settings IS 'Compatibility view for system settings.';

CREATE TABLE IF NOT EXISTS website_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  site_key text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT website_settings_unique UNIQUE (company_id, site_key)
);
COMMENT ON TABLE website_settings IS 'Public website branding, SEO, navigation, and feature configuration.';

CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT company_settings_unique UNIQUE (company_id, key)
);
COMMENT ON TABLE company_settings IS 'Per-company operational configuration.';

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT user_preferences_unique UNIQUE (user_id, key)
);
COMMENT ON TABLE user_preferences IS 'Per-user dashboard, UI, notification, and workflow preferences.';
CREATE OR REPLACE VIEW user_communication_preferences AS SELECT id, user_id, key AS topic, value, metadata, created_at, updated_at FROM user_preferences WHERE key LIKE 'communication.%';
COMMENT ON VIEW user_communication_preferences IS 'Compatibility view for communication preference APIs.';

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  provider text NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  encrypted_secrets bytea,
  status record_status NOT NULL DEFAULT 'active',
  last_synced_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT integrations_unique UNIQUE (company_id, provider, name)
);
COMMENT ON TABLE integrations IS 'External integration configuration with encrypted secret storage.';

CREATE TABLE IF NOT EXISTS file_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  bucket text NOT NULL,
  object_key text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  checksum text,
  public_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT file_storage_object_unique UNIQUE (bucket, object_key)
);
COMMENT ON TABLE file_storage IS 'File metadata for product media, quote documents, invoices, and uploads.';
CREATE OR REPLACE VIEW images AS SELECT id, company_id, owner_id, bucket, object_key, file_name, mime_type, size_bytes, public_url AS url, metadata, created_at, updated_at FROM file_storage WHERE mime_type LIKE 'image/%';
COMMENT ON VIEW images IS 'Compatibility view for image metadata APIs.';

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  check_in_at timestamptz,
  check_out_at timestamptz,
  status text NOT NULL DEFAULT 'present',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT attendance_unique UNIQUE (staff_id, attendance_date)
);
COMMENT ON TABLE attendance IS 'Staff attendance and check-in records.';

CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT leave_requests_window CHECK (ends_on >= starts_on)
);
COMMENT ON TABLE leave_requests IS 'Leave management requests and approvals.';

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  expense_date date NOT NULL DEFAULT current_date,
  category text,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  description text,
  status text NOT NULL DEFAULT 'submitted',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
COMMENT ON TABLE expenses IS 'Sales and staff expense submissions.';

-- Additional referenced operational tables
CREATE TABLE IF NOT EXISTS customer_promotions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES customers(id) ON DELETE CASCADE, promotion_type text NOT NULL, status text NOT NULL DEFAULT 'active', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE customer_promotions IS 'Customer promotion entitlements and lifecycle.';
CREATE TABLE IF NOT EXISTS referral_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES customers(id) ON DELETE SET NULL, sales_agent_id uuid REFERENCES sales_agents(id) ON DELETE SET NULL, code text NOT NULL UNIQUE, usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0), usage_limit integer, status record_status NOT NULL DEFAULT 'active', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE referral_codes IS 'Customer and agent referral codes.';
CREATE TABLE IF NOT EXISTS referral_claims (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), referral_code_id uuid REFERENCES referral_codes(id) ON DELETE CASCADE, claimant_customer_id uuid REFERENCES customers(id) ON DELETE SET NULL, order_id uuid REFERENCES orders(id) ON DELETE SET NULL, status text NOT NULL DEFAULT 'claimed', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE referral_claims IS 'Referral redemption records.';
CREATE TABLE IF NOT EXISTS sales_agent_commissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), agent_id uuid REFERENCES sales_agents(id) ON DELETE CASCADE, order_id uuid REFERENCES orders(id) ON DELETE SET NULL, points_to_add integer NOT NULL DEFAULT 0, amount numeric(14,2) NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'pending', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE sales_agent_commissions IS 'Sales agent commission and points ledger.';
CREATE TABLE IF NOT EXISTS agent_redemption_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), agent_id uuid REFERENCES sales_agents(id) ON DELETE CASCADE, points_to_redeem integer NOT NULL CHECK (points_to_redeem > 0), status text NOT NULL DEFAULT 'pending', processed_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE agent_redemption_requests IS 'Agent points redemption approval workflow.';
CREATE TABLE IF NOT EXISTS order_otp_verifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid REFERENCES orders(id) ON DELETE CASCADE, agent_id uuid REFERENCES sales_agents(id) ON DELETE SET NULL, customer_phone text NOT NULL, otp_hash text NOT NULL, otp_type text NOT NULL DEFAULT 'agent_order', attempts integer NOT NULL DEFAULT 0, verified_at timestamptz, expires_at timestamptz NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE order_otp_verifications IS 'OTP challenges for agent-assisted orders.';
CREATE TABLE IF NOT EXISTS user_mfa_status (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, mfa_enabled boolean NOT NULL DEFAULT false, methods jsonb NOT NULL DEFAULT '[]'::jsonb, last_verified_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz, CONSTRAINT user_mfa_status_user_unique UNIQUE (user_id));
COMMENT ON TABLE user_mfa_status IS 'MFA enrollment and verification status.';
CREATE TABLE IF NOT EXISTS security_settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES companies(id) ON DELETE CASCADE, key text NOT NULL, value jsonb NOT NULL DEFAULT '{}'::jsonb, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz, CONSTRAINT security_settings_unique UNIQUE (company_id, key));
COMMENT ON TABLE security_settings IS 'Security policy and MFA settings.';
CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES profiles(id) ON DELETE SET NULL, customer_id uuid REFERENCES customers(id) ON DELETE SET NULL, status text NOT NULL DEFAULT 'requested', requested_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE gdpr_deletion_requests IS 'Privacy deletion requests and processing audit.';
CREATE TABLE IF NOT EXISTS upcoming_projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES companies(id) ON DELETE CASCADE, title text NOT NULL, slug text, description text, start_date date, status record_status NOT NULL DEFAULT 'draft', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE upcoming_projects IS 'Public upcoming projects and PDF generation content.';

-- Custom setup tables referenced by management/public flows.
CREATE TABLE IF NOT EXISTS custom_setup_offers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES companies(id) ON DELETE CASCADE, title text NOT NULL, description text, price numeric(14,2) DEFAULT 0, status record_status NOT NULL DEFAULT 'active', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_offers IS 'Custom setup promotional offers.';
CREATE TABLE IF NOT EXISTS custom_setup_inventory (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid REFERENCES products(id) ON DELETE SET NULL, quantity integer NOT NULL DEFAULT 0, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_inventory IS 'Inventory allocations for custom setup builder.';
CREATE TABLE IF NOT EXISTS custom_setup_components (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, component_type text, status record_status NOT NULL DEFAULT 'active', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_components IS 'Custom setup component catalog.';
CREATE TABLE IF NOT EXISTS custom_setup_component_options (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), component_id uuid REFERENCES custom_setup_components(id) ON DELETE CASCADE, product_id uuid REFERENCES products(id) ON DELETE SET NULL, name text NOT NULL, price_delta numeric(14,2) DEFAULT 0, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_component_options IS 'Selectable product-backed options for custom setup components.';
CREATE TABLE IF NOT EXISTS custom_setup_templates (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, config jsonb NOT NULL DEFAULT '{}'::jsonb, status record_status NOT NULL DEFAULT 'active', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_templates IS 'Reusable custom setup templates.';
CREATE TABLE IF NOT EXISTS custom_setup_systems (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid REFERENCES customers(id) ON DELETE SET NULL, template_id uuid REFERENCES custom_setup_templates(id) ON DELETE SET NULL, config jsonb NOT NULL DEFAULT '{}'::jsonb, status record_status NOT NULL DEFAULT 'draft', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_systems IS 'Customer custom setup configurations.';
CREATE TABLE IF NOT EXISTS custom_setup_constants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL UNIQUE, value jsonb NOT NULL DEFAULT '{}'::jsonb, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
COMMENT ON TABLE custom_setup_constants IS 'Custom setup builder constants and pricing controls.';

-- Compatibility views for Prisma organization/system models.
CREATE OR REPLACE VIEW org_organizations AS SELECT id, display_name AS name, created_at, updated_at FROM companies;
CREATE OR REPLACE VIEW org_branches AS SELECT id, company_id AS org_id, name, coalesce(address->>'line1', address::text) AS location, created_at, updated_at FROM branches;
CREATE OR REPLACE VIEW sys_roles AS SELECT id, company_id AS org_id, name, description, is_system, created_at, updated_at FROM roles;
CREATE OR REPLACE VIEW sys_permissions AS SELECT id, module, action, description, created_at FROM permissions;
CREATE OR REPLACE VIEW sys_role_permissions AS SELECT role_id, permission_id FROM role_permissions;
CREATE OR REPLACE VIEW sys_users_prisma AS SELECT p.id, p.email::text AS email, coalesce(p.name, p.email::text) AS name, p.mobile AS phone_number, p.company_id AS organization_id, p.branch_id, ur.role_id, to_jsonb(p.managed_pincodes) AS managed_pincodes, p.created_at AS "createdAt" FROM profiles p LEFT JOIN LATERAL (SELECT role_id FROM user_roles ur WHERE ur.user_id = p.id ORDER BY created_at DESC LIMIT 1) ur ON true;
CREATE OR REPLACE VIEW "User" AS SELECT * FROM sys_users_prisma;
COMMENT ON VIEW org_organizations IS 'Prisma compatibility projection for Organization.';
COMMENT ON VIEW org_branches IS 'Prisma compatibility projection for Branch.';
COMMENT ON VIEW sys_roles IS 'Prisma compatibility projection for Role.';
COMMENT ON VIEW sys_permissions IS 'Prisma compatibility projection for Permission.';
COMMENT ON VIEW sys_role_permissions IS 'Prisma compatibility projection for RolePermission.';
COMMENT ON VIEW sys_users_prisma IS 'Prisma compatibility projection for User.';
COMMENT ON VIEW "User" IS 'Prisma compatibility projection for legacy User model.';

CREATE OR REPLACE VIEW auth_users_summary AS
SELECT id, email, phone, email_confirmed_at, last_sign_in_at, banned_until, raw_app_meta_data AS app_metadata, raw_user_meta_data AS user_metadata, created_at, updated_at
FROM auth.users;
COMMENT ON VIEW auth_users_summary IS 'Safe auth user summary for admin user list screens.';

-- =========================================================
-- Functions and Triggers
-- =========================================================

CREATE OR REPLACE FUNCTION create_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'TB-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION create_order_number() IS 'Generates human-readable order numbers when not supplied.';

CREATE OR REPLACE FUNCTION audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs(actor_id, action, table_name, record_id, new_values, created_by)
    VALUES (app_current_user_id(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), app_current_user_id());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs(actor_id, action, table_name, record_id, old_values, new_values, created_by)
    VALUES (app_current_user_id(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), app_current_user_id());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs(actor_id, action, table_name, record_id, old_values, created_by)
    VALUES (app_current_user_id(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), app_current_user_id());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
COMMENT ON FUNCTION audit_row_change() IS 'Generic audit trigger function for sensitive tables.';

CREATE OR REPLACE FUNCTION allocate_order_inventory_atomic(
  p_customer_name text,
  p_customer_id uuid,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_address text,
  p_notes text,
  p_payment_method text,
  p_subtotal numeric,
  p_gst_amount numeric,
  p_total numeric,
  p_discount_amount numeric,
  p_shipping_amount numeric,
  p_payment_status text,
  p_order_type text,
  p_items jsonb,
  p_agent_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_available integer;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(p_items->'cart_items', '[]'::jsonb)) LOOP
    v_product_id := nullif(coalesce(v_item->>'productId', v_item->>'product_id', v_item->>'id'), '')::uuid;
    v_quantity := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);
    SELECT stock_quantity INTO v_available FROM products WHERE id = v_product_id FOR UPDATE;
    IF v_available IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Product not found: ' || v_product_id::text);
    END IF;
    IF v_available < v_quantity THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock for product: ' || v_product_id::text);
    END IF;
  END LOOP;

  INSERT INTO orders(customer_name, customer_id, customer_email, customer_phone, delivery_address, notes, payment_method, subtotal, gst_amount, total, discount_amount, shipping_amount, payment_status, type, items, agent_id, created_by)
  VALUES (p_customer_name, p_customer_id, p_customer_email, p_customer_phone, p_delivery_address, p_notes, p_payment_method, p_subtotal, p_gst_amount, p_total, p_discount_amount, p_shipping_amount, coalesce(p_payment_status, 'pending'), coalesce(p_order_type, 'Delivery'), p_items, p_agent_id, app_current_user_id())
  RETURNING * INTO v_order;

  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(p_items->'cart_items', '[]'::jsonb)) LOOP
    v_product_id := nullif(coalesce(v_item->>'productId', v_item->>'product_id', v_item->>'id'), '')::uuid;
    v_quantity := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);
    UPDATE products SET stock_quantity = stock_quantity - v_quantity, stock = greatest(stock - v_quantity, 0), updated_at = now() WHERE id = v_product_id;
    INSERT INTO order_items(order_id, product_id, quantity, price, unit_price, total_price, discount_amount, gst_rate, hsn_code, sac_code, taxable_base, gst_amount, cgst, sgst, igst, created_by)
    VALUES (v_order.id, v_product_id, v_quantity, coalesce((v_item->>'price')::numeric, 0), coalesce((v_item->>'price')::numeric, 0), coalesce((v_item->>'total_price')::numeric, coalesce((v_item->>'price')::numeric, 0) * v_quantity), coalesce((v_item->>'discount_amount')::numeric, 0), coalesce((v_item->>'gstRate')::numeric, 18), v_item->>'hsnCode', v_item->>'sacCode', coalesce((v_item->>'taxableBase')::numeric, 0), coalesce((v_item->>'gstAmount')::numeric, 0), coalesce((v_item->>'cgst')::numeric, 0), coalesce((v_item->>'sgst')::numeric, 0), coalesce((v_item->>'igst')::numeric, 0), app_current_user_id());
    INSERT INTO stock_movements(product_id, movement_type, quantity, reference_type, reference_id, created_by)
    VALUES (v_product_id, 'sale', -v_quantity, 'order', v_order.id, app_current_user_id());
  END LOOP;

  RETURN jsonb_build_object('success', true, 'order', to_jsonb(v_order));
END;
$$;
COMMENT ON FUNCTION allocate_order_inventory_atomic(text, uuid, text, text, text, text, text, numeric, numeric, numeric, numeric, numeric, text, text, jsonb, uuid) IS 'Atomically validates stock, creates an order, inserts order items, decrements stock, and records stock movements.';

CREATE OR REPLACE FUNCTION update_order_status_v1(p_order_id uuid, p_status text, p_additional_data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders
  SET status = p_status,
      payment_status = coalesce(p_additional_data->>'payment_status', payment_status),
      cancellation_reason = coalesce(p_additional_data->>'cancellation_reason', cancellation_reason),
      notes = coalesce(p_additional_data->>'notes', notes),
      updated_at = now(),
      updated_by = app_current_user_id()
  WHERE id = p_order_id;
END;
$$;
COMMENT ON FUNCTION update_order_status_v1(uuid, text, jsonb) IS 'Centralized order status update RPC used by API services.';

CREATE OR REPLACE FUNCTION record_atomic_stock_movement(p_product_id uuid, p_quantity integer, p_movement_type text, p_reference_type text DEFAULT NULL, p_reference_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE v_id uuid;
BEGIN
  UPDATE products SET stock_quantity = greatest(stock_quantity + p_quantity, 0), stock = greatest(stock + p_quantity, 0), updated_at = now() WHERE id = p_product_id;
  INSERT INTO stock_movements(product_id, movement_type, quantity, reference_type, reference_id, created_by)
  VALUES (p_product_id, p_movement_type::inventory_movement_type, p_quantity, p_reference_type, p_reference_id, app_current_user_id()) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
COMMENT ON FUNCTION record_atomic_stock_movement(uuid, integer, text, text, uuid) IS 'Atomic product stock balance update plus stock movement ledger insert.';

CREATE OR REPLACE FUNCTION increment_product_stock(p_product_id uuid, p_quantity integer)
RETURNS void
LANGUAGE sql
AS $$ UPDATE products SET stock = stock + p_quantity, stock_quantity = stock_quantity + p_quantity, updated_at = now() WHERE id = p_product_id $$;
COMMENT ON FUNCTION increment_product_stock(uuid, integer) IS 'Restores product stock, used by auto-cancel and returns.';

CREATE OR REPLACE FUNCTION soft_delete_product(p_product_id uuid)
RETURNS void
LANGUAGE sql
AS $$ UPDATE products SET is_deleted = true, status = 'archived', deleted_at = now(), deleted_by = app_current_user_id(), updated_at = now() WHERE id = p_product_id $$;
COMMENT ON FUNCTION soft_delete_product(uuid) IS 'Archives a product without physically deleting it.';

CREATE OR REPLACE FUNCTION restore_product(p_product_id uuid)
RETURNS void
LANGUAGE sql
AS $$ UPDATE products SET is_deleted = false, status = 'active', deleted_at = NULL, deleted_by = NULL, updated_at = now() WHERE id = p_product_id $$;
COMMENT ON FUNCTION restore_product(uuid) IS 'Restores a previously soft-deleted product.';

CREATE OR REPLACE FUNCTION increment_agent_points(p_agent_id uuid, p_points integer)
RETURNS void
LANGUAGE sql
AS $$ UPDATE sales_agents SET points_balance = points_balance + greatest(p_points, 0), updated_at = now() WHERE id = p_agent_id $$;
COMMENT ON FUNCTION increment_agent_points(uuid, integer) IS 'Atomically increments a sales agent points balance.';

CREATE OR REPLACE FUNCTION increment_referral_code_uses(p_referral_code_id uuid)
RETURNS void
LANGUAGE sql
AS $$ UPDATE referral_codes SET usage_count = usage_count + 1, updated_at = now() WHERE id = p_referral_code_id $$;
COMMENT ON FUNCTION increment_referral_code_uses(uuid) IS 'Increments referral code usage count.';

CREATE OR REPLACE FUNCTION check_customer_promotions(p_customer_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE
AS $$ SELECT coalesce(jsonb_agg(to_jsonb(cp)), '[]'::jsonb) FROM customer_promotions cp WHERE cp.customer_id = p_customer_id AND cp.deleted_at IS NULL $$;
COMMENT ON FUNCTION check_customer_promotions(uuid) IS 'Returns active promotion records for a customer.';

CREATE OR REPLACE FUNCTION add_customer_promotion_v1(p_customer_id uuid, p_promotion_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
AS $$ DECLARE v_id uuid; BEGIN INSERT INTO customer_promotions(customer_id, promotion_type, metadata, created_by) VALUES (p_customer_id, p_promotion_type, p_metadata, app_current_user_id()) RETURNING id INTO v_id; RETURN v_id; END; $$;
COMMENT ON FUNCTION add_customer_promotion_v1(uuid, text, jsonb) IS 'Adds a customer promotion entitlement.';

CREATE OR REPLACE FUNCTION check_otp_rate_limit(p_phone text)
RETURNS boolean
LANGUAGE sql STABLE
AS $$ SELECT count(*) < 5 FROM otp_verifications WHERE phone = p_phone AND created_at > now() - interval '10 minutes' $$;
COMMENT ON FUNCTION check_otp_rate_limit(text) IS 'Checks OTP generation rate limit for a phone number.';

CREATE OR REPLACE FUNCTION fetch_and_increment_otp_attempt(p_otp_id uuid)
RETURNS otp_verifications
LANGUAGE plpgsql
AS $$ DECLARE v_row otp_verifications; BEGIN UPDATE otp_verifications SET attempts = attempts + 1, updated_at = now() WHERE id = p_otp_id RETURNING * INTO v_row; RETURN v_row; END; $$;
COMMENT ON FUNCTION fetch_and_increment_otp_attempt(uuid) IS 'Increments and returns an OTP verification attempt row.';

CREATE OR REPLACE FUNCTION complete_payment_transaction(p_payment_id uuid, p_status text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE payments SET status = p_status, paid_at = CASE WHEN p_status IN ('paid','Payment Confirmed') THEN now() ELSE paid_at END, metadata = metadata || p_payload, updated_at = now() WHERE id = p_payment_id;
  UPDATE orders SET payment_status = p_status, updated_at = now() WHERE id = (SELECT order_id FROM payments WHERE id = p_payment_id);
END;
$$;
COMMENT ON FUNCTION complete_payment_transaction(uuid, text, jsonb) IS 'Finalizes payment status and synchronizes the related order payment status.';

CREATE OR REPLACE FUNCTION validate_password_strength(p_password text)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$ SELECT length(p_password) >= 8 AND p_password ~ '[A-Z]' AND p_password ~ '[a-z]' AND p_password ~ '[0-9]' $$;
COMMENT ON FUNCTION validate_password_strength(text) IS 'Basic password strength validator.';

CREATE OR REPLACE FUNCTION auto_cancel_stale_orders_v1(p_before timestamptz DEFAULT now() - interval '30 minutes')
RETURNS integer
LANGUAGE plpgsql
AS $$ DECLARE v_count integer; BEGIN UPDATE orders SET status = 'Cancelled', cancellation_reason = 'Auto-cancelled stale unpaid order', updated_at = now() WHERE status IN ('Pending','Awaiting Payment') AND created_at < p_before; GET DIAGNOSTICS v_count = ROW_COUNT; RETURN v_count; END; $$;
COMMENT ON FUNCTION auto_cancel_stale_orders_v1(timestamptz) IS 'Cancels stale pending orders older than the provided cutoff.';

CREATE OR REPLACE FUNCTION complete_service_ticket_v1(p_ticket_id uuid, p_resolution text DEFAULT NULL)
RETURNS void
LANGUAGE sql
AS $$ UPDATE service_tickets SET status = 'CLOSED', resolved_at = now(), metadata = metadata || jsonb_build_object('resolution', p_resolution), updated_at = now() WHERE id = p_ticket_id $$;
COMMENT ON FUNCTION complete_service_ticket_v1(uuid, text) IS 'Closes a service ticket with optional resolution notes.';

CREATE OR REPLACE FUNCTION admin_set_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE v_role_id uuid;
BEGIN
  IF NOT is_platform_admin() THEN RAISE EXCEPTION 'admin privileges required'; END IF;
  SELECT id INTO v_role_id FROM roles WHERE name = p_role ORDER BY company_id NULLS FIRST LIMIT 1;
  IF v_role_id IS NULL THEN RAISE EXCEPTION 'role not found: %', p_role; END IF;
  UPDATE profiles SET role = p_role, updated_at = now(), updated_by = app_current_user_id() WHERE id = p_user_id;
  DELETE FROM user_roles WHERE user_id = p_user_id;
  INSERT INTO user_roles(user_id, role_id, created_by) VALUES (p_user_id, v_role_id, app_current_user_id());
END;
$$;
COMMENT ON FUNCTION admin_set_user_role(uuid, text) IS 'Admin-only RPC to synchronize profile.role and user_roles.';

CREATE OR REPLACE FUNCTION superadmin_assign_inquiry(p_inquiry_id uuid, p_assigned_to uuid)
RETURNS void
LANGUAGE sql
AS $$ UPDATE inquiries SET assigned_to = p_assigned_to, updated_at = now(), updated_by = app_current_user_id() WHERE id = p_inquiry_id $$;
COMMENT ON FUNCTION superadmin_assign_inquiry(uuid, uuid) IS 'Assigns an inquiry to a staff user.';

DROP TRIGGER IF EXISTS orders_order_number_trg ON orders;
CREATE TRIGGER orders_order_number_trg BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION create_order_number();

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('audit_logs') LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = r.tablename AND column_name = 'updated_at') THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', r.tablename || '_set_updated_at_trg', r.tablename);
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', r.tablename || '_set_updated_at_trg', r.tablename);
    END IF;
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS audit_profiles_trg ON profiles;
CREATE TRIGGER audit_profiles_trg AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_roles_trg ON roles;
CREATE TRIGGER audit_roles_trg AFTER INSERT OR UPDATE OR DELETE ON roles FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_permissions_trg ON permissions;
CREATE TRIGGER audit_permissions_trg AFTER INSERT OR UPDATE OR DELETE ON permissions FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_orders_trg ON orders;
CREATE TRIGGER audit_orders_trg AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_payments_trg ON payments;
CREATE TRIGGER audit_payments_trg AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_api_keys_trg ON api_keys;
CREATE TRIGGER audit_api_keys_trg AFTER INSERT OR UPDATE OR DELETE ON api_keys FOR EACH ROW EXECUTE FUNCTION audit_row_change();

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_departments_company_branch ON departments(company_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_roles_company_name ON roles(company_id, name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_permissions_module_action ON permissions(module, action) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_company_role ON profiles(company_id, role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON profiles USING gin ((email::text) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON profiles USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_staff_company_branch ON staff(company_id, branch_id, department_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(email::text,'') || ' ' || coalesce(mobile,'')));
CREATE INDEX IF NOT EXISTS idx_products_company_status ON products(company_id, status, is_deleted) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_category_brand ON products(category_id, brand_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_inventory_lookup ON product_inventory(product_id, variant_id, warehouse_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_serial ON inventory_items(serial_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_phone_created ON orders(customer_phone, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_search ON orders USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_status ON payments(order_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_tickets_assignee_status ON service_tickets(assigned_to, status, priority) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_tickets_search ON service_tickets USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_status ON leads(assigned_to, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status_schedule ON marketing_campaigns(status, schedule_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_sender ON whatsapp_conversations(sender_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_time ON chat_messages(sender_number, timestamp DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON analytics_events(event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time ON analytics_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_time ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_subject ON activity_logs(subject_type, subject_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_settings_company_key ON settings(company_id, key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_file_storage_object ON file_storage(bucket, object_key) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires ON user_sessions(user_id, expires_at DESC) WHERE deleted_at IS NULL;

-- =========================================================
-- Row Level Security
-- =========================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_area_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_recovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_installation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sls_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ntf_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_broadcast_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE waba_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE webmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webmail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_webhook_tunnel_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_component_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_constants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_admin_all ON companies;
CREATE POLICY companies_admin_all ON companies FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());
DROP POLICY IF EXISTS companies_member_read ON companies;
CREATE POLICY companies_member_read ON companies FOR SELECT USING (id = current_company_id());
DROP POLICY IF EXISTS tenant_company_read ON branches;
CREATE POLICY tenant_company_read ON branches FOR SELECT USING (company_id = current_company_id() OR is_platform_admin());
DROP POLICY IF EXISTS tenant_company_write ON branches;
CREATE POLICY tenant_company_write ON branches FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());
DROP POLICY IF EXISTS profiles_self_read ON profiles;
CREATE POLICY profiles_self_read ON profiles FOR SELECT USING (id = auth.uid() OR company_id = current_company_id() OR is_platform_admin());
DROP POLICY IF EXISTS profiles_self_update ON profiles;
CREATE POLICY profiles_self_update ON profiles FOR UPDATE USING (id = auth.uid() OR is_platform_admin()) WITH CHECK (id = auth.uid() OR is_platform_admin());
DROP POLICY IF EXISTS customers_company_access ON customers;
CREATE POLICY customers_company_access ON customers FOR ALL USING (company_id = current_company_id() OR is_platform_admin()) WITH CHECK (company_id = current_company_id() OR is_platform_admin());
DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products FOR SELECT USING (deleted_at IS NULL AND is_deleted = false AND status = 'active');
DROP POLICY IF EXISTS products_admin_write ON products;
CREATE POLICY products_admin_write ON products FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());
DROP POLICY IF EXISTS orders_customer_read ON orders;
CREATE POLICY orders_customer_read ON orders FOR SELECT USING (customer_id = auth.uid() OR company_id = current_company_id() OR is_platform_admin());
DROP POLICY IF EXISTS orders_customer_insert ON orders;
CREATE POLICY orders_customer_insert ON orders FOR INSERT WITH CHECK (customer_id = auth.uid() OR auth.uid() IS NULL OR is_platform_admin());
DROP POLICY IF EXISTS service_tickets_company_access ON service_tickets;
CREATE POLICY service_tickets_company_access ON service_tickets FOR ALL USING (company_id = current_company_id() OR assigned_to = auth.uid() OR is_platform_admin()) WITH CHECK (company_id = current_company_id() OR assigned_to = auth.uid() OR is_platform_admin());
DROP POLICY IF EXISTS notifications_user_access ON notifications;
CREATE POLICY notifications_user_access ON notifications FOR ALL USING (user_id = auth.uid() OR is_platform_admin()) WITH CHECK (user_id = auth.uid() OR is_platform_admin());
DROP POLICY IF EXISTS leads_company_access ON leads;
CREATE POLICY leads_company_access ON leads FOR ALL USING (company_id = current_company_id() OR assigned_to = auth.uid() OR is_platform_admin()) WITH CHECK (company_id = current_company_id() OR assigned_to = auth.uid() OR is_platform_admin());
DROP POLICY IF EXISTS settings_admin_access ON settings;
CREATE POLICY settings_admin_access ON settings FOR ALL USING (is_platform_admin()) WITH CHECK (is_platform_admin());
DROP POLICY IF EXISTS audit_admin_read ON audit_logs;
CREATE POLICY audit_admin_read ON audit_logs FOR SELECT USING (is_platform_admin());

-- =========================================================
-- Seed System Roles and Baseline Settings
-- =========================================================

INSERT INTO companies(code, legal_name, display_name, status)
VALUES ('TECBUNNY', 'Tecbunny Private Limited', 'Tecbunny', 'active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles(company_id, name, display_name, is_system)
SELECT c.id, r.name, r.display_name, true
FROM companies c
CROSS JOIN (VALUES
  ('superadmin','Super Admin'), ('admin','Admin'), ('manager','Manager'), ('sales_manager','Sales Manager'),
  ('service_manager','Service Manager'), ('sales_executive','Sales Executive'), ('store_executive','Store Executive'),
  ('sales_agent','Sales Agent'), ('service_engineer','Service Engineer'), ('accounts','Accounts'), ('customer','Customer')
) AS r(name, display_name)
WHERE c.code = 'TECBUNNY'
ON CONFLICT (company_id, name) DO NOTHING;

INSERT INTO permissions(module, action, resource, description)
VALUES
  ('users','read','profiles','Read users and profiles'),
  ('users','write','profiles','Create and update users'),
  ('catalog','read','products','Read catalog'),
  ('catalog','write','products','Manage catalog'),
  ('orders','read','orders','Read orders'),
  ('orders','write','orders','Manage orders'),
  ('service','read','service_tickets','Read service tickets'),
  ('service','write','service_tickets','Manage service tickets'),
  ('settings','write','settings','Manage settings'),
  ('security','read','audit_logs','Read audit logs')
ON CONFLICT (module, action, resource) DO NOTHING;

COMMIT;
