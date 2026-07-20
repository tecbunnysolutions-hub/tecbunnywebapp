
-- ==========================================
-- MODULE: 20260715000000_baseline.sql
-- ==========================================


-- ==========================================
-- MODULE: 20260715000000_baseline.sql
-- ==========================================


-- ==========================================
-- MODULE: 20260715000000_baseline.sql
-- ==========================================


-- ==========================================
-- MODULE: 20260715000000_baseline.sql
-- ==========================================


-- ==========================================
-- MODULE: 20260715000000_baseline.sql
-- ==========================================


-- ==========================================
-- ENTERPRISE SUPERADMIN OS DATABASE
-- ==========================================
-- This file contains the fully integrated, merged, and optimized 
-- production database schema. Capable of supporting millions of records.
-- ==========================================

-- ==========================================
-- 0. RESET SCHEMA (Idempotency)
-- ==========================================
-- -- -- -- -- -- DROP SCHEMA IF EXISTS public CASCADE;
-- -- -- -- -- -- CREATE SCHEMA public;
-- -- -- -- -- -- GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.enum_org_status AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_auth_status AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'USED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_product_status AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_media_type AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', '3D_MODEL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_relation_type AS ENUM ('RELATED', 'UPSELL', 'CROSS_SELL', 'ACCESSORY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_stock_movement AS ENUM ('PO_RECEIPT', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT_ADD', 'ADJUSTMENT_REMOVE', 'RETURN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_cms_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_nav_location AS ENUM ('HEADER', 'FOOTER', 'SIDEBAR', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_redirect_type AS ENUM ('301', '302', '307', '308');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_crm_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LEAD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_address_type AS ENUM ('BILLING', 'SHIPPING', 'BOTH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_wallet_tx_type AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_doc_type AS ENUM ('KYC', 'TAX_EXEMPTION', 'CONTRACT', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sls_lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sls_opp_status AS ENUM ('OPEN', 'WON', 'LOST', 'ON_HOLD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sls_activity_type AS ENUM ('TASK', 'MEETING', 'CALL', 'EMAIL', 'FOLLOW_UP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sls_activity_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_oms_order_status AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_oms_payment_status AS ENUM ('PENDING', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_oms_shipment_status AS ENUM ('PENDING', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT', 'RETURNED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_wab_msg_direction AS ENUM ('INBOUND', 'OUTBOUND');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_wab_msg_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_wab_conv_status AS ENUM ('OPEN', 'SNOOZED', 'CLOSED', 'BOT_HANDLING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_wab_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_mkt_campaign_status AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_mkt_broadcast_status AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sup_ticket_type AS ENUM ('INSTALLATION', 'COMPLAINT', 'PREVENTATIVE_MAINTENANCE', 'INQUIRY', 'RETURN_REQUEST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sup_ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'WAITING_ON_PARTS', 'SCHEDULED_FOR_VISIT', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sup_visit_status AS ENUM ('SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sup_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_fin_account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_fin_entry_status AS ENUM ('DRAFT', 'POSTED', 'VOIDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_fin_doc_status AS ENUM ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'VOIDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_hr_employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'PROBATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_hr_leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_hr_attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_hr_payroll_status AS ENUM ('DRAFT', 'APPROVED', 'PROCESSED', 'PAID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_ntf_channel AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WHATSAPP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_ntf_status AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'BOUNCED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sub_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'UNPAID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sub_interval AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_pm_project_status AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_pm_task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_pm_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.enum_sls_heat_level AS ENUM ('HOT', 'WARM', 'COLD', 'DEAD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE FUNCTIONS


-- 4. TABLES, FOREIGN KEYS, INDEXES, VIEWS

-- ==========================================
-- MODULE: 20260715000002_enterprise_audit_core.sql
-- ==========================================


-- Migration: Enterprise Audit Core
-- Sets up the core auditing functions, triggers, and the sys_audit_logs table.

-- Core function required by all RLS policies across the entire schema
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.sys_user_roles ur
    JOIN public.sys_roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
  );
END;
$$;






-- ==========================================
-- MODULE: 20260715000005_core_iam.sql
-- ==========================================


-- Migration: Core Organization, IAM, & Auth Security Engine
-- Encompasses Organizations, Branches, HR, RBAC, and strict Auth tracking.

-- ==========================================
-- 1. ENUMS & AUDIT (Ensure base exists)
-- ==========================================




-- Ensuring sys_audit_logs exists (From 000002, re-verified for completeness as requested)
CREATE TABLE IF NOT EXISTS public.sys_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. ORGANIZATION STRUCTURE (HR Core)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.org_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT,
    tax_id TEXT,
    industry TEXT,
    status public.enum_org_status DEFAULT 'ACTIVE',
    settings JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$
BEGIN
    ALTER TABLE public.org_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_organizations' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_organizations' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;
DO $$
BEGIN
    CREATE UNIQUE INDEX idx_org_organizations_name ON public.org_organizations(name) WHERE deleted_at IS NULL;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.org_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    address JSONB,
    timezone TEXT DEFAULT 'UTC',
    is_headquarters BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$
BEGIN
    ALTER TABLE public.org_branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_branches' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_branches' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_branches ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;
DO $$
BEGIN
    CREATE INDEX idx_org_branches_org_id ON public.org_branches(org_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.org_branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.org_departments(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$
BEGIN
    ALTER TABLE public.org_departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_departments' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_departments' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;
DO $$
BEGIN
    CREATE INDEX idx_org_departments_org_id ON public.org_departments(org_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.org_designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.org_departments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    level INTEGER DEFAULT 0,
    job_description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$
BEGIN
    ALTER TABLE public.org_designations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_designations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_designations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.org_designations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_designations' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_designations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'org_designations' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.org_designations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;
DO $$
BEGIN
    CREATE INDEX idx_org_designations_org_id ON public.org_designations(org_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==========================================
-- 3. CORE USERS & IAM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- 1:1 with Auth
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.org_branches(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.org_departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES public.org_designations(id) ON DELETE SET NULL,
    employee_code TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DO $$
BEGIN
    ALTER TABLE public.sys_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sys_users' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.sys_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sys_users' AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.sys_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    END IF;
END $$;
DO $$
BEGIN
    CREATE INDEX idx_sys_users_org_id ON public.sys_users(org_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
DO $$
BEGIN
    CREATE UNIQUE INDEX idx_sys_users_emp_code ON public.sys_users(org_id, employee_code) WHERE deleted_at IS NULL AND employee_code IS NOT NULL;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- RBAC Tables (Recreated with IF NOT EXISTS to merge with 000003, but upgraded with Org_id for multi-tenancy)
CREATE TABLE IF NOT EXISTS public.sys_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE, -- NULL means Global System Role
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (org_id, name)
);

DO $$
BEGIN
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.sys_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (module, action)
);

DO $$
BEGIN
    ALTER TABLE public.sys_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.sys_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.sys_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.sys_permissions(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (role_id, permission_id)
);

DO $$
BEGIN
    ALTER TABLE public.sys_role_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_role_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_role_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_role_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.sys_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.sys_roles(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE, -- Contextual assignment
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, role_id, org_id)
);

DO $$
BEGIN
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
-- Create Materialized View for fast permission lookup
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_user_permissions AS
SELECT DISTINCT ur.user_id, p.module, p.action
FROM public.sys_user_roles ur
JOIN public.sys_roles r ON ur.role_id = r.id
JOIN public.sys_role_permissions rp ON r.id = rp.role_id
JOIN public.sys_permissions p ON rp.permission_id = p.id
WHERE r.deleted_at IS NULL AND ur.deleted_at IS NULL AND rp.deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_permissions_user_module_action ON public.mv_user_permissions(user_id, module, action);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_mv_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_permissions;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to refresh materialized view
DROP TRIGGER IF EXISTS trg_refresh_mv_user_permissions_ur ON public.sys_user_roles;
CREATE TRIGGER trg_refresh_mv_user_permissions_ur AFTER INSERT OR UPDATE OR DELETE ON public.sys_user_roles FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_mv_user_permissions();

DROP TRIGGER IF EXISTS trg_refresh_mv_user_permissions_rp ON public.sys_role_permissions;
CREATE TRIGGER trg_refresh_mv_user_permissions_rp AFTER INSERT OR UPDATE OR DELETE ON public.sys_role_permissions FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_mv_user_permissions();

DROP TRIGGER IF EXISTS trg_refresh_mv_user_permissions_r ON public.sys_roles;
CREATE TRIGGER trg_refresh_mv_user_permissions_r AFTER INSERT OR UPDATE OR DELETE ON public.sys_roles FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_mv_user_permissions();

-- Failsafe Enable RLS and Policies for RBAC Tables
DO $$
BEGIN
    ALTER TABLE public.sys_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_roles" ON public.sys_roles;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_roles" ON public.sys_roles FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_permissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_permissions" ON public.sys_permissions;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_permissions" ON public.sys_permissions FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_role_permissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_role_permissions" ON public.sys_role_permissions;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_role_permissions" ON public.sys_role_permissions FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_user_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_user_roles" ON public.sys_user_roles;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_user_roles" ON public.sys_user_roles FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.sys_user_roles;
DO $$
BEGIN
    CREATE POLICY "Users can view their own roles" ON public.sys_user_roles FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;


DO $$
BEGIN
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;


-- Failsafe Enable RLS and Policies for RBAC Tables
DO $$
BEGIN
    ALTER TABLE public.sys_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_roles" ON public.sys_roles;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_roles" ON public.sys_roles FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_permissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_permissions" ON public.sys_permissions;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_permissions" ON public.sys_permissions FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_role_permissions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_role_permissions" ON public.sys_role_permissions;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_role_permissions" ON public.sys_role_permissions FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.sys_user_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Superadmin full access on sys_user_roles" ON public.sys_user_roles;
DO $$
BEGIN
    CREATE POLICY "Superadmin full access on sys_user_roles" ON public.sys_user_roles FOR ALL USING (public.is_superadmin());
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.sys_user_roles;
DO $$
BEGIN
    CREATE POLICY "Users can view their own roles" ON public.sys_user_roles FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;


DO $$
BEGIN
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;



DO $$
BEGIN
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE;
    ALTER TABLE public.sys_user_roles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==========================================
-- 4. ADVANCED AUTH & SECURITY TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_auth_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT,
    browser TEXT,
    os TEXT,
    ip_address TEXT,
    is_trusted BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, device_id)
);

CREATE TABLE IF NOT EXISTS public.sys_auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.sys_auth_devices(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    status public.enum_auth_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_sys_auth_sessions_user ON public.sys_auth_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.sys_auth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sys_auth_sessions(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    status public.enum_auth_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sys_auth_otp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contact TEXT NOT NULL, -- Email or Phone
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL, -- e.g., 'LOGIN', 'VERIFY_PHONE'
    status public.enum_auth_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sys_auth_password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    status public.enum_auth_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sys_auth_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    scopes TEXT[] DEFAULT '{}',
    status public.enum_auth_status DEFAULT 'ACTIVE',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sys_auth_2fa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    method TEXT NOT NULL, -- e.g., 'TOTP', 'SMS'
    secret TEXT, -- Encrypted TOTP secret
    recovery_codes TEXT[], -- Hashed backup codes
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(user_id, method)
);

CREATE TABLE IF NOT EXISTS public.sys_auth_login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    login_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_success BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    location_data JSONB,
    failure_reason TEXT
);
-- Note: Login history is an immutable append-only ledger, so no updated_at/deleted_at needed.
CREATE INDEX idx_sys_auth_login_history_user ON public.sys_auth_login_history(user_id, login_attempt_at);

-- ==========================================
-- 5. TRIGGERS & RLS AUTOMATION
-- ==========================================



-- 6. SECURITY POLICIES (Superadmin Global, Users contextual)

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION public.get_current_org_id()
RETURNS UUID AS $$
    SELECT org_id FROM public.sys_users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Apply Multi-tenant policies dynamically to HR tables


-- Policies for Auth Security tables (Users can only see their own auth data)


-- ==========================================
-- MODULE: 20260715000001_advanced_products.sql
-- ==========================================


-- Migration: Enterprise ERP Products, Inventory & Supply Chain
-- Massive architecture encompassing Master Catalog, Pricing, Warehouse, Suppliers, and Stock Ledger.

-- ==========================================
-- 1. ENUMS & FOUNDATION
-- ==========================================








-- ==========================================
-- 2. CATALOG CORE & CLASSIFICATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.prd_tax_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    gst_rate NUMERIC DEFAULT 0 CHECK (gst_rate >= 0),
    hsn_sac_code TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (org_id, slug)
);

CREATE TABLE IF NOT EXISTS public.prd_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.prd_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (category_id, slug)
);

-- ==========================================
-- 3. MASTER PRODUCTS & VARIANTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.prd_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    brand_id UUID REFERENCES public.prd_brands(id) ON DELETE SET NULL,
    manufacturer_id UUID REFERENCES public.prd_manufacturers(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.prd_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.prd_subcategories(id) ON DELETE SET NULL,
    tax_class_id UUID REFERENCES public.prd_tax_classes(id) ON DELETE SET NULL,
    status public.enum_product_status DEFAULT 'DRAFT',
    search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B')) STORED,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (org_id, slug)
);
CREATE INDEX idx_prd_products_search ON public.prd_products USING GIN (search_vector);
CREATE INDEX idx_prd_products_org ON public.prd_products(org_id, status);

CREATE TABLE IF NOT EXISTS public.prd_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    barcode TEXT,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"color": "Red", "size": "XL"}
    weight_kg NUMERIC CHECK (weight_kg >= 0),
    dimensions_cm JSONB, -- {"l": 10, "w": 10, "h": 10}
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (product_id, sku)
);
CREATE INDEX idx_prd_variants_sku ON public.prd_variants(sku);

-- ==========================================
-- 4. PRODUCT DETAILS & SEO
-- ==========================================

CREATE TABLE IF NOT EXISTS public.prd_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.prd_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    media_type public.enum_media_type NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.prd_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    spec_key TEXT NOT NULL,
    spec_value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    attr_key TEXT NOT NULL,
    attr_values TEXT[] NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_seo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    canonical_url TEXT,
    og_image_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (product_id)
);

-- ==========================================
-- 5. RELATIONS, BUNDLES, REVIEWS & PRICING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.prd_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    related_product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    relation_type public.enum_relation_type NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (primary_product_id, related_product_id, relation_type)
);

CREATE TABLE IF NOT EXISTS public.prd_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    status public.enum_product_status DEFAULT 'ACTIVE',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.prd_bundles(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (bundle_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.prd_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.prd_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'PENDING',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.prd_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    base_price NUMERIC NOT NULL CHECK (base_price >= 0),
    compare_at_price NUMERIC CHECK (compare_at_price >= 0),
    cost_price NUMERIC CHECK (cost_price >= 0),
    currency TEXT DEFAULT 'INR',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(variant_id)
);

CREATE TABLE IF NOT EXISTS public.prd_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    old_base_price NUMERIC,
    new_base_price NUMERIC NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason TEXT
);

-- ==========================================
-- 6. SUPPLY CHAIN: WAREHOUSE & PO
-- ==========================================

CREATE TABLE IF NOT EXISTS public.inv_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address JSONB,
    tax_id TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.inv_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.org_branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.inv_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.inv_suppliers(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES public.inv_warehouses(id) ON DELETE CASCADE,
    po_number TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SENT, PARTIAL, COMPLETED, CANCELLED
    expected_delivery_date DATE,
    total_amount NUMERIC DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.inv_purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES public.inv_purchase_orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    ordered_qty INTEGER NOT NULL CHECK (ordered_qty > 0),
    received_qty INTEGER DEFAULT 0 CHECK (received_qty >= 0),
    unit_cost NUMERIC NOT NULL CHECK (unit_cost >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 7. INVENTORY, SERIALS & STOCK TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.inv_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES public.inv_warehouses(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    reorder_level INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (warehouse_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.inv_serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.inv_warehouses(id) ON DELETE SET NULL,
    serial_number TEXT NOT NULL,
    rfid_tag TEXT,
    barcode TEXT,
    status TEXT DEFAULT 'IN_STOCK', -- IN_STOCK, SOLD, RETURNED, DAMAGED
    po_id UUID REFERENCES public.inv_purchase_orders(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (variant_id, serial_number)
);
CREATE INDEX idx_inv_serial_rfid ON public.inv_serial_numbers(rfid_tag);

CREATE TABLE IF NOT EXISTS public.inv_stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    from_warehouse_id UUID NOT NULL REFERENCES public.inv_warehouses(id) ON DELETE CASCADE,
    to_warehouse_id UUID NOT NULL REFERENCES public.inv_warehouses(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT DEFAULT 'PENDING', -- PENDING, IN_TRANSIT, COMPLETED, CANCELLED
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (from_warehouse_id != to_warehouse_id)
);

CREATE TABLE IF NOT EXISTS public.inv_stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES public.inv_warehouses(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL, -- positive or negative
    reason TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.inv_stock_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES public.inv_warehouses(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    movement_type public.enum_stock_movement NOT NULL,
    quantity_changed INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_id UUID, -- e.g., PO ID, Order ID, Transfer ID
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inv_stock_history_variant ON public.inv_stock_history(variant_id, warehouse_id, recorded_at);

-- ==========================================
-- 8. TRIGGERS & POLICIES (DYNAMIC)
-- ==========================================



-- 9. SECURITY POLICIES
-- Core Superadmin Policies


-- Specialized Public/Staff Policies
CREATE POLICY "Public can view active categories" ON public.prd_categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view active products" ON public.prd_products FOR SELECT USING (status = 'ACTIVE' AND deleted_at IS NULL);
CREATE POLICY "Public can view variants of active products" ON public.prd_variants FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view product media" ON public.prd_media FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view product pricing" ON public.prd_pricing FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view active reviews" ON public.prd_reviews FOR SELECT USING (status = 'APPROVED' AND deleted_at IS NULL);

-- Staff Policies via `org_id` context
CREATE POLICY "Staff can view org products" ON public.prd_products FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Staff can view org inventory" ON public.inv_stock FOR SELECT USING (
    warehouse_id IN (SELECT id FROM public.inv_warehouses WHERE org_id = public.get_current_org_id())
);


-- ==========================================
-- MODULE: 20260715000004_website_cms.sql
-- ==========================================


-- Migration: Enterprise Website CMS Architecture
-- Encompasses Pages, Blogs, Theming, Navigation, SEO, Components, and Media.

-- 1. ENUMS






-- ==========================================
-- 2. GLOBAL SETTINGS & THEMING
-- ==========================================

-- Website Settings (Key-Value for Company Details, Contact Settings, Scripts, Robots, Social Media)
CREATE TABLE IF NOT EXISTS public.cms_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cms_settings_key ON public.cms_settings(key);

-- Theme Configuration
CREATE TABLE IF NOT EXISTS public.cms_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    colors JSONB NOT NULL DEFAULT '{}'::jsonb,
    typography JSONB NOT NULL DEFAULT '{}'::jsonb,
    layout JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_cms_themes_active ON public.cms_themes(is_active) WHERE is_active = true AND deleted_at IS NULL;

-- Redirects
CREATE TABLE IF NOT EXISTS public.cms_redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT NOT NULL UNIQUE,
    destination_path TEXT NOT NULL,
    type public.enum_redirect_type DEFAULT '301',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cms_redirects_source ON public.cms_redirects(source_path);

-- ==========================================
-- 3. MEDIA & GALLERIES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.cms_media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL UNIQUE,
    mime_type TEXT,
    size_bytes BIGINT,
    alt_text TEXT,
    title TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID NOT NULL REFERENCES public.cms_galleries(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES public.cms_media_library(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(gallery_id, media_id)
);

-- ==========================================
-- 4. NAVIGATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.cms_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location public.enum_nav_location NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(location)
);

CREATE TABLE IF NOT EXISTS public.cms_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID NOT NULL REFERENCES public.cms_menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.cms_menu_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    open_in_new_tab BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cms_menu_items_menu_id ON public.cms_menu_items(menu_id);

-- ==========================================
-- 5. PAGES & SEO
-- ==========================================

CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_homepage BOOLEAN DEFAULT false,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    status public.enum_cms_status DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX idx_cms_pages_homepage ON public.cms_pages(is_homepage) WHERE is_homepage = true AND deleted_at IS NULL;
CREATE INDEX idx_cms_pages_slug ON public.cms_pages(slug);

CREATE TABLE IF NOT EXISTS public.cms_seo_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL, -- 'PAGE', 'BLOG'
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    include_in_sitemap BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (entity_id, entity_type)
);
CREATE INDEX idx_cms_seo_meta_entity ON public.cms_seo_meta(entity_type, entity_id);

-- ==========================================
-- 6. UI COMPONENTS (Isolated Tables as Requested)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.cms_heroes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    cta_url TEXT,
    background_media_id UUID REFERENCES public.cms_media_library(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT,
    media_id UUID REFERENCES public.cms_media_library(id) ON DELETE SET NULL,
    placement TEXT DEFAULT 'GLOBAL',
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

CREATE TABLE IF NOT EXISTS public.cms_popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    trigger_type TEXT DEFAULT 'ON_LOAD', -- e.g., 'ON_LOAD', 'EXIT_INTENT', 'SCROLL'
    delay_seconds INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 7. BLOG ENGINE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.cms_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    social_links JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.cms_blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.cms_blog_categories(id) ON DELETE SET NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    author_id UUID REFERENCES public.cms_authors(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.cms_blog_categories(id) ON DELETE SET NULL,
    featured_image_id UUID REFERENCES public.cms_media_library(id) ON DELETE SET NULL,
    status public.enum_cms_status DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    read_time_minutes INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cms_blogs_slug ON public.cms_blogs(slug);
CREATE INDEX idx_cms_blogs_author ON public.cms_blogs(author_id);

CREATE TABLE IF NOT EXISTS public.cms_blog_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_blog_post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL REFERENCES public.cms_blogs(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.cms_blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(blog_id, tag_id)
);

-- ==========================================
-- 8. USER ENGAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.cms_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_role TEXT,
    company_name TEXT,
    avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    status public.enum_cms_status DEFAULT 'DRAFT',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'SUBSCRIBED' CHECK (status IN ('SUBSCRIBED', 'UNSUBSCRIBED')),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 9. TRIGGERS & POLICIES
-- ==========================================



-- Specialized Public Policies
CREATE POLICY "Public can view active settings" ON public.cms_settings FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view active themes" ON public.cms_themes FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view active redirects" ON public.cms_redirects FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view published pages" ON public.cms_pages FOR SELECT USING (status = 'PUBLISHED' AND deleted_at IS NULL);
CREATE POLICY "Public can view published blogs" ON public.cms_blogs FOR SELECT USING (status = 'PUBLISHED' AND deleted_at IS NULL);
CREATE POLICY "Public can view authors" ON public.cms_authors FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view blog categories" ON public.cms_blog_categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view seo meta" ON public.cms_seo_meta FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view menus" ON public.cms_menus FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view menu items" ON public.cms_menu_items FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public can view heroes" ON public.cms_heroes FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view banners" ON public.cms_banners FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view popups" ON public.cms_popups FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view announcements" ON public.cms_announcements FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can view testimonials" ON public.cms_testimonials FOR SELECT USING (status = 'PUBLISHED' AND deleted_at IS NULL);
CREATE POLICY "Public can view faqs" ON public.cms_faqs FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Public can insert newsletter emails" ON public.cms_newsletters FOR INSERT WITH CHECK (true);


-- ==========================================
-- MODULE: 20260715000007_crm_customers.sql
-- ==========================================


-- Migration: CRM & Customer E-Commerce Profiles
-- Encompasses Identity, Wallets, Loyalty, Addresses, and Carts.

-- ==========================================
-- 1. ENUMS
-- ==========================================








-- ==========================================
-- 2. CUSTOMER IDENTITY & SEGMENTATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.crm_customer_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    discount_percentage NUMERIC DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.crm_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null if Guest checkout/lead
    group_id UUID REFERENCES public.crm_customer_groups(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    tax_id TEXT,
    status public.enum_crm_status DEFAULT 'ACTIVE',
    lifetime_value NUMERIC DEFAULT 0 CHECK (lifetime_value >= 0),
    last_purchase_date TIMESTAMPTZ,
    search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(first_name, '')), 'A') || setweight(to_tsvector('english', coalesce(last_name, '')), 'B') || setweight(to_tsvector('english', coalesce(email, '')), 'C')) STORED,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_crm_customers_org ON public.crm_customers(org_id);
CREATE INDEX idx_crm_customers_user ON public.crm_customers(user_id);
CREATE INDEX idx_crm_customers_search ON public.crm_customers USING GIN (search_vector);
CREATE UNIQUE INDEX idx_crm_customers_email ON public.crm_customers(org_id, email) WHERE email IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_crm_customers_phone ON public.crm_customers(org_id, phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.crm_customer_group_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.crm_customer_groups(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, group_id)
);

-- ==========================================
-- 3. PROFILE DETAILS (Addresses, Cards, Prefs)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.crm_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    address_type public.enum_address_type DEFAULT 'BOTH',
    full_name TEXT NOT NULL,
    phone TEXT,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default_billing BOOLEAN DEFAULT false,
    is_default_shipping BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.crm_saved_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    payment_gateway TEXT NOT NULL, -- e.g., 'STRIPE', 'RAZORPAY'
    gateway_token TEXT NOT NULL, -- The opaque reference token
    brand TEXT NOT NULL, -- e.g., 'Visa', 'MasterCard'
    last4 TEXT NOT NULL CHECK (length(last4) = 4),
    exp_month INTEGER NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
    exp_year INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
-- Note: No actual PAN or CVV is stored, strictly PCI compliant.

CREATE TABLE IF NOT EXISTS public.crm_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    marketing_opt_in BOOLEAN DEFAULT false,
    sms_opt_in BOOLEAN DEFAULT false,
    preferred_language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    custom_preferences JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(customer_id)
);

-- ==========================================
-- 4. E-COMMERCE ACTIVITY (Wishlist, Carts)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.crm_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(customer_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.crm_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    session_token TEXT, -- For guest carts
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CONVERTED, ABANDONED
    currency TEXT DEFAULT 'USD',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (customer_id IS NOT NULL OR session_token IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.crm_cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.crm_carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_addition NUMERIC,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(cart_id, variant_id)
);

-- ==========================================
-- 5. LOYALTY, WALLET & REFERRALS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.crm_loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    min_spend NUMERIC NOT NULL DEFAULT 0,
    point_multiplier NUMERIC NOT NULL DEFAULT 1.0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.crm_reward_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    current_balance INTEGER GENERATED ALWAYS AS (points_earned - points_spent) STORED,
    tier_id UUID REFERENCES public.crm_loyalty_tiers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(customer_id)
);

CREATE TABLE IF NOT EXISTS public.crm_reward_point_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    transaction_type public.enum_wallet_tx_type NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    description TEXT,
    reference_id UUID, -- E.g., Order ID
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    currency TEXT NOT NULL DEFAULT 'USD',
    balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(customer_id, currency)
);

CREATE TABLE IF NOT EXISTS public.crm_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.crm_wallets(id) ON DELETE CASCADE,
    transaction_type public.enum_wallet_tx_type NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    balance_after NUMERIC NOT NULL CHECK (balance_after >= 0),
    description TEXT,
    reference_id UUID, -- E.g., Refund Order ID, Top-up payment ID
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    referred_customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'PENDING', -- PENDING, CONVERTED
    reward_issued BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(referred_customer_id)
);

-- ==========================================
-- 6. CRM TIMELINE & INTERNAL TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.crm_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Staff/Agent ID
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.crm_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    doc_type public.enum_doc_type NOT NULL,
    file_url TEXT NOT NULL,
    title TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.crm_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'REGISTERED', 'ORDER_PLACED', 'SUPPORT_TICKET'
    description TEXT NOT NULL,
    metadata JSONB,
    reference_id UUID,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Immutable event ledger

-- ==========================================
-- 7. TRIGGERS & RLS AUTOMATION
-- ==========================================



-- Enable RLS for immutable ledgers as well
ALTER TABLE public.crm_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_reward_point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_timeline ENABLE ROW LEVEL SECURITY;

-- 8. SECURITY POLICIES

-- Superadmin & Staff Policies


-- End-User Policies (Can view/manage their own data if linked to auth.uid via user_id in crm_customers)
-- Note: A helper function resolves auth.uid() to customer_id(s).
CREATE OR REPLACE FUNCTION public.get_my_customer_ids()
RETURNS SETOF UUID AS $$
    SELECT id FROM public.crm_customers WHERE user_id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Apply end-user policies


-- ==========================================
-- MODULE: 20260715000008_sales_crm_leads.sql
-- ==========================================


-- Migration: Sales CRM & Lead Management
-- Encompasses Pipelines, Stages, Leads, Opportunities, Activities, and Scoring.

-- ==========================================
-- 1. ENUMS
-- ==========================================








-- ==========================================
-- 2. PIPELINES & CONFIGURATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sls_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.sls_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES public.sls_pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    probability_percentage NUMERIC DEFAULT 0 CHECK (probability_percentage >= 0 AND probability_percentage <= 100),
    is_won_stage BOOLEAN DEFAULT false,
    is_lost_stage BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(pipeline_id, name)
);

CREATE TABLE IF NOT EXISTS public.sls_lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Website Form', 'Trade Show', 'Referral'
    cost_per_lead NUMERIC DEFAULT 0 CHECK (cost_per_lead >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

-- ==========================================
-- 3. LEADS & OPPORTUNITIES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sls_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    job_title TEXT,
    source_id UUID REFERENCES public.sls_lead_sources(id) ON DELETE SET NULL,
    status public.enum_sls_lead_status DEFAULT 'NEW',
    lead_score INTEGER DEFAULT 0, -- Auto-calculated or manual rating
    converted_customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL, -- Bridges Sales CRM to Operational CRM
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(first_name, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(last_name, '')), 'B') || 
        setweight(to_tsvector('english', coalesce(company_name, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(email, '')), 'D')
    ) STORED,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_sls_leads_org ON public.sls_leads(org_id);
CREATE INDEX idx_sls_leads_search ON public.sls_leads USING GIN (search_vector);
CREATE UNIQUE INDEX idx_sls_leads_email ON public.sls_leads(org_id, email) WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.sls_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE CASCADE, -- An Opportunity usually stems from a Lead
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE, -- Alternatively stems from an existing customer
    pipeline_id UUID NOT NULL REFERENCES public.sls_pipelines(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES public.sls_stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    expected_revenue NUMERIC NOT NULL DEFAULT 0 CHECK (expected_revenue >= 0),
    expected_close_date DATE,
    actual_close_date DATE,
    status public.enum_sls_opp_status DEFAULT 'OPEN',
    loss_reason TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (lead_id IS NOT NULL OR customer_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.sls_lead_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.sls_opportunities(id) ON DELETE CASCADE,
    sales_executive_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Mapping to specific Sales Rep
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL)
);
CREATE INDEX idx_sls_lead_assignments_exec ON public.sls_lead_assignments(sales_executive_id);

-- ==========================================
-- 4. SALES ACTIVITIES & ENGAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sls_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    activity_type public.enum_sls_activity_type NOT NULL, -- TASK, MEETING, CALL, FOLLOW_UP
    title TEXT NOT NULL,
    description TEXT,
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.sls_opportunities(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status public.enum_sls_activity_status DEFAULT 'PENDING',
    outcome TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_sls_activities_assigned ON public.sls_activities(assigned_to, status);

CREATE TABLE IF NOT EXISTS public.sls_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.sls_opportunities(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Sales Exec ID
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.sls_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.sls_opportunities(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'STAGE_CHANGED', 'LEAD_ASSIGNED', 'CALL_LOGGED'
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    metadata JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL)
);
-- Immutable event ledger

-- ==========================================
-- 5. TRIGGERS & RLS AUTOMATION
-- ==========================================



-- Enable RLS for ledgers and assignment tables
ALTER TABLE public.sls_lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sls_timeline ENABLE ROW LEVEL SECURITY;

-- 6. SECURITY POLICIES

-- Superadmin & Staff General Access (scoped by org_id)


-- Sales Executive Access Control (Visibility based on Assignments)
-- A Sales Exec can only see leads/opportunities they are assigned to.
CREATE POLICY "Sales Execs view assigned leads" ON public.sls_leads FOR SELECT USING (
    id IN (SELECT lead_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Sales Execs update assigned leads" ON public.sls_leads FOR UPDATE USING (
    id IN (SELECT lead_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Sales Execs view assigned ops" ON public.sls_opportunities FOR SELECT USING (
    id IN (SELECT opportunity_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true) OR
    lead_id IN (SELECT lead_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Sales Execs update assigned ops" ON public.sls_opportunities FOR UPDATE USING (
    id IN (SELECT opportunity_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true) OR
    lead_id IN (SELECT lead_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Sales Execs view own assignments" ON public.sls_lead_assignments FOR SELECT USING (sales_executive_id = auth.uid());

CREATE POLICY "Sales Execs manage own activities" ON public.sls_activities FOR ALL USING (assigned_to = auth.uid());

-- Sales Execs can view notes and timelines for their assigned leads/ops
CREATE POLICY "Sales Execs view assigned notes" ON public.sls_notes FOR SELECT USING (
    lead_id IN (SELECT lead_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true) OR
    opportunity_id IN (SELECT opportunity_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Sales Execs view assigned timeline" ON public.sls_timeline FOR SELECT USING (
    lead_id IN (SELECT lead_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true) OR
    opportunity_id IN (SELECT opportunity_id FROM public.sls_lead_assignments WHERE sales_executive_id = auth.uid() AND is_active = true)
);


-- ==========================================
-- MODULE: 20260715000009_oms_billing.sql
-- ==========================================


-- Migration: Enterprise Order Management System (OMS) & Billing
-- Encompasses Quotes, Orders, Invoices, Logistics, Returns, and Promotions.

-- ==========================================
-- 1. ENUMS
-- ==========================================






-- ==========================================
-- 2. PRE-SALE: QUOTATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oms_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE SET NULL, -- Can stem from Sales CRM
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
    valid_until DATE NOT NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total_tax NUMERIC NOT NULL DEFAULT 0,
    total_discount NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    terms_conditions TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (customer_id IS NOT NULL OR lead_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.oms_quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.oms_quotations(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    line_total NUMERIC GENERATED ALWAYS AS ((quantity * unit_price) + (quantity * unit_price * tax_rate / 100) - discount_amount) STORED,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 3. PROMOTIONS & REWARDS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oms_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL, -- PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
    discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
    min_order_value NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    usage_limit INTEGER, -- NULL means unlimited
    times_used INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- BOGO, BULK_BUY, CATEGORY_DISCOUNT
    conditions JSONB NOT NULL, -- e.g., {"buy_qty": 2, "get_qty": 1}
    discount_value NUMERIC NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    initial_balance NUMERIC NOT NULL CHECK (initial_balance >= 0),
    current_balance NUMERIC NOT NULL CHECK (current_balance >= 0),
    currency TEXT DEFAULT 'USD',
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 4. CORE ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oms_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    billing_address_id UUID REFERENCES public.crm_addresses(id) ON DELETE SET NULL,
    shipping_address_id UUID REFERENCES public.crm_addresses(id) ON DELETE SET NULL,
    quotation_id UUID REFERENCES public.oms_quotations(id) ON DELETE SET NULL,
    coupon_id UUID REFERENCES public.oms_coupons(id) ON DELETE SET NULL,
    order_status public.enum_oms_order_status DEFAULT 'PENDING',
    payment_status public.enum_oms_payment_status DEFAULT 'UNPAID',
    currency TEXT DEFAULT 'USD',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total_tax NUMERIC NOT NULL DEFAULT 0,
    total_discount NUMERIC NOT NULL DEFAULT 0,
    shipping_fee NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    customer_notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(order_number, '')), 'A')
    ) STORED
);
CREATE INDEX idx_oms_orders_search ON public.oms_orders USING GIN (search_vector);
CREATE INDEX idx_oms_orders_customer ON public.oms_orders(customer_id, created_at);

CREATE TABLE IF NOT EXISTS public.oms_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.oms_orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.inv_warehouses(id) ON DELETE SET NULL, -- Fulfilling warehouse
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    line_total NUMERIC GENERATED ALWAYS AS ((quantity * unit_price) + (quantity * unit_price * tax_rate / 100) - discount_amount) STORED,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Function & Trigger to automatically deduct inventory when an order is Confirmed
CREATE OR REPLACE FUNCTION public.fn_oms_deduct_inventory()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    IF NEW.order_status = 'CONFIRMED' AND OLD.order_status != 'CONFIRMED' THEN
        FOR item IN SELECT variant_id, warehouse_id, quantity FROM public.oms_order_items WHERE order_id = NEW.id
        LOOP
            -- Deduct stock if a warehouse is assigned
            IF item.warehouse_id IS NOT NULL THEN
                UPDATE public.inv_stock
                SET quantity_on_hand = quantity_on_hand - item.quantity,
                    updated_at = NOW()
                WHERE variant_id = item.variant_id AND warehouse_id = item.warehouse_id;
                
                -- Log immutable history
                INSERT INTO public.inv_stock_history (warehouse_id, variant_id, movement_type, quantity_changed, quantity_after, reference_id)
                VALUES (
                    item.warehouse_id, 
                    item.variant_id, 
                    'SALE', 
                    -(item.quantity), 
                    (SELECT quantity_on_hand FROM public.inv_stock WHERE variant_id = item.variant_id AND warehouse_id = item.warehouse_id),
                    NEW.id
                );
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_oms_deduct_inventory
    AFTER UPDATE OF order_status ON public.oms_orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_oms_deduct_inventory();

-- ==========================================
-- 5. BILLING & FINANCE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oms_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.oms_orders(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, ISSUED, PAID, VOID
    amount_due NUMERIC NOT NULL,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.oms_orders(id) ON DELETE CASCADE,
    tax_name TEXT NOT NULL, -- e.g., 'CGST 9%', 'SGST 9%'
    tax_amount NUMERIC NOT NULL CHECK (tax_amount >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.oms_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.oms_invoices(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL, -- e.g., 'CREDIT_CARD', 'WALLET', 'CASH'
    gateway_reference TEXT, -- Stripe Charge ID, Razorpay Payment ID
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    status public.enum_oms_payment_status DEFAULT 'PENDING',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.oms_payments(id) ON DELETE CASCADE,
    event_status TEXT NOT NULL, -- INITIATED, SUCCESS, FAILED
    gateway_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Immutable ledger

-- ==========================================
-- 6. LOGISTICS & TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oms_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.oms_orders(id) ON DELETE CASCADE,
    tracking_number TEXT,
    carrier TEXT, -- e.g., FedEx, DHL
    status public.enum_oms_shipment_status DEFAULT 'PENDING',
    weight_kg NUMERIC,
    dimensions_cm JSONB,
    estimated_delivery_date DATE,
    shipping_label_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.oms_shipments(id) ON DELETE CASCADE,
    delivery_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vehicle_registration TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    proof_of_delivery_url TEXT,
    recipient_signature_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_tracking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.oms_shipments(id) ON DELETE CASCADE,
    status public.enum_oms_shipment_status NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Immutable ledger

-- ==========================================
-- 7. RETURNS & REFUNDS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.oms_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.oms_order_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    reason TEXT NOT NULL,
    condition TEXT NOT NULL, -- e.g., 'UNOPENED', 'DAMAGED'
    status TEXT DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, REJECTED, RECEIVED
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.oms_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID REFERENCES public.oms_returns(id) ON DELETE SET NULL,
    payment_id UUID NOT NULL REFERENCES public.oms_payments(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    refund_method TEXT NOT NULL, -- 'ORIGINAL_GATEWAY', 'WALLET', 'STORE_CREDIT'
    status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    gateway_reference TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 8. TRIGGERS & RLS AUTOMATION
-- ==========================================



ALTER TABLE public.oms_payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oms_tracking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oms_taxes ENABLE ROW LEVEL SECURITY;

-- 9. SECURITY POLICIES

-- Superadmin & Staff General Access (scoped by org_id where applicable)


-- End-User Policies (Customers can only view their own orders and related entities)
-- Note: Reusing get_my_customer_ids() from script 000007
CREATE POLICY "Users view own quotations" ON public.oms_quotations FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Users view own orders" ON public.oms_orders FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Users view own order items" ON public.oms_order_items FOR SELECT USING (order_id IN (SELECT id FROM public.oms_orders WHERE customer_id IN (SELECT public.get_my_customer_ids())));
CREATE POLICY "Users view own invoices" ON public.oms_invoices FOR SELECT USING (order_id IN (SELECT id FROM public.oms_orders WHERE customer_id IN (SELECT public.get_my_customer_ids())));
CREATE POLICY "Users view own shipments" ON public.oms_shipments FOR SELECT USING (order_id IN (SELECT id FROM public.oms_orders WHERE customer_id IN (SELECT public.get_my_customer_ids())));
CREATE POLICY "Users view own returns" ON public.oms_returns FOR SELECT USING (order_item_id IN (SELECT id FROM public.oms_order_items WHERE order_id IN (SELECT id FROM public.oms_orders WHERE customer_id IN (SELECT public.get_my_customer_ids()))));
CREATE POLICY "Users view own gift cards" ON public.oms_gift_cards FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));


-- ==========================================
-- MODULE: 20260715000010_waba_enterprise_chat.sql
-- ==========================================


-- Migration: Enterprise WABA (WhatsApp Business API)
-- Encompasses Chat, Routing, Messaging Engine, Campaigns, and AI Automation.

-- ==========================================
-- 1. ENUMS
-- ==========================================








-- ==========================================
-- 2. ROUTING CONFIG (Departments, Teams, Queues)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.wab_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.wab_departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wab_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.wab_teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    routing_strategy TEXT DEFAULT 'ROUND_ROBIN', -- ROUND_ROBIN, LONGEST_IDLE, MANUAL
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 3. CORE CHATS & CONVERSATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_phone TEXT NOT NULL,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL, -- Nullable for unknown leads
    waba_phone_id TEXT NOT NULL, -- The specific Meta Phone ID serving this chat
    status public.enum_wab_conv_status DEFAULT 'OPEN',
    priority public.enum_wab_priority DEFAULT 'NORMAL',
    queue_id UUID REFERENCES public.wab_queues(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_snippet TEXT,
    unread_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_wab_conversations_phone ON public.wab_conversations(org_id, customer_phone);

CREATE TABLE IF NOT EXISTS public.wab_conversation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    assigned_to_user UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to_team UUID REFERENCES public.wab_teams(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (assigned_to_user IS NOT NULL OR assigned_to_team IS NOT NULL)
);
CREATE INDEX idx_wab_conv_assignments_user ON public.wab_conversation_assignments(assigned_to_user) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS public.wab_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_hex TEXT DEFAULT '#000000',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wab_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES public.wab_labels(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(conversation_id, label_id)
);

-- ==========================================
-- 4. MESSAGING ENGINE & STATUS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    waba_message_id TEXT UNIQUE, -- Meta's specific message ID (wamg...)
    direction public.enum_wab_msg_direction NOT NULL,
    message_type TEXT NOT NULL, -- text, image, document, template, interactive
    content_text TEXT,
    content_json JSONB, -- Fallback for interactive/buttons payloads
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Agent who sent it, NULL if AI/Customer
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Note: Messages are immutable payloads. We do not track updated_at.

CREATE TABLE IF NOT EXISTS public.wab_message_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.wab_messages(id) ON DELETE CASCADE,
    waba_message_id TEXT NOT NULL,
    status public.enum_wab_msg_status NOT NULL,
    error_code TEXT,
    error_description TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Delivery Report Ledger (Immutable appending of sent -> delivered -> read)
CREATE INDEX idx_wab_message_status_msg ON public.wab_message_status(message_id, timestamp);

CREATE TABLE IF NOT EXISTS public.wab_message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    payload JSONB NOT NULL, -- Complete JSON required for Meta API
    target_phone TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wab_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE SET NULL,
    payload JSONB NOT NULL,
    event_type TEXT,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Debugging ledger
CREATE INDEX idx_wab_webhook_logs_processed ON public.wab_webhook_logs(processed);

-- ==========================================
-- 5. MEDIA & FILES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.wab_messages(id) ON DELETE SET NULL,
    waba_media_id TEXT, -- Meta's media reference ID
    file_type TEXT NOT NULL, -- image/jpeg, application/pdf
    file_url TEXT NOT NULL, -- Internal storage URL after download
    file_size_bytes BIGINT,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. AI & AGENT AUGMENTATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wab_ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    sentiment_score NUMERIC,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wab_ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    suggested_reply TEXT NOT NULL,
    confidence_score NUMERIC,
    is_used BOOLEAN DEFAULT false,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wab_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wab_auto_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    trigger_keyword TEXT, -- If NULL, applies generally based on rule_type
    rule_type TEXT NOT NULL, -- OOH (Out of Hours), WELCOME, KEYWORD
    reply_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 7. BROADCASTS & CAMPAIGNS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    waba_template_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- MARKETING, UTILITY, AUTHENTICATION
    language TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    components JSONB NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wab_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wab_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.wab_campaigns(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.wab_templates(id) ON DELETE CASCADE,
    target_group_id UUID REFERENCES public.crm_customer_groups(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, RUNNING, COMPLETED, CANCELLED
    scheduled_for TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.wab_broadcast_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES public.wab_broadcasts(id) ON DELETE CASCADE,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_read INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    total_replied INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 8. TIMELINE & HISTORY
-- ==========================================

CREATE TABLE IF NOT EXISTS public.wab_customer_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.wab_conversations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'AGENT_ASSIGNED', 'SNOOZED', 'BOT_ESCALATED'
    description TEXT NOT NULL,
    metadata JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Immutable ledger for tracking exact progression of a chat.

-- ==========================================
-- 9. TRIGGERS & RLS AUTOMATION
-- ==========================================



-- Enable RLS for ledgers
ALTER TABLE public.wab_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wab_message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wab_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wab_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wab_customer_timeline ENABLE ROW LEVEL SECURITY;

-- 10. SECURITY POLICIES

-- Superadmin & Staff General Access (scoped by org_id)


-- Agent View Context (Agents can only view conversations explicitly assigned to them or their team, plus unassigned queued chats)
CREATE POLICY "Agents view assigned or unassigned convos" ON public.wab_conversations FOR SELECT USING (
    id IN (
        SELECT conversation_id FROM public.wab_conversation_assignments 
        WHERE (assigned_to_user = auth.uid() OR assigned_to_team IN (
            -- Subquery: get teams agent belongs to (requires mapping table, simplified here to just user check for now)
            -- For standard MVP, just checking user assignment. If no assignments exist, allow if status is OPEN.
            SELECT id FROM public.wab_teams LIMIT 0
        )) AND is_active = true
    )
    OR
    (NOT EXISTS (SELECT 1 FROM public.wab_conversation_assignments WHERE conversation_id = wab_conversations.id AND is_active = true))
);

CREATE POLICY "Agents view messages for viewable convos" ON public.wab_messages FOR SELECT USING (
    conversation_id IN (
        SELECT id FROM public.wab_conversations WHERE org_id = public.get_current_org_id() -- simplified policy for massive tables, relies on RLS chaining if needed
    )
);


-- ==========================================
-- MODULE: 20260715000011_marketing_omnichannel.sql
-- ==========================================


-- Migration: Enterprise Marketing & Omnichannel Engine
-- Encompasses Audiences, Campaigns, Broadcasts, Events, and Reviews.

-- ==========================================
-- 1. ENUMS
-- ==========================================




-- ==========================================
-- 2. AUDIENCE & SEGMENTATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.mkt_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_dynamic BOOLEAN DEFAULT false, -- If true, populated by Segments automatically
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS public.mkt_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience_id UUID NOT NULL REFERENCES public.mkt_audiences(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rule_logic JSONB NOT NULL, -- e.g., {"field": "total_spent", "operator": ">", "value": 500}
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_audience_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience_id UUID NOT NULL REFERENCES public.mkt_audiences(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.sls_leads(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_unsubscribed BOOLEAN DEFAULT false,
    CHECK (customer_id IS NOT NULL OR lead_id IS NOT NULL),
    UNIQUE(audience_id, customer_id),
    UNIQUE(audience_id, lead_id)
);
CREATE INDEX idx_mkt_aud_members_cust ON public.mkt_audience_members(customer_id);

-- ==========================================
-- 3. OMNICHANNEL CAMPAIGNS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status public.enum_mkt_campaign_status DEFAULT 'DRAFT',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    budget NUMERIC DEFAULT 0,
    -- Global UTM parameters to inject into links
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_email_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
    audience_id UUID NOT NULL REFERENCES public.mkt_audiences(id) ON DELETE CASCADE,
    subject_line TEXT NOT NULL,
    preheader_text TEXT,
    sender_name TEXT,
    sender_email TEXT,
    html_body TEXT NOT NULL,
    status public.enum_mkt_broadcast_status DEFAULT 'DRAFT',
    scheduled_for TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_sms_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
    audience_id UUID NOT NULL REFERENCES public.mkt_audiences(id) ON DELETE CASCADE,
    message_body TEXT NOT NULL,
    sender_id TEXT, -- e.g., 'TECBUNNY'
    status public.enum_mkt_broadcast_status DEFAULT 'DRAFT',
    scheduled_for TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_social_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- FACEBOOK, LINKEDIN, GOOGLE_ADS
    external_ad_id TEXT,
    ad_creative_url TEXT,
    ad_copy TEXT,
    daily_budget NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'DRAFT',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 4. LEAD GENERATION & PROMOTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.mkt_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    promotion_type TEXT NOT NULL, -- e.g., 'HOLIDAY_SALE', 'FLASH_SALE'
    -- Links to OMS Coupons or CRM Referrals for the actual logic execution
    oms_coupon_id UUID REFERENCES public.oms_coupons(id) ON DELETE SET NULL,
    crm_referral_program_id UUID, -- Assuming future expansion or link to crm_referrals
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- WEBINAR, IN_PERSON, CONFERENCE
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location_url TEXT,
    max_capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    html_content TEXT,
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_lead_magnets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id UUID NOT NULL REFERENCES public.mkt_landing_pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_url TEXT NOT NULL, -- PDF, E-Book download link
    download_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 5. REVIEWS & REPUTATION MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.mkt_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.prd_products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.oms_orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    is_verified_purchase BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_google_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    gmb_review_id TEXT NOT NULL UNIQUE, -- Google My Business review ID
    reviewer_name TEXT NOT NULL,
    reviewer_photo_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    reply_text TEXT, -- Internal reply sent back to GMB
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- Synced at
);
-- External sync table, generally immutable outside of replies

-- Unified View for the Dashboard
CREATE OR REPLACE VIEW public.v_mkt_all_reviews AS
SELECT 
    id, org_id, 'NATIVE' AS source, rating, review_text, created_at, status
FROM public.mkt_reviews
UNION ALL
SELECT 
    id, org_id, 'GOOGLE_GMB' AS source, rating, review_text, created_at, 'APPROVED' AS status
FROM public.mkt_google_reviews;

-- ==========================================
-- 6. ANALYTICS LEDGER
-- ==========================================

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    channel TEXT NOT NULL, -- EMAIL, SMS, SOCIAL, WABA
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend NUMERIC DEFAULT 0,
    revenue_generated NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, date, channel)
);
-- Upsertable analytics ledger

-- ==========================================
-- 7. TRIGGERS & RLS AUTOMATION
-- ==========================================



ALTER TABLE public.mkt_google_reviews ENABLE ROW LEVEL SECURITY;

-- 8. SECURITY POLICIES

-- Superadmin & Staff General Access (scoped by org_id)


-- Public Access for Landing Pages & Active Native Reviews
CREATE POLICY "Public view landing pages" ON public.mkt_landing_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public view active native reviews" ON public.mkt_reviews FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Public view active events" ON public.mkt_events FOR SELECT USING (deleted_at IS NULL);


-- ==========================================
-- MODULE: 20260715000012_support_field_service.sql
-- ==========================================


-- Migration: Enterprise Support & Field Service Management (FSM)
-- Encompasses Helpdesk Ticketing, AMC/Warranty, Field Engineers, and Spare Parts.

-- ==========================================
-- 1. ENUMS
-- ==========================================








-- ==========================================
-- 2. ASSET & CONTRACT MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sup_customer_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    serial_number_id UUID REFERENCES public.inv_serial_numbers(id) ON DELETE SET NULL, -- Maps to specific physical unit
    order_id UUID REFERENCES public.oms_orders(id) ON DELETE SET NULL,
    installation_date DATE,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SCRAPPED
    location_address_id UUID REFERENCES public.crm_addresses(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_sup_customer_assets_cust ON public.sup_customer_assets(customer_id);

CREATE TABLE IF NOT EXISTS public.sup_warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.sup_customer_assets(id) ON DELETE CASCADE,
    warranty_type TEXT NOT NULL, -- STANDARD, EXTENDED
    provider TEXT NOT NULL, -- OEM, THIRD_PARTY
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms_conditions_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sup_amc_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.sup_customer_assets(id) ON DELETE CASCADE,
    contract_number TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_preventative_visits INTEGER NOT NULL DEFAULT 0,
    visits_completed INTEGER NOT NULL DEFAULT 0,
    contract_value NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED
    terms_conditions_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 3. CORE TICKETING (HELPDESK)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sup_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    ticket_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.sup_customer_assets(id) ON DELETE SET NULL,
    ticket_type public.enum_sup_ticket_type NOT NULL,
    priority public.enum_sup_priority DEFAULT 'MEDIUM',
    status public.enum_sup_ticket_status DEFAULT 'OPEN',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Helpdesk Agent
    due_date TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    is_sla_breached BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(ticket_number, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(subject, '')), 'B')
    ) STORED
);
CREATE INDEX idx_sup_tickets_search ON public.sup_tickets USING GIN (search_vector);
CREATE INDEX idx_sup_tickets_assigned ON public.sup_tickets(assigned_to, status);
CREATE INDEX idx_sup_tickets_customer ON public.sup_tickets(customer_id);

CREATE TABLE IF NOT EXISTS public.sup_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.sup_tickets(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if from customer (if no auth.users mapping exists)
    sender_customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT false, -- If true, invisible to customer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (sender_user_id IS NOT NULL OR sender_customer_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.sup_ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.sup_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.sup_ticket_messages(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sup_ticket_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.sup_tickets(id) ON DELETE CASCADE,
    resolution_code TEXT NOT NULL, -- e.g., 'HARDWARE_REPLACED', 'USER_ERROR'
    resolution_summary TEXT NOT NULL,
    resolved_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sup_ticket_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.sup_tickets(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    csat_score INTEGER NOT NULL CHECK (csat_score >= 1 AND csat_score <= 5),
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    feedback_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Immutable feedback record

-- ==========================================
-- 4. FIELD SERVICE MANAGEMENT (FSM)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sup_engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[], -- Array of specific skills/certifications
    service_area_radius_km INTEGER DEFAULT 50,
    base_location_lat NUMERIC,
    base_location_lng NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sup_engineer_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.sup_tickets(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES public.sup_engineers(id) ON DELETE CASCADE,
    visit_type public.enum_sup_ticket_type NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status public.enum_sup_visit_status DEFAULT 'SCHEDULED',
    address_id UUID REFERENCES public.crm_addresses(id) ON DELETE SET NULL,
    gps_checkin_lat NUMERIC,
    gps_checkin_lng NUMERIC,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_sup_engineer_visits_eng ON public.sup_engineer_visits(engineer_id, status);

CREATE TABLE IF NOT EXISTS public.sup_service_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.sup_engineer_visits(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES public.sup_engineers(id) ON DELETE CASCADE,
    work_done_summary TEXT NOT NULL,
    recommendations TEXT,
    customer_signature_url TEXT,
    is_signed_off BOOLEAN DEFAULT false,
    signed_off_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sup_spare_parts_used (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_report_id UUID NOT NULL REFERENCES public.sup_service_reports(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.prd_variants(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.inv_warehouses(id) ON DELETE SET NULL, -- The warehouse/van stock location to deduct from
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    is_billable BOOLEAN DEFAULT true, -- False if covered by warranty/AMC
    status TEXT DEFAULT 'PENDING_DEDUCTION', -- PENDING_DEDUCTION, CONSUMED, RETURNED
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Function & Trigger to automatically deduct inventory when a spare part is consumed
CREATE OR REPLACE FUNCTION public.fn_sup_deduct_spare_part_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CONSUMED' AND OLD.status != 'CONSUMED' THEN
        -- Deduct stock if a warehouse/van location is assigned
        IF NEW.warehouse_id IS NOT NULL THEN
            UPDATE public.inv_stock
            SET quantity_on_hand = quantity_on_hand - NEW.quantity,
                updated_at = NOW()
            WHERE variant_id = NEW.variant_id AND warehouse_id = NEW.warehouse_id;
            
            -- Log immutable history
            INSERT INTO public.inv_stock_history (warehouse_id, variant_id, movement_type, quantity_changed, quantity_after, reference_id)
            VALUES (
                NEW.warehouse_id, 
                NEW.variant_id, 
                'SPARE_PART_CONSUMED', 
                -(NEW.quantity), 
                (SELECT quantity_on_hand FROM public.inv_stock WHERE variant_id = NEW.variant_id AND warehouse_id = NEW.warehouse_id),
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sup_deduct_spare_part_inventory
    AFTER UPDATE OF status ON public.sup_spare_parts_used
    FOR EACH ROW EXECUTE FUNCTION public.fn_sup_deduct_spare_part_inventory();


-- ==========================================
-- 5. TRIGGERS & RLS AUTOMATION
-- ==========================================



ALTER TABLE public.sup_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sup_ticket_feedback ENABLE ROW LEVEL SECURITY;

-- 6. SECURITY POLICIES

-- Superadmin & Staff General Access (scoped by org_id)


-- Customer Access Policies (Customers see their own tickets, assets, AMCs, etc.)
-- Uses get_my_customer_ids() from script 000007
CREATE POLICY "Users view own assets" ON public.sup_customer_assets FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Users view own tickets" ON public.sup_tickets FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Users insert own tickets" ON public.sup_tickets FOR INSERT WITH CHECK (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Users view own messages" ON public.sup_ticket_messages FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.sup_tickets WHERE customer_id IN (SELECT public.get_my_customer_ids()))
    AND is_internal_note = false
);
CREATE POLICY "Users insert own messages" ON public.sup_ticket_messages FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.sup_tickets WHERE customer_id IN (SELECT public.get_my_customer_ids()))
);
CREATE POLICY "Users view own AMC" ON public.sup_amc_contracts FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));

-- Engineer Access Policies
-- Engineers can view and update their assigned visits and related service reports
CREATE POLICY "Engineers view own visits" ON public.sup_engineer_visits FOR SELECT USING (
    engineer_id IN (SELECT id FROM public.sup_engineers WHERE user_id = auth.uid())
);
CREATE POLICY "Engineers update own visits" ON public.sup_engineer_visits FOR UPDATE USING (
    engineer_id IN (SELECT id FROM public.sup_engineers WHERE user_id = auth.uid())
);
CREATE POLICY "Engineers manage own reports" ON public.sup_service_reports FOR ALL USING (
    engineer_id IN (SELECT id FROM public.sup_engineers WHERE user_id = auth.uid())
);
CREATE POLICY "Engineers view assigned ticket" ON public.sup_tickets FOR SELECT USING (
    id IN (SELECT ticket_id FROM public.sup_engineer_visits WHERE engineer_id IN (SELECT id FROM public.sup_engineers WHERE user_id = auth.uid()))
);


-- ==========================================
-- MODULE: 20260715000013_financial_accounting.sql
-- ==========================================


-- Migration: Enterprise Financial Accounting & General Ledger
-- Encompasses Chart of Accounts, Double-Entry Ledger, AR/AP, Taxation (GST), and Payroll tracking.

-- ==========================================
-- 1. ENUMS
-- ==========================================






-- ==========================================
-- 2. CHART OF ACCOUNTS (CoA)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type public.enum_fin_account_type NOT NULL,
    parent_account_id UUID REFERENCES public.fin_accounts(id) ON DELETE RESTRICT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false, -- e.g., 'Retained Earnings' which shouldn't be deleted
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, account_code)
);

-- ==========================================
-- 3. THE GENERAL LEDGER (Double-Entry)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fin_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL UNIQUE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT, -- Invoice number, Receipt number, etc.
    description TEXT NOT NULL,
    status public.enum_fin_entry_status DEFAULT 'DRAFT',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- No deleted_at. Journal Entries cannot be soft-deleted.

CREATE TABLE IF NOT EXISTS public.fin_ledger_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES public.fin_journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.fin_accounts(id) ON DELETE RESTRICT,
    description TEXT,
    dr_amount NUMERIC NOT NULL DEFAULT 0 CHECK (dr_amount >= 0),
    cr_amount NUMERIC NOT NULL DEFAULT 0 CHECK (cr_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (dr_amount > 0 OR cr_amount > 0)
);

-- STRICT DOUBLE-ENTRY COMPLIANCE TRIGGER
CREATE OR REPLACE FUNCTION public.fn_fin_enforce_double_entry()
RETURNS TRIGGER AS $$
DECLARE
    total_dr NUMERIC;
    total_cr NUMERIC;
    entry_status TEXT;
BEGIN
    SELECT status INTO entry_status FROM public.fin_journal_entries WHERE id = NEW.id;
    
    IF entry_status = 'POSTED' THEN
        SELECT COALESCE(SUM(dr_amount), 0), COALESCE(SUM(cr_amount), 0)
        INTO total_dr, total_cr
        FROM public.fin_ledger_lines
        WHERE journal_entry_id = NEW.id;
        
        IF total_dr != total_cr THEN
            RAISE EXCEPTION 'Double-entry violation: Debits (%) must equal Credits (%) for posted journal entry.', total_dr, total_cr;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_fin_enforce_double_entry
    AFTER UPDATE OF status ON public.fin_journal_entries
    FOR EACH ROW EXECUTE FUNCTION public.fn_fin_enforce_double_entry();

-- STRICT IMMUTABILITY TRIGGER
CREATE OR REPLACE FUNCTION public.fn_fin_enforce_immutability()
RETURNS TRIGGER AS $$
DECLARE
    entry_status TEXT;
BEGIN
    SELECT status INTO entry_status FROM public.fin_journal_entries WHERE id = OLD.journal_entry_id;
    
    IF entry_status = 'POSTED' THEN
        RAISE EXCEPTION 'Immutability violation: Cannot modify or delete ledger lines belonging to a POSTED journal entry. Reversals must be used.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_fin_enforce_immutability
    BEFORE UPDATE OR DELETE ON public.fin_ledger_lines
    FOR EACH ROW EXECUTE FUNCTION public.fn_fin_enforce_immutability();

-- ==========================================
-- 4. ACCOUNTS RECEIVABLE & PAYABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fin_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    oms_invoice_id UUID REFERENCES public.oms_invoices(id) ON DELETE SET NULL, -- Maps back to OMS billing
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total_tax NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC GENERATED ALWAYS AS (grand_total - amount_paid) STORED,
    status public.enum_fin_doc_status DEFAULT 'UNPAID',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.fin_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.inv_suppliers(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE RESTRICT,
    bill_number TEXT NOT NULL,
    reference TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    total_tax NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC GENERATED ALWAYS AS (grand_total - amount_paid) STORED,
    status public.enum_fin_doc_status DEFAULT 'UNPAID',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.fin_credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.fin_invoices(id) ON DELETE SET NULL,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE RESTRICT,
    credit_note_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'APPLIED',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fin_debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.inv_suppliers(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES public.fin_bills(id) ON DELETE SET NULL,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE RESTRICT,
    debit_note_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'APPLIED',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. BANKING & TREASURY
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fin_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.fin_accounts(id) ON DELETE RESTRICT, -- Map to specific CoA ledger
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_routing_code TEXT,
    currency TEXT DEFAULT 'USD',
    opening_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.fin_bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id UUID NOT NULL REFERENCES public.fin_bank_accounts(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE SET NULL, -- Set when reconciled
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    withdrawal_amount NUMERIC DEFAULT 0 CHECK (withdrawal_amount >= 0),
    deposit_amount NUMERIC DEFAULT 0 CHECK (deposit_amount >= 0),
    running_balance NUMERIC,
    is_reconciled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. TAXATION & GST COMPLIANCE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fin_tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'GST 18% (IGST)'
    tax_type TEXT NOT NULL, -- IGST, CGST, SGST, VAT
    rate_percentage NUMERIC NOT NULL CHECK (rate_percentage >= 0),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.fin_tax_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    tax_rate_id UUID NOT NULL REFERENCES public.fin_tax_rates(id) ON DELETE RESTRICT,
    journal_entry_id UUID NOT NULL REFERENCES public.fin_journal_entries(id) ON DELETE CASCADE,
    tax_direction TEXT NOT NULL, -- 'OUTPUT_TAX_LIABILITY' (Sales) or 'INPUT_TAX_CREDIT' (Purchases)
    taxable_amount NUMERIC NOT NULL,
    tax_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 7. EXPENSES: PAYROLL & COMMISSIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.fin_salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE RESTRICT,
    month_year TEXT NOT NULL, -- e.g., '2026-07'
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    allowances NUMERIC NOT NULL DEFAULT 0,
    deductions NUMERIC NOT NULL DEFAULT 0,
    net_salary NUMERIC GENERATED ALWAYS AS (basic_salary + allowances - deductions) STORED,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, APPROVED, PAID
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.fin_commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    sales_executive_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES public.fin_journal_entries(id) ON DELETE RESTRICT,
    opportunity_id UUID REFERENCES public.sls_opportunities(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.fin_invoices(id) ON DELETE SET NULL,
    commission_amount NUMERIC NOT NULL CHECK (commission_amount > 0),
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, PAID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 8. TRIGGERS & RLS AUTOMATION
-- ==========================================



-- Enable RLS for ledgers
ALTER TABLE public.fin_ledger_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_tax_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_commission_ledger ENABLE ROW LEVEL SECURITY;

-- 9. SECURITY POLICIES

-- Superadmin & Staff General Access (scoped by org_id)
-- Finance data is extremely sensitive. Generally only Superadmins or specific 'FINANCE' roles should access.
-- Using is_superadmin() for foundational access.


-- Employees view own salary slips
CREATE POLICY "Users view own salary slips" ON public.fin_salary_slips FOR SELECT USING (employee_id = auth.uid());

-- Sales Execs view own commissions
CREATE POLICY "Sales execs view own commission" ON public.fin_commission_ledger FOR SELECT USING (sales_executive_id = auth.uid());

-- Customers view own invoices and credit notes
CREATE POLICY "Customers view own invoices" ON public.fin_invoices FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Customers view own credit notes" ON public.fin_credit_notes FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));


-- ==========================================
-- MODULE: 20260715000014_human_resources.sql
-- ==========================================


-- Migration: Enterprise Human Resources (HRMS)
-- Encompasses Employee Files, Attendance, Leave, Payroll, and Performance.

-- ==========================================
-- 1. ENUMS
-- ==========================================








-- ==========================================
-- 2. EMPLOYEE FILES & DOCUMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.hr_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL UNIQUE,
    employment_type public.enum_hr_employment_type DEFAULT 'FULL_TIME',
    joining_date DATE NOT NULL,
    probation_end_date DATE,
    exit_date DATE,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    national_id_number TEXT, -- SSN, PAN, Aadhar (Should ideally be encrypted at app layer)
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_routing_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.hr_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- e.g., 'ID_PROOF', 'CONTRACT', 'NDA', 'CERTIFICATE'
    document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 3. TIME & ATTENDANCE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.hr_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.org_branches(id) ON DELETE CASCADE, -- Null means company-wide
    name TEXT NOT NULL,
    holiday_date DATE NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.hr_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in_time TIMESTAMPTZ,
    clock_out_time TIMESTAMPTZ,
    clock_in_lat NUMERIC, -- Geofencing for field staff
    clock_in_lng NUMERIC,
    clock_out_lat NUMERIC,
    clock_out_lng NUMERIC,
    status public.enum_hr_attendance_status DEFAULT 'PRESENT',
    total_hours_worked NUMERIC GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (clock_out_time - clock_in_time))/3600
    ) STORED,
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- ==========================================
-- 4. LEAVE MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.hr_leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'SICK_LEAVE', 'CASUAL_LEAVE'
    annual_allowance NUMERIC NOT NULL DEFAULT 0,
    is_carry_forward BOOLEAN DEFAULT false,
    max_carry_forward NUMERIC DEFAULT 0,
    is_unpaid BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.hr_leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.hr_leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_accrued NUMERIC NOT NULL DEFAULT 0,
    total_used NUMERIC NOT NULL DEFAULT 0,
    balance NUMERIC GENERATED ALWAYS AS (total_accrued - total_used) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS public.hr_leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.hr_leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC NOT NULL CHECK (total_days > 0),
    reason TEXT NOT NULL,
    status public.enum_hr_leave_status DEFAULT 'PENDING',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Usually the Manager
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ==========================================
-- 5. PAYROLL STRUCTURING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.hr_salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    annual_ctc NUMERIC NOT NULL DEFAULT 0, -- Cost to Company
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    hra_allowance NUMERIC NOT NULL DEFAULT 0,
    special_allowance NUMERIC NOT NULL DEFAULT 0,
    pf_deduction NUMERIC NOT NULL DEFAULT 0,
    tax_deduction NUMERIC NOT NULL DEFAULT 0,
    effective_from DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.hr_payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- e.g., '2026-07'
    status public.enum_hr_payroll_status DEFAULT 'DRAFT',
    total_employees INTEGER DEFAULT 0,
    total_payout NUMERIC DEFAULT 0,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(org_id, month_year)
);

CREATE TABLE IF NOT EXISTS public.hr_payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL REFERENCES public.hr_payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    fin_salary_slip_id UUID REFERENCES public.fin_salary_slips(id) ON DELETE SET NULL, -- Links to strict finance ledger
    days_present NUMERIC NOT NULL DEFAULT 0,
    days_absent NUMERIC NOT NULL DEFAULT 0,
    -- Granular Breakdown for the PDF
    basic_salary NUMERIC NOT NULL DEFAULT 0,
    hra_allowance NUMERIC NOT NULL DEFAULT 0,
    special_allowance NUMERIC NOT NULL DEFAULT 0,
    pf_deduction NUMERIC NOT NULL DEFAULT 0,
    tax_deduction NUMERIC NOT NULL DEFAULT 0,
    gross_earnings NUMERIC GENERATED ALWAYS AS (basic_salary + hra_allowance + special_allowance) STORED,
    total_deductions NUMERIC GENERATED ALWAYS AS (pf_deduction + tax_deduction) STORED,
    net_payable NUMERIC GENERATED ALWAYS AS (basic_salary + hra_allowance + special_allowance - pf_deduction - tax_deduction) STORED,
    status public.enum_hr_payroll_status DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(payroll_run_id, employee_id)
);

-- ==========================================
-- 6. PERFORMANCE & TRAINING
-- ==========================================

CREATE TABLE IF NOT EXISTS public.hr_performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_period TEXT NOT NULL, -- e.g., 'Q3-2026'
    self_assessment_text TEXT,
    manager_feedback_text TEXT,
    kpi_score NUMERIC CHECK (kpi_score >= 0 AND kpi_score <= 100),
    final_rating TEXT, -- e.g., 'EXCEEDS_EXPECTATIONS', 'MEETS_EXPECTATIONS'
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, REVIEWED, COMPLETED
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.hr_training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    duration_hours NUMERIC,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.hr_employee_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.hr_training_programs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ENROLLED', -- ENROLLED, IN_PROGRESS, COMPLETED, FAILED
    assessment_score NUMERIC,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, program_id)
);

-- ==========================================
-- 7. TRIGGERS & RLS AUTOMATION
-- ==========================================




-- 8. SECURITY POLICIES

-- Superadmin & HR Staff Access


-- Extreme Privacy Policies: Employees can ONLY view their own records.
CREATE POLICY "Employees view own files" ON public.hr_employees FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Employees view own documents" ON public.hr_documents FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees view own attendance" ON public.hr_attendance FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees clock in out" ON public.hr_attendance FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees update own clock out" ON public.hr_attendance FOR UPDATE USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees view own leave balance" ON public.hr_leave_balances FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees view own leave requests" ON public.hr_leave_requests FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees insert own leave requests" ON public.hr_leave_requests FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees view own payslips" ON public.hr_payslips FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees view own performance" ON public.hr_performance_reviews FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees update self assessment" ON public.hr_performance_reviews FOR UPDATE USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));

CREATE POLICY "Employees view own training" ON public.hr_employee_trainings FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));

-- All employees can see the master holiday list and training curriculum
CREATE POLICY "Public view holidays" ON public.hr_holidays FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public view leave types" ON public.hr_leave_types FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public view training programs" ON public.hr_training_programs FOR SELECT USING (deleted_at IS NULL);


-- ==========================================
-- MODULE: 20260715000015_notification_engine.sql
-- ==========================================


-- Migration: Omnichannel Notification Engine
-- Encompasses Queues, Templates, Logs, and Preferences.

-- ==========================================
-- 1. ENUMS
-- ==========================================




-- ==========================================
-- 2. TEMPLATES & PREFERENCES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ntf_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    template_code TEXT NOT NULL UNIQUE, -- e.g., 'ORDER_CONFIRMATION'
    channel public.enum_ntf_channel NOT NULL,
    subject TEXT, -- Only for EMAIL
    body TEXT NOT NULL, -- HTML for Email, Text for SMS/WhatsApp
    variables JSONB, -- Expected variables array
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ntf_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    channel public.enum_ntf_channel NOT NULL,
    is_opted_in BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR customer_id IS NOT NULL),
    UNIQUE(user_id, channel),
    UNIQUE(customer_id, channel)
);

-- ==========================================
-- 3. QUEUE & DELIVERY LOGS (Immutable)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ntf_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.ntf_templates(id) ON DELETE SET NULL,
    channel public.enum_ntf_channel NOT NULL,
    recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    recipient_address TEXT NOT NULL, -- Email address or Phone number
    payload JSONB NOT NULL, -- The merged variables
    status public.enum_ntf_status DEFAULT 'PENDING',
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ntf_queue_status ON public.ntf_queue(status, scheduled_for);

CREATE TABLE IF NOT EXISTS public.ntf_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL REFERENCES public.ntf_queue(id) ON DELETE CASCADE,
    external_message_id TEXT, -- e.g., SendGrid ID or Twilio SID
    status public.enum_ntf_status NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. TRIGGERS & RLS AUTOMATION
-- ==========================================



ALTER TABLE public.ntf_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ntf_delivery_logs ENABLE ROW LEVEL SECURITY;

-- 5. SECURITY POLICIES

-- Superadmin & Staff General Access


-- Privacy: Users control their own preferences
CREATE POLICY "Users manage own preferences" ON public.ntf_preferences FOR ALL USING (
    user_id = auth.uid() OR customer_id IN (SELECT public.get_my_customer_ids())
);


-- ==========================================
-- MODULE: 20260715000016_analytics_reports.sql
-- ==========================================


-- Migration: Analytics & Reporting Engine
-- Encompasses Dashboards, Materialized Views, and AI Insights.

-- ==========================================
-- 1. DASHBOARDS & WIDGETS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.rpt_dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.sys_roles(id) ON DELETE CASCADE, -- Layout tied to a specific role
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rpt_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES public.rpt_dashboard_layouts(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL, -- e.g., 'BAR_CHART', 'KPI_CARD', 'TABLE'
    data_source TEXT NOT NULL, -- e.g., 'mv_sales_summary'
    title TEXT NOT NULL,
    configuration JSONB NOT NULL, -- Grid position (x, y, w, h), filters, colors
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rpt_saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    report_category TEXT NOT NULL, -- SALES, CUSTOMER, INVENTORY, FINANCE, MARKETING, ENGINEER
    query_configuration JSONB NOT NULL, -- JSON definition of filters, columns, sorting
    schedule_cron TEXT, -- Optional cron for email delivery
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. AI INSIGHTS LEDGER
-- ==========================================

CREATE TABLE IF NOT EXISTS public.rpt_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- ANOMALY, PREDICTION, SUMMARY
    category TEXT NOT NULL, -- SALES, FINANCE, INVENTORY
    insight_text TEXT NOT NULL,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
    data_snapshot JSONB, -- The data the AI based this insight on
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_acknowledged BOOLEAN DEFAULT false
);

-- ==========================================
-- 3. CORE MATERIALIZED VIEWS (For Dashboard Performance)
-- ==========================================

-- A. Sales & Revenue Summary
CREATE MATERIALIZED VIEW public.mv_rpt_sales_summary AS
SELECT 
    DATE_TRUNC('day', issue_date) AS sales_date,
    org_id,
    COUNT(id) AS total_invoices,
    SUM(subtotal) AS total_subtotal,
    SUM(total_tax) AS total_tax,
    SUM(grand_total) AS total_revenue
FROM public.fin_invoices
WHERE status != 'VOIDED'
GROUP BY DATE_TRUNC('day', issue_date), org_id;
CREATE UNIQUE INDEX idx_mv_sales_summary ON public.mv_rpt_sales_summary(sales_date, org_id);

-- B. Inventory Valuation
CREATE MATERIALIZED VIEW public.mv_rpt_inventory_valuation AS
SELECT 
    s.warehouse_id,
    s.variant_id,
    s.quantity_on_hand,
    p.base_price,
    (s.quantity_on_hand * p.base_price) AS total_value
FROM public.inv_stock s
JOIN public.prd_variants v ON s.variant_id = v.id
JOIN public.prd_pricing p ON v.id = p.variant_id;
CREATE UNIQUE INDEX idx_mv_inventory_val ON public.mv_rpt_inventory_valuation(warehouse_id, variant_id);

-- C. Support Field Engineer Performance
CREATE MATERIALIZED VIEW public.mv_rpt_engineer_performance AS
SELECT 
    e.id AS engineer_id,
    u.email AS engineer_email,
    COUNT(v.id) AS total_visits,
    SUM(CASE WHEN v.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_visits,
    AVG(EXTRACT(EPOCH FROM (v.actual_end - v.actual_start))/3600) AS avg_visit_duration_hours
FROM public.sup_engineers e
JOIN auth.users u ON e.user_id = u.id
LEFT JOIN public.sup_engineer_visits v ON e.id = v.engineer_id
GROUP BY e.id, u.email;
CREATE UNIQUE INDEX idx_mv_eng_perf ON public.mv_rpt_engineer_performance(engineer_id);

-- D. Customer Growth
CREATE MATERIALIZED VIEW public.mv_rpt_customer_growth AS
SELECT 
    DATE_TRUNC('month', created_at) AS join_month,
    org_id,
    COUNT(id) AS new_customers
FROM public.crm_customers
GROUP BY DATE_TRUNC('month', created_at), org_id;
CREATE UNIQUE INDEX idx_mv_cust_growth ON public.mv_rpt_customer_growth(join_month, org_id);

-- ==========================================
-- 4. SECURITY & RLS
-- ==========================================


-- ==========================================
-- MODULE: 20260715000017_integrations_webhooks.sql
-- ==========================================


-- Migration: Third-Party Integrations & API Architecture
-- Encompasses Integration Settings, OAuth, Webhooks, and API Logging.

-- ==========================================
-- 1. INTEGRATION CONFIGURATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_integration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- STRIPE, RAZORPAY, SMTP, META_WABA, INFOBIP, CLOUDINARY, GOOGLE
    config_keys JSONB NOT NULL, -- Strongly recommend external KMS/Vault for production. Storing encrypted strings here.
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, provider)
);

CREATE TABLE IF NOT EXISTS public.sys_oauth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- If user-level connection
    provider TEXT NOT NULL, -- e.g., GOOGLE_WORKSPACE, MICROSOFT_365
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    scopes TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. WEBHOOKS (Outbound Subscriptions)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_webhooks_outbound (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_url TEXT NOT NULL,
    secret_token TEXT, -- For HMAC signing
    event_topics TEXT[] NOT NULL, -- e.g., ['order.created', 'ticket.resolved']
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. API & WEBHOOK LOGS (High Velocity)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    direction TEXT NOT NULL, -- INBOUND (Webhook received), OUTBOUND (Webhook sent / API called)
    provider TEXT, -- e.g., META, STRIPE, INFOBIP
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    request_payload JSONB,
    response_payload JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sys_api_logs_provider ON public.sys_api_logs(provider, created_at);

-- ==========================================
-- 4. SECURITY & RLS
-- ==========================================



ALTER TABLE public.sys_api_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins manage sys_api_logs" ON public.sys_api_logs FOR ALL USING (public.is_superadmin());


-- ==========================================
-- MODULE: 20260715000018_security_vault.sql
-- ==========================================


-- Migration: Advanced Security Vault & Firewalls
-- Encompasses Blocked IPs, Failed Logins, and Specialized Security Logs.

-- ==========================================
-- 1. BRUTE FORCE PROTECTION & FIREWALL
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_failed_logins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    attempted_email TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sys_failed_logins_ip ON public.sys_failed_logins(ip_address, attempted_at);

CREATE TABLE IF NOT EXISTS public.sys_blocked_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL, -- e.g., 'BRUTE_FORCE_LOGIN', 'MALICIOUS_PAYLOAD'
    blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Null means permanently blocked
    unblocked_at TIMESTAMPTZ,
    unblocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true
);
CREATE INDEX idx_sys_blocked_ips_active ON public.sys_blocked_ips(ip_address) WHERE (unblocked_at IS NULL);

-- ==========================================
-- 2. SPECIALIZED SECURITY EVENTS LEDGER
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'ROLE_ASSIGNED', 'PERMISSION_CHANGED', 'API_KEY_REVOKED', 'DATA_EXPORTED'
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_role_id UUID REFERENCES public.sys_roles(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    ip_address TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sys_security_events_type ON public.sys_security_events(event_type, created_at);

-- ==========================================
-- 3. SECURITY & RLS
-- ==========================================

ALTER TABLE public.sys_failed_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_security_events ENABLE ROW LEVEL SECURITY;

-- Only Superadmins have access to the Security Vault
CREATE POLICY "Superadmins manage sys_failed_logins" ON public.sys_failed_logins FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins manage sys_blocked_ips" ON public.sys_blocked_ips FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins manage sys_security_events" ON public.sys_security_events FOR ALL USING (public.is_superadmin());


-- ==========================================
-- MODULE: 20260715000019_enterprise_optimizations.sql
-- ==========================================


-- Migration: Enterprise Database Optimizations & Linkers
-- Fills architectural gaps, adds GIN indexes, hardens constraints, and builds 360 views.

-- ==========================================
-- 1. GLOBAL SETTINGS & JOB QUEUES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sys_app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL, -- e.g., 'DEFAULT_CURRENCY', 'FISCAL_YEAR_START', 'TIMEZONE'
    setting_value JSONB NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, setting_key)
);

CREATE TABLE IF NOT EXISTS public.sys_background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- e.g., 'REFRESH_MV', 'DATA_EXPORT', 'CLEANUP'
    payload JSONB,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sys_bg_jobs_status ON public.sys_background_jobs(status, scheduled_for);


-- ==========================================
-- 2. HIGH-PERFORMANCE SEARCH INDEXES (GIN)
-- ==========================================

-- Removed: search_vector columns have been moved to their respective initial CREATE TABLE scripts.


-- ==========================================
-- 3. DATA INTEGRITY CONSTRAINTS
-- ==========================================

-- Removed: Redundant CHECK constraints for priority/status. These are automatically strictly enforced by their underlying PostgreSQL ENUM types.

-- Finance & OMS: Prevent Negative Billing
DO $$ BEGIN
    ALTER TABLE public.oms_orders ADD CONSTRAINT chk_oms_orders_total CHECK (grand_total >= 0 AND total_tax >= 0 AND subtotal >= 0);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.fin_invoices ADD CONSTRAINT chk_fin_invoices_total CHECK (grand_total >= 0 AND total_tax >= 0 AND subtotal >= 0);
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ==========================================
-- 4. 360-DEGREE EXECUTIVE VIEWS
-- ==========================================

-- Customer 360 View: Unifies CRM, OMS, Tickets, and Finance
CREATE OR REPLACE VIEW public.v_customer_360_view AS
SELECT 
    c.id AS customer_id,
    c.org_id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    g.name AS customer_group,
    w.balance AS wallet_balance,
    rp.current_balance AS reward_points,
    (SELECT COUNT(id) FROM public.oms_orders o WHERE o.customer_id = c.id) AS total_orders,
    (SELECT COALESCE(SUM(grand_total), 0) FROM public.oms_orders o WHERE o.customer_id = c.id AND o.order_status != 'CANCELLED') AS lifetime_value,
    (SELECT COALESCE(SUM(outstanding_balance), 0) FROM public.fin_invoices i WHERE i.customer_id = c.id AND i.status != 'PAID') AS total_outstanding,
    (SELECT COUNT(id) FROM public.sup_tickets t WHERE t.customer_id = c.id AND t.status NOT IN ('RESOLVED', 'CLOSED')) AS open_tickets,
    c.created_at AS joined_at
FROM public.crm_customers c
LEFT JOIN public.crm_customer_groups g ON c.group_id = g.id
LEFT JOIN public.crm_wallets w ON c.id = w.customer_id
LEFT JOIN public.crm_reward_points rp ON c.id = rp.customer_id;

-- Employee 360 View: Unifies HR and Organization Structure
CREATE OR REPLACE VIEW public.v_employee_360_view AS
SELECT 
    e.id AS employee_id,
    e.org_id,
    u.email,
    e.employee_code,
    e.joining_date,
    e.employment_type,
    e.is_active,
    d.name AS department_name,
    ds.title AS designation_name,
    br.name AS branch_name,
    (SELECT COUNT(id) FROM public.hr_leave_requests l WHERE l.employee_id = e.id AND l.status = 'PENDING') AS pending_leave_requests
FROM public.hr_employees e
JOIN auth.users u ON e.user_id = u.id
LEFT JOIN public.sys_users su ON su.id = u.id
LEFT JOIN public.org_departments d ON su.department_id = d.id
LEFT JOIN public.org_designations ds ON su.designation_id = ds.id
LEFT JOIN public.org_branches br ON su.branch_id = br.id;


-- ==========================================
-- 5. MISSING UTILITY FUNCTIONS
-- ==========================================

-- Function to refresh all Materialized Views built in 000016
CREATE OR REPLACE FUNCTION public.fn_refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_rpt_sales_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_rpt_inventory_valuation;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_rpt_engineer_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_rpt_customer_growth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 6. SECURITY & RLS (For New Tables)
-- ==========================================


-- ==========================================
-- MODULE: 20260715000020_missing_modules_audit.sql
-- ==========================================


-- Migration: Missing Modules Audit (Subscriptions & Projects)
-- Generates the final SaaS billing and internal PMO architecture.

-- ==========================================
-- 1. ENUMS
-- ==========================================










-- ==========================================
-- 2. SUBSCRIPTION & RECURRING BILLING ENGINE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.sub_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.prd_products(id) ON DELETE CASCADE, -- Links to ERP master catalog
    name TEXT NOT NULL,
    description TEXT,
    interval public.enum_sub_interval NOT NULL DEFAULT 'MONTHLY',
    interval_count INTEGER NOT NULL DEFAULT 1, -- e.g., Every 3 Months
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    trial_period_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sub_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.sub_plans(id) ON DELETE RESTRICT,
    status public.enum_sub_status NOT NULL DEFAULT 'TRIALING',
    quantity INTEGER NOT NULL DEFAULT 1,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sub_billing_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.sub_subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.fin_invoices(id) ON DELETE SET NULL, -- Links to strict Accounting Ledger
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ NOT NULL,
    amount_due NUMERIC NOT NULL CHECK (amount_due >= 0),
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subscription_id, cycle_start)
);

-- ==========================================
-- 3. PROJECT MANAGEMENT & TIMESHEETS ENGINE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.pm_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL, -- Null for internal projects
    name TEXT NOT NULL,
    description TEXT,
    status public.enum_pm_project_status DEFAULT 'PLANNING',
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    budget_amount NUMERIC CHECK (budget_amount >= 0),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.pm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.pm_projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES public.pm_tasks(id) ON DELETE CASCADE, -- Hierarchical tasks
    title TEXT NOT NULL,
    description TEXT,
    status public.enum_pm_task_status DEFAULT 'TODO',
    priority public.enum_pm_priority DEFAULT 'MEDIUM',
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    estimated_hours NUMERIC CHECK (estimated_hours >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.pm_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.pm_tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    hours_worked NUMERIC NOT NULL CHECK (hours_worked > 0 AND hours_worked <= 24),
    description TEXT,
    is_billable BOOLEAN DEFAULT true,
    is_invoiced BOOLEAN DEFAULT false,
    invoice_id UUID REFERENCES public.fin_invoices(id) ON DELETE SET NULL, -- If billed to client
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. TRIGGERS & RLS AUTOMATION
-- ==========================================




-- 5. SECURITY POLICIES

-- Superadmin & Staff General Access


-- Privacy: Customers view own subscriptions
CREATE POLICY "Customers view own subscriptions" ON public.sub_subscriptions FOR SELECT USING (customer_id IN (SELECT public.get_my_customer_ids()));
CREATE POLICY "Customers view own billing cycles" ON public.sub_billing_cycles FOR SELECT USING (subscription_id IN (SELECT id FROM public.sub_subscriptions WHERE customer_id IN (SELECT public.get_my_customer_ids())));

-- Privacy: Employees view/edit own tasks and timesheets
CREATE POLICY "Employees view assigned tasks" ON public.pm_tasks FOR SELECT USING (assignee_id = auth.uid());
CREATE POLICY "Employees update assigned tasks" ON public.pm_tasks FOR UPDATE USING (assignee_id = auth.uid());

CREATE POLICY "Employees view own timesheets" ON public.pm_timesheets FOR SELECT USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees insert own timesheets" ON public.pm_timesheets FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));
CREATE POLICY "Employees update own timesheets" ON public.pm_timesheets FOR UPDATE USING (employee_id IN (SELECT id FROM public.hr_employees WHERE user_id = auth.uid()));


-- ==========================================
-- MODULE: 20260716000000_lead_revenue_engine.sql
-- ==========================================


-- Migration: Lead Generation Revenue Engine Extensions
-- Adds visitor tracking, AI qualification fields, and nurture sequence schemas.

-- 1. ENUMS


-- 2. ALTER SLS_LEADS
ALTER TABLE public.sls_leads
ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS requirement TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS heat_level public.enum_sls_heat_level DEFAULT 'COLD',
ADD COLUMN IF NOT EXISTS tracking_session_id TEXT,
ADD COLUMN IF NOT EXISTS lead_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sls_leads_heat ON public.sls_leads(heat_level);
CREATE INDEX IF NOT EXISTS idx_sls_leads_session ON public.sls_leads(tracking_session_id);

-- 3. VISITOR TRACKING
CREATE TABLE IF NOT EXISTS public.sls_visitor_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    url_visited TEXT NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    product_id UUID, -- References products if available
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sls_visitor_tracking_session ON public.sls_visitor_tracking(session_id);

-- 4. NURTURE SEQUENCES
CREATE TABLE IF NOT EXISTS public.sls_nurture_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.org_organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT, -- e.g., 'Commercial', 'Home CCTV'
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE public.enum_sls_nurture_action AS ENUM ('SEND_WABA', 'SEND_EMAIL', 'CREATE_TASK', 'ESCALATE');

CREATE TABLE IF NOT EXISTS public.sls_nurture_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES public.sls_nurture_sequences(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    delay_days INTEGER NOT NULL DEFAULT 0,
    action_type public.enum_sls_nurture_action NOT NULL,
    message_template TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TRIGGER FOR UPDATED_AT
DO $$ 
BEGIN
    EXECUTE 'CREATE TRIGGER trg_sls_nurture_sequences_updated_at BEFORE UPDATE ON public.sls_nurture_sequences FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 6. ROW LEVEL SECURITY
ALTER TABLE public.sls_visitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sls_nurture_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sls_nurture_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for tracking" ON public.sls_visitor_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Superadmins view tracking" ON public.sls_visitor_tracking FOR SELECT USING (public.is_superadmin());

CREATE POLICY "Superadmins manage nurture sequences" ON public.sls_nurture_sequences FOR ALL USING (public.is_superadmin());
CREATE POLICY "Org members view nurture sequences" ON public.sls_nurture_sequences FOR SELECT USING (org_id = public.get_current_org_id());

CREATE POLICY "Superadmins manage nurture steps" ON public.sls_nurture_steps FOR ALL USING (public.is_superadmin());
CREATE POLICY "Org members view nurture steps" ON public.sls_nurture_steps FOR SELECT USING (
    sequence_id IN (SELECT id FROM public.sls_nurture_sequences WHERE org_id = public.get_current_org_id())
);


-- ==========================================
-- MODULE: 20260717000001_phase46_tables_indexes_rls.sql
-- ==========================================


-- =============================================================================
-- Migration: Performance indexes & RLS policies for Phase 4-6 tables
-- Created:   2026-07-17
-- =============================================================================

-- ─── Indexes on existing legacy hot tables ─────────────────────────────────

-- orders: most common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone) WHERE customer_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_agent_id      ON public.orders(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);

-- products
CREATE INDEX IF NOT EXISTS idx_products_status      ON public.products(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_category    ON public.products(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_created_at  ON public.products(created_at DESC);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id     ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON public.profiles(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_mobile      ON public.profiles(mobile) WHERE mobile IS NOT NULL;

-- carts
CREATE INDEX IF NOT EXISTS idx_carts_user_id        ON public.carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_carts_status         ON public.carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_updated_at     ON public.carts(updated_at DESC);

-- blog_posts (created in Phase 3)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug      ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status    ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC) WHERE status = 'published';

-- ─── Notification preferences (Phase 4-6 new table) ───────────────────────

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      boolean NOT NULL DEFAULT true,
  sms        boolean NOT NULL DEFAULT false,
  whatsapp   boolean NOT NULL DEFAULT true,
  push       boolean NOT NULL DEFAULT false,
  order_updates    boolean NOT NULL DEFAULT true,
  promotions       boolean NOT NULL DEFAULT false,
  service_reminders boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_notification_prefs_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON public.notification_preferences(user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_notification_prefs" ON public.notification_preferences;
CREATE POLICY "users_own_notification_prefs" ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Referral codes (Phase 4-1 new table) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code       text NOT NULL,
  uses       integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_referral_codes_user UNIQUE (user_id),
  CONSTRAINT uq_referral_codes_code UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code    ON public.referral_codes(code);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_referral" ON public.referral_codes;
CREATE POLICY "users_read_own_referral" ON public.referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "service_role_manage_referral" ON public.referral_codes;
CREATE POLICY "service_role_manage_referral" ON public.referral_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Referral claims ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.referral_claims (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code   text NOT NULL,
  referred_user   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_referral_claim_user UNIQUE (referred_user)
);

CREATE INDEX IF NOT EXISTS idx_referral_claims_code     ON public.referral_claims(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_claims_referrer ON public.referral_claims(referrer_user);

ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_manage_claims" ON public.referral_claims;
CREATE POLICY "service_role_manage_claims" ON public.referral_claims
  FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Wishlist ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  added_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_wishlist_item UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist_items(user_id);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_wishlist" ON public.wishlist_items;
CREATE POLICY "users_own_wishlist" ON public.wishlist_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Trigger: auto-update updated_at on notification_preferences ──────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notification_prefs_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. DYNAMIC TRIGGERS & RLS AUTOMATION
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND (table_name LIKE 'org_%' OR table_name LIKE 'sys_%')
          AND table_name != 'sys_audit_logs'
          AND table_name != 'sys_auth_login_history'
    LOOP
        -- Remove existing triggers if any (for idempotency since we are recreating some sys_ tables)
        -- Add updated_at trigger
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        
        -- Add audit trigger
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY['org_organizations', 'org_branches', 'org_departments', 'org_designations'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users view their org %I" ON public.%I', tbl, tbl);
        IF tbl = 'org_organizations' THEN
            EXECUTE format('DROP POLICY IF EXISTS "Users view their org %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users view their org %I" ON public.%I FOR SELECT USING (id = public.get_current_org_id());
        ', tbl, tbl);
        ELSE
            EXECUTE format('DROP POLICY IF EXISTS "Users view their org %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users view their org %I" ON public.%I FOR SELECT USING (org_id = public.get_current_org_id());
        ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY['sys_auth_sessions', 'sys_auth_devices', 'sys_auth_otp', 'sys_auth_password_resets', 'sys_auth_api_keys', 'sys_auth_2fa', 'sys_auth_login_history'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users manage their own %I" ON public.%I', tbl, tbl);
        IF tbl = 'sys_auth_api_keys' THEN
             EXECUTE format('DROP POLICY IF EXISTS "Users manage their own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage their own %I" ON public.%I FOR ALL USING (user_id = auth.uid() OR org_id = public.get_current_org_id());
        ', tbl, tbl);
        ELSE
             EXECUTE format('DROP POLICY IF EXISTS "Users manage their own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage their own %I" ON public.%I FOR ALL USING (user_id = auth.uid());
        ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND (table_name LIKE 'prd_%' OR table_name LIKE 'inv_%')
          AND table_name != 'prd_price_history'
          AND table_name != 'inv_stock_history'
    LOOP
        -- Remove existing triggers (important since we are overwriting 000001)
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE 'prd_%' OR table_name LIKE 'inv_%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'cms_%' 
          AND table_name != 'cms_blog_post_tags'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        
        -- Default policies: Superadmins manage everything, Public reads active/published content
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins can manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins can manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'crm_%' 
          AND table_name NOT IN ('crm_wallet_transactions', 'crm_reward_point_ledger', 'crm_timeline')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'crm_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
        
        -- If table has org_id natively
        IF tbl IN ('crm_customer_groups', 'crm_customers', 'crm_carts', 'crm_loyalty_tiers') THEN
            EXECUTE format('DROP POLICY IF EXISTS "Staff view org %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Staff view org %I" ON public.%I FOR SELECT USING (org_id = public.get_current_org_id());
        ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'crm_%'
    LOOP
        IF tbl = 'crm_customers' THEN
            EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL USING (user_id = auth.uid());
        ', tbl, tbl);
        ELSIF tbl IN ('crm_addresses', 'crm_saved_cards', 'crm_preferences', 'crm_wishlists', 'crm_carts', 'crm_cart_items', 'crm_reward_points', 'crm_reward_point_ledger', 'crm_wallets', 'crm_wallet_transactions', 'crm_referrals', 'crm_timeline', 'crm_customer_group_mapping') THEN
            -- Tables that have a customer_id column
            BEGIN
                EXECUTE format('DROP POLICY IF EXISTS "Users manage own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users manage own %I" ON public.%I FOR ALL USING (customer_id IN (SELECT public.get_my_customer_ids()));
        ', tbl, tbl);
            EXCEPTION WHEN undefined_column THEN null; END;
        END IF;
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'sls_%' 
          AND table_name NOT IN ('sls_lead_assignments', 'sls_timeline')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'sls_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
        
        -- Config tables are viewable by everyone in the org
        IF tbl IN ('sls_pipelines', 'sls_stages', 'sls_lead_sources') THEN
            EXECUTE format('DROP POLICY IF EXISTS "Org members view config %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Org members view config %I" ON public.%I FOR SELECT USING (org_id = public.get_current_org_id());
        ', tbl, tbl);
        END IF;
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'oms_%' 
          AND table_name NOT IN ('oms_payment_history', 'oms_tracking_history', 'oms_taxes')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'oms_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'wab_%' 
          -- Exclude immutable ledgers from updated_at triggers
          AND table_name NOT IN ('wab_messages', 'wab_message_status', 'wab_webhook_logs', 'wab_media', 'wab_ai_summaries', 'wab_ai_suggestions', 'wab_customer_timeline')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'wab_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'mkt_%' 
          AND table_name NOT IN ('mkt_google_reviews') -- Exclude external sync ledger
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'mkt_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'sup_%' 
          AND table_name NOT IN ('sup_ticket_attachments', 'sup_ticket_feedback')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'sup_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'fin_%' 
          -- Exclude immutable ledgers from updated_at triggers
          AND table_name NOT IN ('fin_ledger_lines', 'fin_credit_notes', 'fin_debit_notes', 'fin_bank_transactions', 'fin_tax_ledger', 'fin_commission_ledger')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'fin_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'hr_%' 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'hr_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'ntf_%' 
          AND table_name NOT IN ('ntf_queue', 'ntf_delivery_logs') -- Exclude high velocity from update triggers
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'ntf_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name LIKE 'rpt_%' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND (table_name LIKE 'sys_integration%' OR table_name LIKE 'sys_oauth%' OR table_name LIKE 'sys_webhooks%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('sys_app_settings', 'sys_background_jobs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND (table_name LIKE 'sub_%' OR table_name LIKE 'pm_%')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_set_updated_at();', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_%I_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();', tbl, tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE 'sub_%' OR table_name LIKE 'pm_%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Superadmins manage %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Superadmins manage %I" ON public.%I FOR ALL USING (public.is_superadmin());
        ', tbl, tbl);
    END LOOP;
END $$;


-- ==========================================
-- MODULE: 202607190001_agent_redemption_transactions.sql
-- ==========================================


CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;


-- ==========================================
-- MODULE: 202607190002_waba_conversation_notes.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No table target found for public."Conversation". Creating waba_conversation_notes without a conversation foreign key.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'sender_number'
      AND NOT attisdropped
  ) THEN
    RAISE NOTICE 'Resolved conversation table % does not expose sender_number. Creating waba_conversation_notes without a conversation foreign key.', target_table;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waba_conversation_notes_sender_number_fkey'
      AND conrelid = 'public.waba_conversation_notes'::regclass
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE public.waba_conversation_notes ADD CONSTRAINT waba_conversation_notes_sender_number_fkey FOREIGN KEY (sender_number) REFERENCES %s(sender_number) ON DELETE CASCADE',
      target_table
    );
  EXCEPTION
    WHEN invalid_foreign_key THEN
      RAISE NOTICE 'Resolved conversation table % cannot support a sender_number foreign key. Creating waba_conversation_notes without it.', target_table;
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Existing waba_conversation_notes rows do not all match %. Creating waba_conversation_notes without a conversation foreign key.', target_table;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);


-- ==========================================
-- MODULE: 202607190003_waba_conversation_profile_fields.sql
-- ==========================================


DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT UNIQUE,
      contact_name TEXT,
      status TEXT DEFAULT 'OPEN',
      last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
      assigned_to UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Conversation"'::regclass;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS ai_active BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS deal_value TEXT,
      ADD COLUMN IF NOT EXISTS active_flow TEXT
  $sql$, target_table);
END $$;


-- ==========================================
-- MODULE: 202607190004_waba_consent_and_status_events.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_contact_consent (
  phone TEXT PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'unknown',
  last_opt_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_contact_consent_opted_in
  ON public.waba_contact_consent(opted_in, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.waba_message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_message_status_events_message
  ON public.waba_message_status_events(message_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  message_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_campaign_sent
  ON public.mkt_campaign_analytics(campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_status_sent
  ON public.mkt_campaign_analytics(status, sent_at DESC);


-- ==========================================
-- MODULE: 202607190005_waba_template_provider_metadata.sql
-- ==========================================


DO $$
DECLARE
  template_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO template_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Template';

  IF template_relkind IN ('r', 'p') THEN
    target_table := 'public."Template"'::regclass;
  ELSIF template_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Template"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Template')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;

  END IF;

  IF target_table IS NULL AND to_regclass('public.wab_templates') IS NOT NULL THEN
    target_table := 'public.wab_templates'::regclass;
  END IF;

  IF target_table IS NULL AND template_relkind IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Template" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      body TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Template"'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No writable table target found for public."Template" or public.wab_templates. Skipping WABA template metadata column migration.';
    RETURN;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
      ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
      ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  $sql$, target_table);

  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'status'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status ON %s(provider_status, status)',
      target_table
    );
  ELSE
    RAISE NOTICE 'Skipping idx_waba_template_provider_status because % does not expose a physical status column', target_table;
  END IF;
END $$;


-- ==========================================
-- MODULE: 202607190006_enterprise_analytics_logging.sql
-- ==========================================


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


-- ==========================================
-- MODULE: 202607190007_mgmt_profile_preferences.sql
-- ==========================================


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_name ON public.profiles(branch_name);


-- ==========================================
-- MODULE: 202607190008_superadmin_command_center_ops.sql
-- ==========================================


-- Superadmin command center operations: alert acknowledgement lifecycle and
-- privileged database connection statistics for the executive dashboard.

CREATE TABLE IF NOT EXISTS public.enterprise_alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'acknowledged' CHECK (status IN ('acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_key
  ON public.enterprise_alert_acknowledgements(alert_key, created_at DESC);

ALTER TABLE public.enterprise_alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Privileged connection statistics for the Superadmin dashboard. SECURITY DEFINER
-- so the service role can read pg_stat_activity without broad grants.
CREATE OR REPLACE FUNCTION public.superadmin_connection_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
  )
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM anon;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_connection_stats() TO service_role;


-- ==========================================
-- MODULE: 202607190001_agent_redemption_transactions.sql
-- ==========================================


CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;


-- ==========================================
-- MODULE: 202607190002_waba_conversation_notes.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No table target found for public."Conversation". Creating waba_conversation_notes without a conversation foreign key.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'sender_number'
      AND NOT attisdropped
  ) THEN
    RAISE NOTICE 'Resolved conversation table % does not expose sender_number. Creating waba_conversation_notes without a conversation foreign key.', target_table;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waba_conversation_notes_sender_number_fkey'
      AND conrelid = 'public.waba_conversation_notes'::regclass
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE public.waba_conversation_notes ADD CONSTRAINT waba_conversation_notes_sender_number_fkey FOREIGN KEY (sender_number) REFERENCES %s(sender_number) ON DELETE CASCADE',
      target_table
    );
  EXCEPTION
    WHEN invalid_foreign_key THEN
      RAISE NOTICE 'Resolved conversation table % cannot support a sender_number foreign key. Creating waba_conversation_notes without it.', target_table;
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Existing waba_conversation_notes rows do not all match %. Creating waba_conversation_notes without a conversation foreign key.', target_table;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);


-- ==========================================
-- MODULE: 202607190003_waba_conversation_profile_fields.sql
-- ==========================================


DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT UNIQUE,
      contact_name TEXT,
      status TEXT DEFAULT 'OPEN',
      last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
      assigned_to UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Conversation"'::regclass;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS ai_active BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS deal_value TEXT,
      ADD COLUMN IF NOT EXISTS active_flow TEXT
  $sql$, target_table);
END $$;


-- ==========================================
-- MODULE: 202607190004_waba_consent_and_status_events.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_contact_consent (
  phone TEXT PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'unknown',
  last_opt_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_contact_consent_opted_in
  ON public.waba_contact_consent(opted_in, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.waba_message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_message_status_events_message
  ON public.waba_message_status_events(message_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  message_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_campaign_sent
  ON public.mkt_campaign_analytics(campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_status_sent
  ON public.mkt_campaign_analytics(status, sent_at DESC);


-- ==========================================
-- MODULE: 202607190005_waba_template_provider_metadata.sql
-- ==========================================


DO $$
DECLARE
  template_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO template_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Template';

  IF template_relkind IN ('r', 'p') THEN
    target_table := 'public."Template"'::regclass;
  ELSIF template_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Template"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Template')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;

  END IF;

  IF target_table IS NULL AND to_regclass('public.wab_templates') IS NOT NULL THEN
    target_table := 'public.wab_templates'::regclass;
  END IF;

  IF target_table IS NULL AND template_relkind IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Template" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      body TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Template"'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No writable table target found for public."Template" or public.wab_templates. Skipping WABA template metadata column migration.';
    RETURN;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
      ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
      ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  $sql$, target_table);

  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'status'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status ON %s(provider_status, status)',
      target_table
    );
  ELSE
    RAISE NOTICE 'Skipping idx_waba_template_provider_status because % does not expose a physical status column', target_table;
  END IF;
END $$;


-- ==========================================
-- MODULE: 202607190006_enterprise_analytics_logging.sql
-- ==========================================


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


-- ==========================================
-- MODULE: 202607190007_mgmt_profile_preferences.sql
-- ==========================================


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_name ON public.profiles(branch_name);


-- ==========================================
-- MODULE: 202607190008_superadmin_command_center_ops.sql
-- ==========================================


-- Superadmin command center operations: alert acknowledgement lifecycle and
-- privileged database connection statistics for the executive dashboard.

CREATE TABLE IF NOT EXISTS public.enterprise_alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'acknowledged' CHECK (status IN ('acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_key
  ON public.enterprise_alert_acknowledgements(alert_key, created_at DESC);

ALTER TABLE public.enterprise_alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Privileged connection statistics for the Superadmin dashboard. SECURITY DEFINER
-- so the service role can read pg_stat_activity without broad grants.
CREATE OR REPLACE FUNCTION public.superadmin_connection_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
  )
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM anon;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_connection_stats() TO service_role;


-- ==========================================
-- MODULE: 202607190001_agent_redemption_transactions.sql
-- ==========================================


CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;


-- ==========================================
-- MODULE: 202607190002_waba_conversation_notes.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No table target found for public."Conversation". Creating waba_conversation_notes without a conversation foreign key.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'sender_number'
      AND NOT attisdropped
  ) THEN
    RAISE NOTICE 'Resolved conversation table % does not expose sender_number. Creating waba_conversation_notes without a conversation foreign key.', target_table;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waba_conversation_notes_sender_number_fkey'
      AND conrelid = 'public.waba_conversation_notes'::regclass
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE public.waba_conversation_notes ADD CONSTRAINT waba_conversation_notes_sender_number_fkey FOREIGN KEY (sender_number) REFERENCES %s(sender_number) ON DELETE CASCADE',
      target_table
    );
  EXCEPTION
    WHEN invalid_foreign_key THEN
      RAISE NOTICE 'Resolved conversation table % cannot support a sender_number foreign key. Creating waba_conversation_notes without it.', target_table;
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Existing waba_conversation_notes rows do not all match %. Creating waba_conversation_notes without a conversation foreign key.', target_table;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);


-- ==========================================
-- MODULE: 202607190003_waba_conversation_profile_fields.sql
-- ==========================================


DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT UNIQUE,
      contact_name TEXT,
      status TEXT DEFAULT 'OPEN',
      last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
      assigned_to UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Conversation"'::regclass;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS ai_active BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS deal_value TEXT,
      ADD COLUMN IF NOT EXISTS active_flow TEXT
  $sql$, target_table);
END $$;


-- ==========================================
-- MODULE: 202607190004_waba_consent_and_status_events.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_contact_consent (
  phone TEXT PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'unknown',
  last_opt_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_contact_consent_opted_in
  ON public.waba_contact_consent(opted_in, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.waba_message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_message_status_events_message
  ON public.waba_message_status_events(message_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  message_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_campaign_sent
  ON public.mkt_campaign_analytics(campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_status_sent
  ON public.mkt_campaign_analytics(status, sent_at DESC);


-- ==========================================
-- MODULE: 202607190005_waba_template_provider_metadata.sql
-- ==========================================


DO $$
DECLARE
  template_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO template_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Template';

  IF template_relkind IN ('r', 'p') THEN
    target_table := 'public."Template"'::regclass;
  ELSIF template_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Template"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Template')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;

  END IF;

  IF target_table IS NULL AND to_regclass('public.wab_templates') IS NOT NULL THEN
    target_table := 'public.wab_templates'::regclass;
  END IF;

  IF target_table IS NULL AND template_relkind IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Template" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      body TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Template"'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No writable table target found for public."Template" or public.wab_templates. Skipping WABA template metadata column migration.';
    RETURN;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
      ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
      ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  $sql$, target_table);

  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'status'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status ON %s(provider_status, status)',
      target_table
    );
  ELSE
    RAISE NOTICE 'Skipping idx_waba_template_provider_status because % does not expose a physical status column', target_table;
  END IF;
END $$;


-- ==========================================
-- MODULE: 202607190006_enterprise_analytics_logging.sql
-- ==========================================


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


-- ==========================================
-- MODULE: 202607190007_mgmt_profile_preferences.sql
-- ==========================================


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_name ON public.profiles(branch_name);


-- ==========================================
-- MODULE: 202607190008_superadmin_command_center_ops.sql
-- ==========================================


-- Superadmin command center operations: alert acknowledgement lifecycle and
-- privileged database connection statistics for the executive dashboard.

CREATE TABLE IF NOT EXISTS public.enterprise_alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'acknowledged' CHECK (status IN ('acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_key
  ON public.enterprise_alert_acknowledgements(alert_key, created_at DESC);

ALTER TABLE public.enterprise_alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Privileged connection statistics for the Superadmin dashboard. SECURITY DEFINER
-- so the service role can read pg_stat_activity without broad grants.
CREATE OR REPLACE FUNCTION public.superadmin_connection_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
  )
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM anon;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_connection_stats() TO service_role;


-- ==========================================
-- MODULE: 202607190001_agent_redemption_transactions.sql
-- ==========================================


CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;


-- ==========================================
-- MODULE: 202607190002_waba_conversation_notes.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No table target found for public."Conversation". Creating waba_conversation_notes without a conversation foreign key.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'sender_number'
      AND NOT attisdropped
  ) THEN
    RAISE NOTICE 'Resolved conversation table % does not expose sender_number. Creating waba_conversation_notes without a conversation foreign key.', target_table;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waba_conversation_notes_sender_number_fkey'
      AND conrelid = 'public.waba_conversation_notes'::regclass
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE public.waba_conversation_notes ADD CONSTRAINT waba_conversation_notes_sender_number_fkey FOREIGN KEY (sender_number) REFERENCES %s(sender_number) ON DELETE CASCADE',
      target_table
    );
  EXCEPTION
    WHEN invalid_foreign_key THEN
      RAISE NOTICE 'Resolved conversation table % cannot support a sender_number foreign key. Creating waba_conversation_notes without it.', target_table;
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Existing waba_conversation_notes rows do not all match %. Creating waba_conversation_notes without a conversation foreign key.', target_table;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);


-- ==========================================
-- MODULE: 202607190003_waba_conversation_profile_fields.sql
-- ==========================================


DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT UNIQUE,
      contact_name TEXT,
      status TEXT DEFAULT 'OPEN',
      last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
      assigned_to UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Conversation"'::regclass;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS ai_active BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS deal_value TEXT,
      ADD COLUMN IF NOT EXISTS active_flow TEXT
  $sql$, target_table);
END $$;


-- ==========================================
-- MODULE: 202607190004_waba_consent_and_status_events.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_contact_consent (
  phone TEXT PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'unknown',
  last_opt_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_contact_consent_opted_in
  ON public.waba_contact_consent(opted_in, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.waba_message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_message_status_events_message
  ON public.waba_message_status_events(message_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  message_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_campaign_sent
  ON public.mkt_campaign_analytics(campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_status_sent
  ON public.mkt_campaign_analytics(status, sent_at DESC);


-- ==========================================
-- MODULE: 202607190005_waba_template_provider_metadata.sql
-- ==========================================


DO $$
DECLARE
  template_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO template_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Template';

  IF template_relkind IN ('r', 'p') THEN
    target_table := 'public."Template"'::regclass;
  ELSIF template_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Template"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Template')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;

  END IF;

  IF target_table IS NULL AND to_regclass('public.wab_templates') IS NOT NULL THEN
    target_table := 'public.wab_templates'::regclass;
  END IF;

  IF target_table IS NULL AND template_relkind IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Template" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      body TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Template"'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No writable table target found for public."Template" or public.wab_templates. Skipping WABA template metadata column migration.';
    RETURN;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
      ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
      ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  $sql$, target_table);

  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'status'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status ON %s(provider_status, status)',
      target_table
    );
  ELSE
    RAISE NOTICE 'Skipping idx_waba_template_provider_status because % does not expose a physical status column', target_table;
  END IF;
END $$;


-- ==========================================
-- MODULE: 202607190006_enterprise_analytics_logging.sql
-- ==========================================


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


-- ==========================================
-- MODULE: 202607190007_mgmt_profile_preferences.sql
-- ==========================================


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_name ON public.profiles(branch_name);


-- ==========================================
-- MODULE: 202607190008_superadmin_command_center_ops.sql
-- ==========================================


-- Superadmin command center operations: alert acknowledgement lifecycle and
-- privileged database connection statistics for the executive dashboard.

CREATE TABLE IF NOT EXISTS public.enterprise_alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'acknowledged' CHECK (status IN ('acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_key
  ON public.enterprise_alert_acknowledgements(alert_key, created_at DESC);

ALTER TABLE public.enterprise_alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Privileged connection statistics for the Superadmin dashboard. SECURITY DEFINER
-- so the service role can read pg_stat_activity without broad grants.
CREATE OR REPLACE FUNCTION public.superadmin_connection_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
  )
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM anon;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_connection_stats() TO service_role;


-- ==========================================
-- MODULE: 202607190001_agent_redemption_transactions.sql
-- ==========================================


CREATE OR REPLACE FUNCTION public.approve_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
BEGIN
  UPDATE public.agent_redemption_requests
  SET status = 'approved'
  WHERE id = p_redemption_id
    AND status = 'pending'
  RETURNING * INTO v_redemption;

  IF NOT FOUND THEN
    SELECT * INTO v_redemption
    FROM public.agent_redemption_requests
    WHERE id = p_redemption_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
    END IF;

    RAISE EXCEPTION 'Redemption must be pending to approve. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_agent_redemption(
  p_redemption_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption public.agent_redemption_requests%ROWTYPE;
  v_balance numeric;
BEGIN
  SELECT * INTO v_redemption
  FROM public.agent_redemption_requests
  WHERE id = p_redemption_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_redemption.status <> 'approved' THEN
    RAISE EXCEPTION 'Redemption must be approved before processing. Current status: %', v_redemption.status
      USING ERRCODE = 'P0001';
  END IF;

  SELECT points_balance INTO v_balance
  FROM public.sales_agents
  WHERE id = v_redemption.agent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sales agent not found for redemption' USING ERRCODE = 'P0002';
  END IF;

  IF v_balance < v_redemption.points_to_redeem THEN
    RAISE EXCEPTION 'Insufficient points balance' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = points_balance - v_redemption.points_to_redeem,
      updated_at = NOW()
  WHERE id = v_redemption.agent_id;

  UPDATE public.agent_redemption_requests
  SET status = 'processed',
      processed_at = NOW()
  WHERE id = p_redemption_id
  RETURNING * INTO v_redemption;

  RETURN jsonb_build_object(
    'id', v_redemption.id,
    'agent_id', v_redemption.agent_id,
    'status', v_redemption.status,
    'points_to_redeem', v_redemption.points_to_redeem,
    'processed_at', v_redemption.processed_at
  );
END;
$$;


-- ==========================================
-- MODULE: 202607190002_waba_conversation_notes.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_number TEXT NOT NULL,
  note TEXT NOT NULL CHECK (char_length(trim(note)) > 0),
  author_id TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No table target found for public."Conversation". Creating waba_conversation_notes without a conversation foreign key.';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'sender_number'
      AND NOT attisdropped
  ) THEN
    RAISE NOTICE 'Resolved conversation table % does not expose sender_number. Creating waba_conversation_notes without a conversation foreign key.', target_table;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waba_conversation_notes_sender_number_fkey'
      AND conrelid = 'public.waba_conversation_notes'::regclass
  ) THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE format(
      'ALTER TABLE public.waba_conversation_notes ADD CONSTRAINT waba_conversation_notes_sender_number_fkey FOREIGN KEY (sender_number) REFERENCES %s(sender_number) ON DELETE CASCADE',
      target_table
    );
  EXCEPTION
    WHEN invalid_foreign_key THEN
      RAISE NOTICE 'Resolved conversation table % cannot support a sender_number foreign key. Creating waba_conversation_notes without it.', target_table;
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'Existing waba_conversation_notes rows do not all match %. Creating waba_conversation_notes without a conversation foreign key.', target_table;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_waba_conversation_notes_sender_created
  ON public.waba_conversation_notes(sender_number, created_at DESC);


-- ==========================================
-- MODULE: 202607190003_waba_conversation_profile_fields.sql
-- ==========================================


DO $$
DECLARE
  conversation_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO conversation_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Conversation';

  IF conversation_relkind IN ('r', 'p') THEN
    target_table := 'public."Conversation"'::regclass;
  ELSIF conversation_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Conversation"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Conversation')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;
  ELSIF to_regclass('public.wab_conversations') IS NOT NULL THEN
    target_table := 'public.wab_conversations'::regclass;
  END IF;

  IF target_table IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Conversation" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_number TEXT UNIQUE,
      contact_name TEXT,
      status TEXT DEFAULT 'OPEN',
      last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
      assigned_to UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Conversation"'::regclass;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS ai_active BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS deal_value TEXT,
      ADD COLUMN IF NOT EXISTS active_flow TEXT
  $sql$, target_table);
END $$;


-- ==========================================
-- MODULE: 202607190004_waba_consent_and_status_events.sql
-- ==========================================


CREATE TABLE IF NOT EXISTS public.waba_contact_consent (
  phone TEXT PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'unknown',
  last_opt_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_contact_consent_opted_in
  ON public.waba_contact_consent(opted_in, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.waba_message_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waba_message_status_events_message
  ON public.waba_message_status_events(message_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.mkt_campaigns(id) ON DELETE CASCADE,
  phone TEXT,
  message_id TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mkt_campaign_analytics
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS message_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_message_id
  ON public.mkt_campaign_analytics(message_id);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_campaign_sent
  ON public.mkt_campaign_analytics(campaign_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_mkt_campaign_analytics_status_sent
  ON public.mkt_campaign_analytics(status, sent_at DESC);


-- ==========================================
-- MODULE: 202607190005_waba_template_provider_metadata.sql
-- ==========================================


DO $$
DECLARE
  template_relkind "char";
  target_table regclass;
BEGIN
  SELECT c.relkind
    INTO template_relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'Template';

  IF template_relkind IN ('r', 'p') THEN
    target_table := 'public."Template"'::regclass;
  ELSIF template_relkind = 'v' THEN
    SELECT format('%I.%I', base_namespace.nspname, base_relation.relname)::regclass
      INTO target_table
    FROM pg_rewrite rewrite_rule
    JOIN pg_depend dependency ON dependency.objid = rewrite_rule.oid
    JOIN pg_class base_relation ON base_relation.oid = dependency.refobjid
    JOIN pg_namespace base_namespace ON base_namespace.oid = base_relation.relnamespace
    WHERE rewrite_rule.ev_class = 'public."Template"'::regclass
      AND base_relation.relkind IN ('r', 'p')
      AND NOT (base_namespace.nspname = 'public' AND base_relation.relname = 'Template')
    ORDER BY base_namespace.nspname, base_relation.relname
    LIMIT 1;

  END IF;

  IF target_table IS NULL AND to_regclass('public.wab_templates') IS NOT NULL THEN
    target_table := 'public.wab_templates'::regclass;
  END IF;

  IF target_table IS NULL AND template_relkind IS NULL THEN
    CREATE TABLE IF NOT EXISTS public."Template" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      body TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    target_table := 'public."Template"'::regclass;
  END IF;

  IF target_table IS NULL THEN
    RAISE NOTICE 'No writable table target found for public."Template" or public.wab_templates. Skipping WABA template metadata column migration.';
    RETURN;
  END IF;

  EXECUTE format($sql$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MARKETING',
      ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'infobip',
      ADD COLUMN IF NOT EXISTS provider_template_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'LOCAL_ONLY',
      ADD COLUMN IF NOT EXISTS variable_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  $sql$, target_table);

  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'status'
      AND NOT attisdropped
  ) THEN
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS idx_waba_template_provider_status ON %s(provider_status, status)',
      target_table
    );
  ELSE
    RAISE NOTICE 'Skipping idx_waba_template_provider_status because % does not expose a physical status column', target_table;
  END IF;
END $$;


-- ==========================================
-- MODULE: 202607190006_enterprise_analytics_logging.sql
-- ==========================================


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


-- ==========================================
-- MODULE: 202607190007_mgmt_profile_preferences.sql
-- ==========================================


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS branch_name TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_name ON public.profiles(branch_name);


-- ==========================================
-- MODULE: 202607190008_superadmin_command_center_ops.sql
-- ==========================================


-- Superadmin command center operations: alert acknowledgement lifecycle and
-- privileged database connection statistics for the executive dashboard.

CREATE TABLE IF NOT EXISTS public.enterprise_alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'acknowledged' CHECK (status IN ('acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_alert_ack_key
  ON public.enterprise_alert_acknowledgements(alert_key, created_at DESC);

ALTER TABLE public.enterprise_alert_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Privileged connection statistics for the Superadmin dashboard. SECURITY DEFINER
-- so the service role can read pg_stat_activity without broad grants.
CREATE OR REPLACE FUNCTION public.superadmin_connection_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE state = 'active'),
    'idle', COUNT(*) FILTER (WHERE state = 'idle'),
    'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
  )
  FROM pg_stat_activity
  WHERE datname = current_database();
$$;

REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM anon;
REVOKE ALL ON FUNCTION public.superadmin_connection_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_connection_stats() TO service_role;

