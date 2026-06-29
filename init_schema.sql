-- CONSOLIDATED SUPABASE SCHEMA --
-- Note: This file aggregates all sequential migrations into a single file.



-- =============================================
-- MERGED MIGRATION: 20260608000000_final_schema.sql
-- =============================================

-- Consolidated Supabase schema migration (Final)
-- Generated on 2026-06-08.
-- This file contains the complete database schema, functions, and policies.
-- It merges all previous migrations into a single source of truth.
-- Production safety: this is a rebuild/bootstrap schema. Do not run it directly
-- against a live database because it intentionally drops and recreates objects.
-- For live deployments, split changes into additive migrations, concurrent
-- indexes, NOT VALID constraints, batched backfills, and delayed cleanup.

BEGIN;

-- ============================================================================
-- 0. Standard Helpers
-- ============================================================================

-- Standard helper to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public, pg_temp;

-- Cleanup function for expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_superadmin_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'superadmin_token_blocklist'
  ) THEN
    DELETE FROM public.superadmin_token_blocklist WHERE expires_at < NOW();
  END IF;
END;
$$;

-- Prune old logs function
CREATE OR REPLACE FUNCTION public.prune_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.webhook_events WHERE created_at < NOW() - INTERVAL '30 days';
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_messages') THEN
    DELETE FROM public.whatsapp_messages WHERE created_at < NOW() - INTERVAL '30 days';
  END IF;
  DELETE FROM public.order_otp_verifications WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================================================
-- 1. Custom Enums & Types
-- ============================================================================

DROP TYPE IF EXISTS public.quote_status CASCADE;
DROP TYPE IF EXISTS public.product_lifecycle_status CASCADE;
DROP TYPE IF EXISTS public.sales_agent_status CASCADE;
DROP TYPE IF EXISTS public.redemption_status CASCADE;
DROP TYPE IF EXISTS public.advance_payment_status CASCADE;
DROP TYPE IF EXISTS public.service_engineer_skill_level CASCADE;
DROP TYPE IF EXISTS public.service_ticket_priority CASCADE;
DROP TYPE IF EXISTS public.service_ticket_status CASCADE;

CREATE TYPE public.quote_status AS ENUM ('created', 'sent', 'downloaded', 'expired', 'bidded', 'accepted', 'countered', 'rejected', 'declined');
CREATE TYPE public.product_lifecycle_status AS ENUM ('active', 'draft', 'archived', 'discontinued');
CREATE TYPE public.sales_agent_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.redemption_status AS ENUM ('pending', 'approved', 'rejected', 'processed');
CREATE TYPE public.advance_payment_status AS ENUM ('pending', 'confirmed', 'payment_initiated', 'paid', 'completed');
CREATE TYPE public.service_engineer_skill_level AS ENUM ('junior', 'senior', 'expert');
CREATE TYPE public.service_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.service_ticket_status AS ENUM ('created', 'accepted', 'rejected', 'under_process', 'hold_for_product_payment', 'rejected_by_customer', 'completed');

-- ============================================================================
-- 2. Core Table Creation
-- ============================================================================

-- Profiles Table
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  full_name TEXT,
  email TEXT UNIQUE,
  mobile TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  customer_type TEXT DEFAULT 'B2C',
  customer_category TEXT DEFAULT 'Normal',
  address JSONB DEFAULT '{}'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  marketing_metadata JSONB DEFAULT '{}'::jsonb,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Table
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT,
  subcategory TEXT,
  brand TEXT,
  model TEXT,
  model_number TEXT,
  sku TEXT,
  barcode TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  base_price NUMERIC(12,2),
  cost_price NUMERIC(12,2),
  mrp NUMERIC(12,2),
  offer_price NUMERIC(12,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  image TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  additional_images TEXT[] DEFAULT '{}'::TEXT[],
  features JSONB NOT NULL DEFAULT '[]'::JSONB,
  specifications JSONB NOT NULL DEFAULT '{}'::JSONB,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  status product_lifecycle_status NOT NULL DEFAULT 'draft',
  product_type TEXT NOT NULL DEFAULT 'physical',
  popularity INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  warranty TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  prioritized BOOLEAN NOT NULL DEFAULT FALSE,
  bulk_pricing_tiers JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft Delete columns
  deleted_at                TIMESTAMPTZ   DEFAULT NULL,
  deleted_by                UUID          DEFAULT NULL,
  is_deleted                BOOLEAN       NOT NULL DEFAULT FALSE,
  archive_reason            TEXT          DEFAULT NULL,
  archived_at               TIMESTAMPTZ   DEFAULT NULL,
  archived_by               UUID          DEFAULT NULL,

  -- AI & Tax columns
  hsn_code                  TEXT,
  gst_rate                  NUMERIC(5,2),
  tax_ai_confidence          NUMERIC(4,3),
  tax_ai_justification       TEXT,
  tax_ai_model               TEXT,
  tax_ai_classified_at       TIMESTAMPTZ,
  tax_ai_requested_by        UUID,
  tax_ai_reviewed            BOOLEAN       NOT NULL DEFAULT FALSE,
  tax_ai_reviewed_by         UUID,
  tax_ai_reviewed_at         TIMESTAMPTZ
);

-- Product Archive Log Table
DROP TABLE IF EXISTS public.product_archive_log CASCADE;
CREATE TABLE IF NOT EXISTS public.product_archive_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE,
  order_number TEXT UNIQUE,
  customer_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_mobile TEXT,
  billing_address JSONB DEFAULT '{}'::JSONB,
  shipping_address JSONB DEFAULT '{}'::JSONB,
  items JSONB NOT NULL DEFAULT '{}'::JSONB,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'Awaiting Payment',
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  type TEXT,
  source TEXT DEFAULT 'online',
  delivery_address TEXT,
  notes TEXT,
  internal_notes TEXT,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pickup_code TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  tracking_number TEXT,
  courier_name TEXT,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  used_free_installation BOOLEAN DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  order_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items Table
DROP TABLE IF EXISTS public.order_items CASCADE;
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  product_sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  serial_numbers TEXT[] DEFAULT '{}'::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Transactions Table
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    payment_method TEXT,
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL,
    gateway_response JSONB,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes Table
DROP TABLE IF EXISTS public.quotes CASCADE;
CREATE TABLE IF NOT EXISTS public.quotes (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT         UNIQUE,
  user_id      UUID         REFERENCES auth.users (id) ON DELETE CASCADE,
  customer_name TEXT        NOT NULL,
  customer_email TEXT       NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  bidded_price NUMERIC,
  counter_price NUMERIC,
  negotiation_clauses TEXT,
  gst_included BOOLEAN      NOT NULL DEFAULT FALSE,
  expiry_at    TIMESTAMPTZ  NOT NULL,
  summary      TEXT,
  selections   JSONB,
  pdf_url      TEXT,
  status       quote_status NOT NULL DEFAULT 'created',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Services Table
DROP TABLE IF EXISTS public.services CASCADE;
CREATE TABLE IF NOT EXISTS public.services (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT,
  name          TEXT,
  slug          TEXT          UNIQUE,
  description   TEXT,
  short_description TEXT,
  details       TEXT,
  icon          TEXT,
  icon_name     TEXT,
  badge         TEXT,
  features      JSONB         NOT NULL DEFAULT '[]'::JSONB,
  feature_list  JSONB,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  status        TEXT          DEFAULT 'active',
  price         NUMERIC(12,2),
  base_price    NUMERIC(12,2),
  currency      TEXT          NOT NULL DEFAULT 'INR',
  duration_days INTEGER,
  duration_hours INTEGER,
  category      TEXT          DEFAULT 'Support',
  display_order INTEGER       NOT NULL DEFAULT 0,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  requirements  JSONB         NOT NULL DEFAULT '[]'::JSONB,
  is_featured   BOOLEAN       NOT NULL DEFAULT FALSE,
  metadata      JSONB         NOT NULL DEFAULT '{}'::JSONB,
  created_by    UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by    UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  terms_and_conditions TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- FAQ Table
DROP TABLE IF EXISTS public.faqs CASCADE;
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Stock Movements Ledger
DROP TABLE IF EXISTS public.stock_movements CASCADE;
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID          NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type    TEXT          NOT NULL,
  quantity_delta   INTEGER       NOT NULL,
  quantity_before  INTEGER       NOT NULL DEFAULT 0,
  quantity_after   INTEGER       NOT NULL DEFAULT 0,
  reference_id     TEXT,
  reference_type   TEXT          NOT NULL DEFAULT 'manual',
  notes            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by       UUID          REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Serialized Inventory
DROP TABLE IF EXISTS public.inventory CASCADE;
CREATE TABLE IF NOT EXISTS public.inventory (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID          NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  stock           INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  serial_numbers  TEXT[]        NOT NULL DEFAULT '{}'::TEXT[],
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Narrow current-inventory table used as the lock target for stock mutations.
-- Keeping stock out of the wide products row reduces write amplification and
-- narrows the row-level lock held during high-concurrency checkouts.
DROP TABLE IF EXISTS public.inventory_current CASCADE;
CREATE TABLE IF NOT EXISTS public.inventory_current (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  min_stock_level INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_level >= 0),
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_inventory_current_status CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'backordered', 'discontinued'))
);

-- Tax and Policy Tables
DROP TABLE IF EXISTS public.tax_rates CASCADE;
CREATE TABLE IF NOT EXISTS public.tax_rates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.hsn_codes CASCADE;
CREATE TABLE IF NOT EXISTS public.hsn_codes (
  code VARCHAR(20) PRIMARY KEY,
  tax_rate_id INTEGER REFERENCES public.tax_rates(id) ON DELETE SET NULL,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS public.policies CASCADE;
CREATE TABLE IF NOT EXISTS public.policies (
  key VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token Blocklist
DROP TABLE IF EXISTS public.superadmin_token_blocklist CASCADE;
CREATE TABLE IF NOT EXISTS public.superadmin_token_blocklist (
  jti         UUID         PRIMARY KEY,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Innovation Content
DROP TABLE IF EXISTS public.innovation_modes CASCADE;
CREATE TABLE IF NOT EXISTS public.innovation_modes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT        UNIQUE,
  label         TEXT,
  sub           TEXT,
  title         TEXT,
  description   TEXT,
  icon          TEXT,
  rec_id        TEXT,
  items         JSONB       NOT NULL DEFAULT '[]'::JSONB,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.innovation_devices CASCADE;
CREATE TABLE IF NOT EXISTS public.innovation_devices (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT,
  description   TEXT,
  accent        TEXT,
  icon          TEXT,
  chips         JSONB       NOT NULL DEFAULT '[]'::JSONB,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operational Tables (Settings, Logs, etc.)
DROP TABLE IF EXISTS public.settings CASCADE;
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  category TEXT,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  id UUID DEFAULT gen_random_uuid()
);

DROP TABLE IF EXISTS public.security_audit_log CASCADE;
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT,
  resource TEXT,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  severity TEXT DEFAULT 'info',
  event_type TEXT,
  event_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.security_settings CASCADE;
CREATE TABLE IF NOT EXISTS public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  setting_key TEXT UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  setting_value JSONB,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.whatsapp_messages CASCADE;
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  phone TEXT,
  phone_number TEXT,
  whatsapp_message_id TEXT,
  direction TEXT,
  message_type TEXT,
  body TEXT,
  content TEXT,
  status TEXT,
  message_status TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.webhook_events CASCADE;
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.webhook_event_rollups_daily CASCADE;
CREATE TABLE IF NOT EXISTS public.webhook_event_rollups_daily (
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  event_count BIGINT NOT NULL DEFAULT 0 CHECK (event_count >= 0),
  processed_count BIGINT NOT NULL DEFAULT 0 CHECK (processed_count >= 0),
  total_processing_seconds NUMERIC(18,3) NOT NULL DEFAULT 0 CHECK (total_processing_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_date, event_type, status)
);

DROP TABLE IF EXISTS public.customers CASCADE;
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new_lead',
  lead_source TEXT,
  external_source TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  consent_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  first_contact_date TIMESTAMPTZ,
  last_contact_date TIMESTAMPTZ,
  custom_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.customer_interactions CASCADE;
CREATE TABLE IF NOT EXISTS public.customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound',
  channel TEXT,
  interaction_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.order_otp_verifications CASCADE;
CREATE TABLE IF NOT EXISTS public.order_otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  otp_code TEXT,
  phone TEXT,
  customer_phone TEXT,
  email TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wishlist Items Table
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, product_id)
);

-- Recovery Queue for Payment Failures
DROP TABLE IF EXISTS public.payment_recovery_queue CASCADE;
CREATE TABLE IF NOT EXISTS public.payment_recovery_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_email TEXT,
    customer_phone TEXT,
    failure_reason TEXT,
    recovery_status TEXT DEFAULT 'pending',
    attempts INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advance Payment Requests Table
DROP TABLE IF EXISTS public.advance_payment_requests CASCADE;
CREATE TABLE IF NOT EXISTS public.advance_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL, -- references quotes defined below via alter table to prevent cyclic reference errors
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  advance_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT DEFAULT 'payu',
  payment_terms TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_notes TEXT,
  final_quotation_url TEXT,
  payu_payment_id TEXT,
  transaction_id TEXT,
  payment_reference TEXT,
  confirmed_at TIMESTAMPTZ,
  payment_completed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter table to establish relationship between advance_payment_requests and quotes
ALTER TABLE public.advance_payment_requests
DROP CONSTRAINT IF EXISTS fk_advance_payment_quote,
ADD CONSTRAINT fk_advance_payment_quote FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;

-- Add advance_payment_id to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS advance_payment_id UUID REFERENCES public.advance_payment_requests(id) ON DELETE SET NULL;

-- Coupons Table
DROP TABLE IF EXISTS public.coupons CASCADE;
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  type TEXT NOT NULL DEFAULT 'percentage',
  value NUMERIC(10,2) NOT NULL,
  min_purchase NUMERIC(12,2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER,
  applicable_category TEXT,
  applicable_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS public.user_communication_preferences CASCADE;
CREATE TABLE IF NOT EXISTS public.user_communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  "preferredOTPChannel" TEXT NOT NULL DEFAULT 'whatsapp',
  "emailNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "whatsappNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
  "orderUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
  "serviceUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
  "securityAlerts" BOOLEAN NOT NULL DEFAULT TRUE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing Broadcast Logs Table
DROP TABLE IF EXISTS public.marketing_broadcast_logs CASCADE;
CREATE TABLE IF NOT EXISTS public.marketing_broadcast_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT NOT NULL,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('whatsapp', 'email')),
    recipient_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    fail_count INTEGER NOT NULL DEFAULT 0,
    execution_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (execution_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    failure_summary JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Free Installation Slots Table
DROP TABLE IF EXISTS public.free_installation_slots CASCADE;
CREATE TABLE IF NOT EXISTS public.free_installation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 10,
  remaining_slots INTEGER NOT NULL DEFAULT 10,
  confirmed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(month)
);

-- Ensure newly added status columns exist if the tables were created in a previous schema version
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Awaiting Payment';

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status product_lifecycle_status NOT NULL DEFAULT 'draft';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS prioritized BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS status quote_status NOT NULL DEFAULT 'created';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.advance_payment_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.payment_transactions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS status TEXT;


-- Sales Agents Table
DROP TABLE IF EXISTS public.sales_agents CASCADE;
CREATE TABLE IF NOT EXISTS public.sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  points_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  status public.sales_agent_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales Agent Commissions Table
DROP TABLE IF EXISTS public.sales_agent_commissions CASCADE;
CREATE TABLE IF NOT EXISTS public.sales_agent_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.sales_agents(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  pre_tax_amount NUMERIC(12,2) DEFAULT 0,
  gst_amount NUMERIC(12,2) DEFAULT 0,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  commission_amount NUMERIC(12,2) DEFAULT 0,
  amount NUMERIC(12,2) GENERATED ALWAYS AS (commission_amount) STORED,
  commission_rate_snapshot JSONB DEFAULT '{}'::JSONB,
  points_awarded NUMERIC(12,2) DEFAULT 0,
  commission_rule_id UUID,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Commission Rules Table
DROP TABLE IF EXISTS public.agent_commission_rules CASCADE;
CREATE TABLE IF NOT EXISTS public.agent_commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.sales_agents(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_category TEXT,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  min_order_value NUMERIC(12,2),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS fk_orders_agent,
ADD CONSTRAINT fk_orders_agent FOREIGN KEY (agent_id) REFERENCES public.sales_agents(id) ON DELETE SET NULL;

ALTER TABLE public.sales_agent_commissions
DROP CONSTRAINT IF EXISTS fk_sales_agent_commissions_rule,
ADD CONSTRAINT fk_sales_agent_commissions_rule FOREIGN KEY (commission_rule_id) REFERENCES public.agent_commission_rules(id) ON DELETE SET NULL;

-- Agent Redemption Requests Table
DROP TABLE IF EXISTS public.agent_redemption_requests CASCADE;
CREATE TABLE IF NOT EXISTS public.agent_redemption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.sales_agents(id) ON DELETE CASCADE,
  points_to_redeem NUMERIC(10,2) NOT NULL CHECK (points_to_redeem > 0),
  status public.redemption_status NOT NULL DEFAULT 'pending',
  bank_details JSONB DEFAULT '{}'::JSONB,
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Engineers Table
DROP TABLE IF EXISTS public.service_engineers CASCADE;
CREATE TABLE IF NOT EXISTS public.service_engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT,
  specializations TEXT[] DEFAULT '{}'::TEXT[],
  skill_level public.service_engineer_skill_level NOT NULL DEFAULT 'junior',
  available_hours JSONB DEFAULT '{}'::JSONB,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  current_location JSONB,
  service_radius INTEGER NOT NULL DEFAULT 50,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_services INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Tickets Table
DROP TABLE IF EXISTS public.service_tickets CASCADE;
CREATE TABLE IF NOT EXISTS public.service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  issue_description TEXT NOT NULL,
  priority public.service_ticket_priority NOT NULL DEFAULT 'medium',
  status public.service_ticket_status NOT NULL DEFAULT 'created',
  assigned_engineer_id UUID REFERENCES public.service_engineers(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  scheduled_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  service_charge NUMERIC(12,2),
  parts_cost NUMERIC(12,2),
  total_cost NUMERIC(12,2),
  customer_rating INTEGER,
  customer_feedback TEXT,
  engineer_notes TEXT,
  photos TEXT[] DEFAULT '{}'::TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Parts Table
DROP TABLE IF EXISTS public.service_parts CASCADE;
CREATE TABLE IF NOT EXISTS public.service_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.service_tickets(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  part_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  warranty_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sales_agents ADD COLUMN IF NOT EXISTS status public.sales_agent_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.sales_agent_commissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.agent_redemption_requests ADD COLUMN IF NOT EXISTS status public.redemption_status NOT NULL DEFAULT 'pending';
ALTER TABLE public.service_tickets ADD COLUMN IF NOT EXISTS status public.service_ticket_status NOT NULL DEFAULT 'created';

ALTER TABLE public.products
ADD CONSTRAINT chk_products_prices_non_negative CHECK (
  price >= 0
  AND COALESCE(base_price, 0) >= 0
  AND COALESCE(cost_price, 0) >= 0
  AND COALESCE(mrp, 0) >= 0
  AND COALESCE(offer_price, 0) >= 0
),
ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock_quantity >= 0 AND min_stock_level >= 0),
ADD CONSTRAINT chk_products_rating_range CHECK (rating >= 0 AND rating <= 5 AND review_count >= 0 AND popularity >= 0),
ADD CONSTRAINT chk_products_gst_rate_range CHECK (gst_rate IS NULL OR (gst_rate >= 0 AND gst_rate <= 100)),
ADD CONSTRAINT chk_products_tax_ai_confidence_range CHECK (tax_ai_confidence IS NULL OR (tax_ai_confidence >= 0 AND tax_ai_confidence <= 1)),
ADD CONSTRAINT chk_products_stock_status CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'backordered', 'discontinued'));

ALTER TABLE public.orders
ADD CONSTRAINT chk_orders_amounts_non_negative CHECK (
  subtotal >= 0
  AND discount >= 0
  AND discount_amount >= 0
  AND tax >= 0
  AND gst_amount >= 0
  AND shipping >= 0
  AND shipping_amount >= 0
  AND total >= 0
),
ADD CONSTRAINT chk_orders_status CHECK (status IN ('Pending', 'Awaiting Payment', 'Payment Confirmed', 'Payment Failed', 'Confirmed', 'Processing', 'Approved', 'Ready to Ship', 'Shipped', 'Ready for Pickup', 'Delivered', 'Delivered/Picked Up', 'Visit Scheduled', 'Visit Completed', 'Completed', 'Cancelled', 'Rejected')),
ADD CONSTRAINT chk_orders_payment_status CHECK (payment_status IS NULL OR payment_status IN ('Awaiting Payment', 'Payment Confirmation Pending', 'Payment Confirmed', 'Payment Cancelled', 'Payment Failed', 'Fully Paid', 'Pending', 'pending', 'Paid', 'paid', 'Failed', 'Refunded', 'Partially Refunded')),
ADD CONSTRAINT chk_orders_date_sequence CHECK (
  (approved_at IS NULL OR approved_at >= created_at)
  AND (shipped_at IS NULL OR shipped_at >= COALESCE(approved_at, created_at))
  AND (delivered_at IS NULL OR delivered_at >= COALESCE(shipped_at, approved_at, created_at))
  AND (cancelled_at IS NULL OR cancelled_at >= created_at)
);

ALTER TABLE public.order_items
ADD CONSTRAINT chk_order_items_amounts_non_negative CHECK (unit_price >= 0 AND total_price >= 0);

ALTER TABLE public.payment_transactions
ADD CONSTRAINT chk_payment_transactions_amount_non_negative CHECK (amount >= 0),
ADD CONSTRAINT chk_payment_transactions_status CHECK (status IN ('initiated', 'pending', 'processing', 'success', 'paid', 'completed', 'failed', 'refunded', 'cancelled'));

ALTER TABLE public.quotes
ADD CONSTRAINT chk_quotes_amounts_non_negative CHECK (
  (bidded_price IS NULL OR bidded_price >= 0)
  AND (counter_price IS NULL OR counter_price >= 0)
),
ADD CONSTRAINT chk_quotes_expiry_after_created CHECK (expiry_at > created_at);

ALTER TABLE public.services
ADD CONSTRAINT chk_services_prices_non_negative CHECK (
  (price IS NULL OR price >= 0)
  AND (base_price IS NULL OR base_price >= 0)
),
ADD CONSTRAINT chk_services_duration_non_negative CHECK (
  (duration_days IS NULL OR duration_days >= 0)
  AND (duration_hours IS NULL OR duration_hours >= 0)
),
ADD CONSTRAINT chk_services_status CHECK (status IS NULL OR status IN ('active', 'inactive', 'draft', 'archived'));

ALTER TABLE public.stock_movements
ADD CONSTRAINT chk_stock_movements_type CHECK (movement_type IN ('purchase', 'purchase_receipt', 'return', 'manual_add', 'online_sale', 'walk_in_sale', 'adjustment', 'damage', 'transfer', 'reservation', 'release'));

ALTER TABLE public.tax_rates
ADD CONSTRAINT chk_tax_rates_rate_range CHECK (rate >= 0 AND rate <= 100);

ALTER TABLE public.hsn_codes
ADD CONSTRAINT chk_hsn_codes_gst_rate_range CHECK (gst_rate >= 0 AND gst_rate <= 100);

ALTER TABLE public.marketing_broadcast_logs
ADD CONSTRAINT chk_marketing_broadcast_counts_non_negative CHECK (recipient_count >= 0 AND success_count >= 0 AND fail_count >= 0);

ALTER TABLE public.free_installation_slots
ADD CONSTRAINT chk_free_installation_slots_counts CHECK (
  total_slots >= 0
  AND remaining_slots >= 0
  AND confirmed_count >= 0
  AND remaining_slots <= total_slots
);

ALTER TABLE public.customers
ADD CONSTRAINT chk_customers_status CHECK (status IN ('new_lead', 'active', 'customer', 'inactive', 'blocked')),
ADD CONSTRAINT chk_customers_contact_dates CHECK (
  first_contact_date IS NULL
  OR last_contact_date IS NULL
  OR last_contact_date >= first_contact_date
);

ALTER TABLE public.customer_interactions
ADD CONSTRAINT chk_customer_interactions_direction CHECK (direction IN ('inbound', 'outbound', 'internal'));

ALTER TABLE public.webhook_events
ADD CONSTRAINT chk_webhook_events_status CHECK (status IN ('unknown', 'pending', 'processed', 'processed_with_warnings', 'failed', 'ignored'));

ALTER TABLE public.coupons
ADD CONSTRAINT chk_coupons_status CHECK (status IN ('active', 'inactive', 'expired', 'archived')),
ADD CONSTRAINT chk_coupons_type CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
ADD CONSTRAINT chk_coupons_value CHECK (
  value >= 0
  AND (type <> 'percentage' OR value <= 100)
),
ADD CONSTRAINT chk_coupons_limits CHECK (
  (min_purchase IS NULL OR min_purchase >= 0)
  AND (usage_limit IS NULL OR usage_limit >= 0)
  AND usage_count >= 0
  AND (per_user_limit IS NULL OR per_user_limit >= 0)
  AND (usage_limit IS NULL OR usage_count <= usage_limit)
),
ADD CONSTRAINT chk_coupons_date_window CHECK (expiry_date IS NULL OR expiry_date > start_date);

ALTER TABLE public.payment_recovery_queue
ADD CONSTRAINT chk_payment_recovery_queue_attempts CHECK (attempts >= 0),
ADD CONSTRAINT chk_payment_recovery_queue_status CHECK (recovery_status IS NULL OR recovery_status IN ('pending', 'urgent', 'contacted', 'recovered', 'failed', 'closed'));

ALTER TABLE public.advance_payment_requests
ADD CONSTRAINT chk_advance_payment_amounts CHECK (advance_amount >= 0 AND total_amount >= 0 AND advance_amount <= total_amount);

ALTER TABLE public.sales_agents
ADD CONSTRAINT chk_sales_agents_non_negative CHECK (points_balance >= 0 AND commission_rate >= 0 AND commission_rate <= 100);

ALTER TABLE public.sales_agent_commissions
ADD CONSTRAINT chk_sales_agent_commissions_amounts CHECK (
  order_total >= 0
  AND COALESCE(pre_tax_amount, 0) >= 0
  AND COALESCE(gst_amount, 0) >= 0
  AND COALESCE(commission_rate, 0) >= 0
  AND COALESCE(commission_rate, 0) <= 100
  AND COALESCE(commission_amount, 0) >= 0
  AND COALESCE(points_awarded, 0) >= 0
),
ADD CONSTRAINT chk_sales_agent_commissions_status CHECK (status IS NULL OR status IN ('pending', 'approved', 'paid', 'rejected', 'cancelled'));

ALTER TABLE public.agent_commission_rules
ADD CONSTRAINT chk_agent_commission_rules_rate CHECK (commission_rate >= 0 AND commission_rate <= 100),
ADD CONSTRAINT chk_agent_commission_rules_window CHECK (valid_to IS NULL OR valid_to > valid_from);

ALTER TABLE public.service_engineers
ADD CONSTRAINT chk_service_engineers_metrics CHECK (service_radius >= 0 AND rating >= 0 AND rating <= 5 AND total_services >= 0);

ALTER TABLE public.service_tickets
ADD CONSTRAINT chk_service_tickets_amounts CHECK (
  (service_charge IS NULL OR service_charge >= 0)
  AND (parts_cost IS NULL OR parts_cost >= 0)
  AND (total_cost IS NULL OR total_cost >= 0)
  AND (estimated_duration IS NULL OR estimated_duration >= 0)
  AND (actual_duration IS NULL OR actual_duration >= 0)
  AND (customer_rating IS NULL OR (customer_rating >= 1 AND customer_rating <= 5))
);

ALTER TABLE public.service_parts
ADD CONSTRAINT chk_service_parts_amounts CHECK (unit_cost >= 0 AND warranty_days >= 0);

ALTER TABLE public.user_communication_preferences
ADD CONSTRAINT chk_user_comm_preferred_otp CHECK ("preferredOTPChannel" IN ('whatsapp', 'email'));

-- ============================================================================
-- 3. Optimization Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS quotes_user_idx ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS quotes_expiry_idx ON public.quotes(expiry_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements (created_at DESC);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_sales_agents_updated_at ON public.sales_agents;
CREATE TRIGGER trg_sales_agents_updated_at BEFORE UPDATE ON public.sales_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_agent_commission_rules_updated_at ON public.agent_commission_rules;
CREATE TRIGGER trg_agent_commission_rules_updated_at BEFORE UPDATE ON public.agent_commission_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_agent_redemption_requests_updated_at ON public.agent_redemption_requests;
CREATE TRIGGER trg_agent_redemption_requests_updated_at BEFORE UPDATE ON public.agent_redemption_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_engineers_updated_at ON public.service_engineers;
CREATE TRIGGER trg_service_engineers_updated_at BEFORE UPDATE ON public.service_engineers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_tickets_updated_at ON public.service_tickets;
CREATE TRIGGER trg_service_tickets_updated_at BEFORE UPDATE ON public.service_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'profiles',
    'products',
    'orders',
    'payment_transactions',
    'quotes',
    'services',
    'faqs',
    'inventory',
    'inventory_current',
    'tax_rates',
    'hsn_codes',
    'policies',
    'innovation_modes',
    'innovation_devices',
    'settings',
    'security_settings',
    'whatsapp_messages',
    'webhook_events',
    'webhook_event_rollups_daily',
    'customers',
    'payment_recovery_queue',
    'advance_payment_requests',
    'coupons',
    'user_communication_preferences',
    'marketing_broadcast_logs',
    'free_installation_slots'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', target_table, target_table);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', target_table, target_table);
  END LOOP;
END $$;

-- Optimization indexes for new tables
CREATE INDEX IF NOT EXISTS idx_sales_agent_commissions_agent ON public.sales_agent_commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sales_agent_commissions_order ON public.sales_agent_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_agent_commission_rules_agent ON public.agent_commission_rules(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_redemption_requests_agent ON public.agent_redemption_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_service_engineers_user_id ON public.service_engineers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_customer ON public.service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_engineer ON public.service_tickets(assigned_engineer_id);
CREATE INDEX IF NOT EXISTS idx_service_parts_ticket ON public.service_parts(ticket_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_agent_id ON public.orders(agent_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_agent_commission_rules_product_id ON public.agent_commission_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_agent_commissions_rule_id ON public.sales_agent_commissions(commission_rule_id);
CREATE INDEX IF NOT EXISTS idx_service_parts_product_id ON public.service_parts(product_id);

-- New indexes for marketing logic and advance payments
CREATE INDEX IF NOT EXISTS idx_payment_recovery_order ON public.payment_recovery_queue(order_id);
CREATE INDEX IF NOT EXISTS idx_advance_payment_requests_quote_id ON public.advance_payment_requests(quote_id);
CREATE INDEX IF NOT EXISTS idx_advance_payment_requests_status ON public.advance_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_advance_payment_requests_admin_id ON public.advance_payment_requests(admin_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services (is_active);
CREATE INDEX IF NOT EXISTS faqs_published_category_order_idx ON public.faqs (is_published, category, display_order);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_id ON public.whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_hsn_codes_tax_rate_id ON public.hsn_codes(tax_rate_id);
CREATE INDEX IF NOT EXISTS idx_marketing_broadcast_logs_created_by ON public.marketing_broadcast_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_active_created ON public.orders (created_at DESC) WHERE status != 'Cancelled' AND status != 'Rejected';
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_catalog ON public.products (status, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products (archived_at DESC) WHERE is_deleted = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_hsn_code ON public.products (hsn_code);
CREATE INDEX IF NOT EXISTS idx_products_gst_rate ON public.products (gst_rate);
CREATE INDEX IF NOT EXISTS idx_products_tax_ai_review ON public.products (tax_ai_reviewed, tax_ai_classified_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_catalog_filter ON public.products (is_deleted, status, category, brand, price);
CREATE INDEX IF NOT EXISTS idx_inventory_current_status ON public.inventory_current(stock_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_superadmin_token_blocklist_expiry ON public.superadmin_token_blocklist(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_messages_message_id ON public.whatsapp_messages (whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_expiry ON public.coupons(expiry_date);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_type_created ON public.orders(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_processed_status_created ON public.orders(processed_by, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_otp_lookup ON public.order_otp_verifications(order_id, customer_phone, verified, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_tickets_engineer_status_created ON public.service_tickets(assigned_engineer_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_agent_commissions_agent_status_created ON public.sales_agent_commissions(agent_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status_last_contact ON public.customers(status, last_contact_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_created ON public.customer_interactions(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_at ON public.customer_interactions(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_event_id_unique ON public.webhook_events(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_type_status_created ON public.webhook_events(event_type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_comm_preferences_user_id ON public.user_communication_preferences("userId");

CREATE OR REPLACE FUNCTION public.adjust_webhook_event_rollup(
  p_delta INTEGER,
  p_event_type TEXT,
  p_status TEXT,
  p_created_at TIMESTAMPTZ,
  p_processing_seconds NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.webhook_event_rollups_daily (
    event_date,
    event_type,
    status,
    event_count,
    processed_count,
    total_processing_seconds
  )
  VALUES (
    p_created_at::DATE,
    p_event_type,
    p_status,
    GREATEST(p_delta, 0),
    CASE WHEN p_processing_seconds IS NOT NULL AND p_delta > 0 THEN 1 ELSE 0 END,
    CASE WHEN p_processing_seconds IS NOT NULL AND p_delta > 0 THEN p_processing_seconds ELSE 0 END
  )
  ON CONFLICT (event_date, event_type, status) DO UPDATE SET
    event_count = GREATEST(0, public.webhook_event_rollups_daily.event_count + p_delta),
    processed_count = GREATEST(
      0,
      public.webhook_event_rollups_daily.processed_count
      + CASE WHEN p_processing_seconds IS NOT NULL THEN p_delta ELSE 0 END
    ),
    total_processing_seconds = GREATEST(
      0,
      public.webhook_event_rollups_daily.total_processing_seconds
      + CASE WHEN p_processing_seconds IS NOT NULL THEN p_delta * p_processing_seconds ELSE 0 END
    ),
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_webhook_event_rollup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_processing_seconds NUMERIC;
  v_new_processing_seconds NUMERIC;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    v_old_processing_seconds := CASE
      WHEN OLD.processed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (OLD.processed_at - OLD.created_at))::NUMERIC
      ELSE NULL
    END;
    PERFORM public.adjust_webhook_event_rollup(-1, OLD.event_type, OLD.status, OLD.created_at, v_old_processing_seconds);
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    v_new_processing_seconds := CASE
      WHEN NEW.processed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (NEW.processed_at - NEW.created_at))::NUMERIC
      ELSE NULL
    END;
    PERFORM public.adjust_webhook_event_rollup(1, NEW.event_type, NEW.status, NEW.created_at, v_new_processing_seconds);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_webhook_events_rollup ON public.webhook_events;
CREATE TRIGGER trg_webhook_events_rollup
AFTER INSERT OR UPDATE OR DELETE ON public.webhook_events
FOR EACH ROW EXECUTE FUNCTION public.sync_webhook_event_rollup();

CREATE OR REPLACE VIEW public.webhook_stats
WITH (security_invoker = true) AS
SELECT
  event_type,
  status,
  event_count::BIGINT AS count,
  CASE
    WHEN processed_count > 0 THEN (total_processing_seconds / processed_count)::NUMERIC(12,3)
    ELSE NULL
  END AS avg_processing_time,
  event_date AS date
FROM public.webhook_event_rollups_daily
WHERE event_count > 0;

GRANT SELECT ON public.webhook_stats TO authenticated, service_role;

-- ============================================================================
-- 4. JWT & Role Helpers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    CASE 
      WHEN auth.role() = 'service_role' THEN 'service_role'
      WHEN (auth.jwt() -> 'app_metadata' ->> 'role') IN ('superadmin', 'super-admin', 'super admin', 'super_admin') THEN 'superadmin'
      ELSE auth.jwt() -> 'app_metadata' ->> 'role'
    END,
    'customer'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'sales', 'accounts', 'superadmin')
  );
$$;

-- Trigger to sync roles to auth metadata
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role::text)
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;
CREATE TRIGGER trg_sync_profile_role
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_auth();

-- Role change protection trigger (Hardened to guard INSERT and UPDATE)
CREATE OR REPLACE FUNCTION public.protect_profile_role_column()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.role IS DISTINCT FROM 'customer' AND NOT (
            public.is_admin_user() OR 
            auth.role() = 'service_role' OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
        ) THEN
            NEW.role := 'customer';
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.role IS DISTINCT FROM NEW.role AND NOT (
            public.is_admin_user() OR 
            auth.role() = 'service_role' OR
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
        ) THEN
            NEW.role := OLD.role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_protect_profile_role_column ON public.profiles;
CREATE TRIGGER tr_protect_profile_role_column
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role_column();

-- ============================================================================
-- 5. Row Level Security Policies
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsn_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin_token_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_archive_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_recovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_broadcast_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_installation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_event_rollups_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Product Policies
DROP POLICY IF EXISTS rls_products_public_read ON public.products;
CREATE POLICY rls_products_public_read ON public.products FOR SELECT USING (is_deleted = FALSE AND status = 'active');
DROP POLICY IF EXISTS rls_products_admin_manage ON public.products;
CREATE POLICY rls_products_admin_manage ON public.products FOR ALL TO authenticated USING (public.is_manager_or_admin());

-- Profile Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- Order Policies
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
CREATE POLICY "Staff can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.is_staff_member());

-- Order Items Policies
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
CREATE POLICY "Staff can view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.is_staff_member());

-- Inventory Policies
DROP POLICY IF EXISTS inventory_staff_all ON public.inventory;
CREATE POLICY inventory_staff_all ON public.inventory FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

DROP POLICY IF EXISTS inventory_current_staff_all ON public.inventory_current;
CREATE POLICY inventory_current_staff_all ON public.inventory_current FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- Stock Movements Policies
DROP POLICY IF EXISTS "Staff can manage all stock movements" ON public.stock_movements;
CREATE POLICY "Staff can manage all stock movements" ON public.stock_movements FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- Services Policies
DROP POLICY IF EXISTS "Allow public read access to active services" ON public.services;
CREATE POLICY "Allow public read access to active services" ON public.services FOR SELECT USING (is_active = true AND status = 'active');
DROP POLICY IF EXISTS "Staff can manage all services" ON public.services;
CREATE POLICY "Staff can manage all services" ON public.services FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- FAQ Policies
DROP POLICY IF EXISTS "Allow public read access to published FAQs" ON public.faqs;
CREATE POLICY "Allow public read access to published FAQs" ON public.faqs FOR SELECT USING (is_published = true);

-- Payment Transactions Policies
DROP POLICY IF EXISTS "Staff can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Staff can view all payment transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (public.is_staff_member());
DROP POLICY IF EXISTS "Customers can view own payment transactions" ON public.payment_transactions;
CREATE POLICY "Customers can view own payment transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payment_transactions.order_id AND orders.customer_id = auth.uid()));

-- Product Archive Log Policies
DROP POLICY IF EXISTS "Staff can view product archive log" ON public.product_archive_log;
CREATE POLICY "Staff can view product archive log" ON public.product_archive_log FOR SELECT TO authenticated USING (public.is_manager_or_admin());
DROP POLICY IF EXISTS "Staff can insert product archive log" ON public.product_archive_log;
CREATE POLICY "Staff can insert product archive log" ON public.product_archive_log FOR INSERT TO authenticated WITH CHECK (public.is_manager_or_admin());

-- Superadmin Token Blocklist Policies
DROP POLICY IF EXISTS "Superadmins can manage token blocklist" ON public.superadmin_token_blocklist;
CREATE POLICY "Superadmins can manage token blocklist" ON public.superadmin_token_blocklist FOR ALL TO authenticated USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());

-- Security Table Policies
DROP POLICY IF EXISTS security_audit_log_superadmin_only ON public.security_audit_log;
CREATE POLICY security_audit_log_superadmin_only ON public.security_audit_log FOR ALL TO authenticated USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());
DROP POLICY IF EXISTS security_settings_superadmin_only ON public.security_settings;
CREATE POLICY security_settings_superadmin_only ON public.security_settings FOR ALL TO authenticated USING (public.is_superadmin_user()) WITH CHECK (public.is_superadmin_user());

-- Wishlist Policies
DROP POLICY IF EXISTS "Users can view own wishlist items" ON public.wishlist_items;
CREATE POLICY "Users can view own wishlist items" ON public.wishlist_items FOR SELECT TO authenticated USING (profile_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON public.wishlist_items;
CREATE POLICY "Users can insert own wishlist items" ON public.wishlist_items FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON public.wishlist_items;
CREATE POLICY "Users can delete own wishlist items" ON public.wishlist_items FOR DELETE TO authenticated USING (profile_id = auth.uid());

-- Quotes Policies
DROP POLICY IF EXISTS "Users can read own quotes" ON public.quotes;
CREATE POLICY "Users can read own quotes" ON public.quotes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own quotes" ON public.quotes;
CREATE POLICY "Users can insert own quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Staff can manage all quotes" ON public.quotes;
CREATE POLICY "Staff can manage all quotes" ON public.quotes FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- Advance Payment Requests Policies (Hardened to use secure functions instead of insecure auth.jwt() ->> 'role')
DROP POLICY IF EXISTS "Customers can view their own advance requests" ON public.advance_payment_requests;
CREATE POLICY "Customers can view their own advance requests" ON public.advance_payment_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = advance_payment_requests.quote_id AND quotes.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can view all advance requests" ON public.advance_payment_requests;
CREATE POLICY "Admins can view all advance requests" ON public.advance_payment_requests FOR SELECT TO authenticated USING (public.is_manager_or_admin());
DROP POLICY IF EXISTS "Admins can create advance requests" ON public.advance_payment_requests;
CREATE POLICY "Admins can create advance requests" ON public.advance_payment_requests FOR INSERT TO authenticated WITH CHECK (public.is_manager_or_admin());
DROP POLICY IF EXISTS "Admins can update advance requests" ON public.advance_payment_requests;
CREATE POLICY "Admins can update advance requests" ON public.advance_payment_requests FOR UPDATE TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());
DROP POLICY IF EXISTS "Customers can update their advance requests" ON public.advance_payment_requests;
CREATE POLICY "Customers can update their advance requests" ON public.advance_payment_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = advance_payment_requests.quote_id AND quotes.user_id = auth.uid()));

-- Sales Agents Policies
DROP POLICY IF EXISTS "Users can apply for sales agent" ON public.sales_agents;
CREATE POLICY "Users can apply for sales agent" ON public.sales_agents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Agents and staff can view agent data" ON public.sales_agents;
CREATE POLICY "Agents and staff can view agent data" ON public.sales_agents FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff_member());
DROP POLICY IF EXISTS "Staff can manage agents" ON public.sales_agents;
CREATE POLICY "Staff can manage agents" ON public.sales_agents FOR ALL TO authenticated USING (public.is_manager_or_admin());

-- Sales Agent Commissions Policies
DROP POLICY IF EXISTS "Agents can view own commissions" ON public.sales_agent_commissions;
CREATE POLICY "Agents can view own commissions" ON public.sales_agent_commissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sales_agents WHERE sales_agents.id = sales_agent_commissions.agent_id AND sales_agents.user_id = auth.uid()));
DROP POLICY IF EXISTS "Staff can view all commissions" ON public.sales_agent_commissions;
CREATE POLICY "Staff can view all commissions" ON public.sales_agent_commissions FOR SELECT TO authenticated USING (public.is_staff_member());
DROP POLICY IF EXISTS "Staff can insert commissions" ON public.sales_agent_commissions;
CREATE POLICY "Staff can insert commissions" ON public.sales_agent_commissions FOR INSERT TO authenticated WITH CHECK (public.is_staff_member());
DROP POLICY IF EXISTS "Staff can manage commissions" ON public.sales_agent_commissions;
CREATE POLICY "Staff can manage commissions" ON public.sales_agent_commissions FOR ALL TO authenticated USING (public.is_manager_or_admin());

-- Agent Commission Rules Policies
DROP POLICY IF EXISTS "Agents can view rules" ON public.agent_commission_rules;
CREATE POLICY "Agents can view rules" ON public.agent_commission_rules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sales_agents WHERE sales_agents.id = agent_commission_rules.agent_id AND sales_agents.user_id = auth.uid()) OR public.is_staff_member());
DROP POLICY IF EXISTS "Admins can manage rules" ON public.agent_commission_rules;
CREATE POLICY "Admins can manage rules" ON public.agent_commission_rules FOR ALL TO authenticated USING (public.is_manager_or_admin());

-- Agent Redemption Requests Policies
DROP POLICY IF EXISTS "Agents can view own redemptions" ON public.agent_redemption_requests;
CREATE POLICY "Agents can view own redemptions" ON public.agent_redemption_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sales_agents WHERE sales_agents.id = agent_redemption_requests.agent_id AND sales_agents.user_id = auth.uid()));
DROP POLICY IF EXISTS "Agents can insert redemptions" ON public.agent_redemption_requests;
CREATE POLICY "Agents can insert redemptions" ON public.agent_redemption_requests FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.sales_agents WHERE sales_agents.id = agent_redemption_requests.agent_id AND sales_agents.user_id = auth.uid()));
DROP POLICY IF EXISTS "Staff can view all redemptions" ON public.agent_redemption_requests;
CREATE POLICY "Staff can view all redemptions" ON public.agent_redemption_requests FOR SELECT TO authenticated USING (public.is_staff_member());
DROP POLICY IF EXISTS "Staff can update redemptions" ON public.agent_redemption_requests;
CREATE POLICY "Staff can update redemptions" ON public.agent_redemption_requests FOR UPDATE TO authenticated USING (public.is_staff_member());

-- Service Engineers Policies
DROP POLICY IF EXISTS "Engineers can view own profile" ON public.service_engineers;
CREATE POLICY "Engineers can view own profile" ON public.service_engineers FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Staff can view all engineers" ON public.service_engineers;
CREATE POLICY "Staff can view all engineers" ON public.service_engineers FOR SELECT TO authenticated USING (public.is_staff_member());
DROP POLICY IF EXISTS "Admins can manage engineers" ON public.service_engineers;
CREATE POLICY "Admins can manage engineers" ON public.service_engineers FOR ALL TO authenticated USING (public.is_manager_or_admin());

-- Service Tickets Policies
DROP POLICY IF EXISTS "Customers can view own tickets" ON public.service_tickets;
CREATE POLICY "Customers can view own tickets" ON public.service_tickets FOR SELECT TO authenticated USING (customer_id = auth.uid());
DROP POLICY IF EXISTS "Engineers can view assigned tickets" ON public.service_tickets;
CREATE POLICY "Engineers can view assigned tickets" ON public.service_tickets FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.service_engineers WHERE service_engineers.id = service_tickets.assigned_engineer_id AND service_engineers.user_id = auth.uid()));
DROP POLICY IF EXISTS "Staff can view all tickets" ON public.service_tickets;
CREATE POLICY "Staff can view all tickets" ON public.service_tickets FOR SELECT TO authenticated USING (public.is_staff_member());
DROP POLICY IF EXISTS "Customers can create tickets" ON public.service_tickets;
CREATE POLICY "Customers can create tickets" ON public.service_tickets FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
DROP POLICY IF EXISTS "Engineers can update assigned tickets" ON public.service_tickets;
CREATE POLICY "Engineers can update assigned tickets" ON public.service_tickets FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.service_engineers WHERE service_engineers.id = service_tickets.assigned_engineer_id AND service_engineers.user_id = auth.uid()) OR public.is_staff_member());
DROP POLICY IF EXISTS "Admins can manage tickets" ON public.service_tickets;
CREATE POLICY "Admins can manage tickets" ON public.service_tickets FOR ALL TO authenticated USING (public.is_manager_or_admin());

-- Service Parts Policies
DROP POLICY IF EXISTS "Engineers and customers can view parts" ON public.service_parts;
CREATE POLICY "Engineers and customers can view parts" ON public.service_parts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.service_tickets WHERE service_tickets.id = service_parts.ticket_id AND (service_tickets.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.service_engineers WHERE service_engineers.id = service_tickets.assigned_engineer_id AND service_engineers.user_id = auth.uid()))) OR public.is_staff_member());
DROP POLICY IF EXISTS "Staff can manage parts" ON public.service_parts;
CREATE POLICY "Staff can manage parts" ON public.service_parts FOR ALL TO authenticated USING (public.is_staff_member());

-- Marketing Broadcast Logs Policies
DROP POLICY IF EXISTS "Admins can insert broadcast logs" ON public.marketing_broadcast_logs;
CREATE POLICY "Admins can insert broadcast logs" ON public.marketing_broadcast_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')));
DROP POLICY IF EXISTS "Admins can view broadcast logs" ON public.marketing_broadcast_logs;
CREATE POLICY "Admins can view broadcast logs" ON public.marketing_broadcast_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')));
DROP POLICY IF EXISTS "Service role full access on marketing_broadcast_logs" ON public.marketing_broadcast_logs;
CREATE POLICY "Service role full access on marketing_broadcast_logs" ON public.marketing_broadcast_logs FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Free Installation Slots Policies (Hardened to prevent unauthorized direct modifications)
DROP POLICY IF EXISTS "Allow public read access to free installation slots" ON public.free_installation_slots;
CREATE POLICY "Allow public read access to free installation slots" ON public.free_installation_slots FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow authenticated update of free installation slots" ON public.free_installation_slots;
CREATE POLICY "Allow authenticated update of free installation slots" ON public.free_installation_slots FOR UPDATE TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- Innovation Modes Policies
DROP POLICY IF EXISTS "Allow public read access to active innovation modes" ON public.innovation_modes;
CREATE POLICY "Allow public read access to active innovation modes" ON public.innovation_modes FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage innovation modes" ON public.innovation_modes;
CREATE POLICY "Admins can manage innovation modes" ON public.innovation_modes FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- Innovation Devices Policies
DROP POLICY IF EXISTS "Allow public read access to active innovation devices" ON public.innovation_devices;
CREATE POLICY "Allow public read access to active innovation devices" ON public.innovation_devices FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage innovation devices" ON public.innovation_devices;
CREATE POLICY "Admins can manage innovation devices" ON public.innovation_devices FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- Settings Policies
DROP POLICY IF EXISTS "Allow public read access to public settings" ON public.settings;
CREATE POLICY "Allow public read access to public settings" ON public.settings FOR SELECT USING (is_public = true);
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- Whatsapp Messages Policies
DROP POLICY IF EXISTS "Staff can manage whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Staff can manage whatsapp messages" ON public.whatsapp_messages FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.webhook_events;
CREATE POLICY "Service role can manage webhook events" ON public.webhook_events FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff can view webhook events" ON public.webhook_events;
CREATE POLICY "Staff can view webhook events" ON public.webhook_events FOR SELECT TO authenticated USING (public.is_staff_member());

DROP POLICY IF EXISTS "Service role can manage webhook rollups" ON public.webhook_event_rollups_daily;
CREATE POLICY "Service role can manage webhook rollups" ON public.webhook_event_rollups_daily FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Staff can view webhook rollups" ON public.webhook_event_rollups_daily;
CREATE POLICY "Staff can view webhook rollups" ON public.webhook_event_rollups_daily FOR SELECT TO authenticated USING (public.is_staff_member());

DROP POLICY IF EXISTS "Staff can manage customers" ON public.customers;
CREATE POLICY "Staff can manage customers" ON public.customers FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());
DROP POLICY IF EXISTS "Service role can manage customers" ON public.customers;
CREATE POLICY "Service role can manage customers" ON public.customers FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Staff can manage customer interactions" ON public.customer_interactions;
CREATE POLICY "Staff can manage customer interactions" ON public.customer_interactions FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());
DROP POLICY IF EXISTS "Service role can manage customer interactions" ON public.customer_interactions;
CREATE POLICY "Service role can manage customer interactions" ON public.customer_interactions FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can manage own communication preferences" ON public.user_communication_preferences;
CREATE POLICY "Users can manage own communication preferences" ON public.user_communication_preferences FOR ALL TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Staff can view communication preferences" ON public.user_communication_preferences;
CREATE POLICY "Staff can view communication preferences" ON public.user_communication_preferences FOR SELECT TO authenticated USING (public.is_staff_member());

-- Order OTP Verifications Policies
DROP POLICY IF EXISTS "Staff can manage OTP verifications" ON public.order_otp_verifications;
CREATE POLICY "Staff can manage OTP verifications" ON public.order_otp_verifications FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- Tax Rates Policies
DROP POLICY IF EXISTS "Allow public read access to tax rates" ON public.tax_rates;
CREATE POLICY "Allow public read access to tax rates" ON public.tax_rates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage tax rates" ON public.tax_rates;
CREATE POLICY "Admins can manage tax rates" ON public.tax_rates FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- HSN Codes Policies
DROP POLICY IF EXISTS "Allow public read access to hsn codes" ON public.hsn_codes;
CREATE POLICY "Allow public read access to hsn codes" ON public.hsn_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage hsn codes" ON public.hsn_codes;
CREATE POLICY "Admins can manage hsn codes" ON public.hsn_codes FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- Policies Table Policies
DROP POLICY IF EXISTS "Allow public read access to published policies" ON public.policies;
CREATE POLICY "Allow public read access to published policies" ON public.policies FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins can manage policies" ON public.policies;
CREATE POLICY "Admins can manage policies" ON public.policies FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- Payment Recovery Queue Policies
DROP POLICY IF EXISTS "Staff can manage payment recovery queue" ON public.payment_recovery_queue;
CREATE POLICY "Staff can manage payment recovery queue" ON public.payment_recovery_queue FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- Coupons Policies
DROP POLICY IF EXISTS "Allow public read access to active coupons" ON public.coupons;
CREATE POLICY "Allow public read access to active coupons" ON public.coupons FOR SELECT USING (status = 'active' AND (expiry_date IS NULL OR expiry_date > NOW()));
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.is_manager_or_admin()) WITH CHECK (public.is_manager_or_admin());

-- ============================================================================
-- 6. Core Database Functions
-- ============================================================================

-- Soft Delete Product
CREATE OR REPLACE FUNCTION public.soft_delete_product(
  p_product_id   UUID,
  p_deleted_by   UUID,
  p_reason       TEXT DEFAULT 'Administrative removal'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product RECORD;
BEGIN
  IF NOT public.is_manager_or_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT id, title, status, is_deleted INTO v_product FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', p_product_id; END IF;
  IF v_product.is_deleted THEN RAISE EXCEPTION 'Product % is already deleted', p_product_id; END IF;
  
  UPDATE public.products 
  SET is_deleted = TRUE, 
      deleted_at = NOW(), 
      deleted_by = p_deleted_by, 
      status = 'archived', 
      archived_at = NOW(), 
      archived_by = p_deleted_by, 
      archive_reason = p_reason, 
      updated_at = NOW() 
  WHERE id = p_product_id;

  -- Write snapshot to product_archive_log
  INSERT INTO public.product_archive_log (product_id, product_snapshot, archived_at, archived_by, reason)
  SELECT id, to_jsonb(p.*), NOW(), p_deleted_by, p_reason
  FROM public.products p
  WHERE id = p_product_id;

  RETURN jsonb_build_object('product_id', p_product_id, 'title', v_product.title, 'archived_at', NOW(), 'archived_by', p_deleted_by, 'reason', p_reason);
END;
$$;

-- Restore Product
CREATE OR REPLACE FUNCTION public.restore_product(
  p_product_id   UUID,
  p_restored_by  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product RECORD;
BEGIN
  IF NOT public.is_manager_or_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT id, title, status, is_deleted INTO v_product FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product % not found', p_product_id; END IF;
  IF NOT v_product.is_deleted THEN RAISE EXCEPTION 'Product % is not archived', p_product_id; END IF;
  
  UPDATE public.products 
  SET is_deleted = FALSE, 
      status = 'active', 
      deleted_at = NULL, 
      deleted_by = NULL, 
      archived_at = NULL, 
      archived_by = NULL, 
      archive_reason = NULL, 
      updated_at = NOW(),
      updated_by = p_restored_by
  WHERE id = p_product_id;
  
  RETURN jsonb_build_object('product_id', p_product_id, 'title', v_product.title, 'restored_at', NOW(), 'restored_by', p_restored_by);
END;
$$;

-- Increment Agent Points
CREATE OR REPLACE FUNCTION public.increment_agent_points(
  agent_id UUID,
  points_to_add NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_staff_member() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.sales_agents
  SET points_balance = COALESCE(points_balance, 0) + points_to_add,
      updated_at = NOW()
  WHERE id = agent_id;
END;
$$;

-- Record Atomic Stock Movement
CREATE OR REPLACE FUNCTION public.record_atomic_stock_movement(
  p_product_id     UUID,
  p_movement_type  TEXT,
  p_quantity       INTEGER,
  p_reference_id   TEXT    DEFAULT NULL,
  p_reference_type TEXT    DEFAULT 'manual',
  p_notes          TEXT    DEFAULT NULL,
  p_allow_negative BOOLEAN DEFAULT FALSE,
  p_created_by     UUID    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_qty  INTEGER;
  v_min_stock    INTEGER;
  v_new_qty      INTEGER;
  v_new_status   TEXT;
  v_movement_id  UUID;
  v_inbound      TEXT[] := ARRAY['purchase_receipt', 'return'];
  v_outbound     TEXT[] := ARRAY['walk_in_sale', 'online_sale'];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product % not found', p_product_id USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.inventory_current (product_id, stock_quantity, min_stock_level, stock_status)
  SELECT id, COALESCE(stock_quantity, 0), COALESCE(min_stock_level, 0), COALESCE(stock_status, 'in_stock')
  FROM public.products
  WHERE id = p_product_id
  ON CONFLICT (product_id) DO NOTHING;

  SELECT COALESCE(stock_quantity, 0), COALESCE(min_stock_level, 0)
  INTO v_current_qty, v_min_stock
  FROM public.inventory_current
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF p_movement_type = ANY(v_inbound) THEN v_new_qty := v_current_qty + p_quantity;
  ELSIF p_movement_type = ANY(v_outbound) THEN v_new_qty := v_current_qty - p_quantity;
    IF v_new_qty < 0 AND NOT p_allow_negative THEN RAISE EXCEPTION 'Insufficient stock' USING ERRCODE = 'P0001'; END IF;
  ELSIF p_movement_type = 'adjustment' THEN v_new_qty := p_quantity;
  ELSE v_new_qty := v_current_qty; END IF;
  v_new_status := CASE WHEN v_new_qty <= 0 THEN 'out_of_stock' WHEN v_new_qty <= v_min_stock THEN 'low_stock' ELSE 'in_stock' END;

  UPDATE public.inventory_current
  SET stock_quantity = v_new_qty,
      stock_status = v_new_status,
      updated_by = COALESCE(p_created_by, auth.uid()),
      updated_at = NOW()
  WHERE product_id = p_product_id;

  -- Maintain compatibility for existing readers while keeping the narrow
  -- inventory_current row as the concurrency lock target.
  UPDATE public.products SET stock_quantity = v_new_qty, stock_status = v_new_status, updated_at = NOW() WHERE id = p_product_id;
  INSERT INTO public.stock_movements (product_id, movement_type, quantity_delta, quantity_before, quantity_after, reference_id, reference_type, notes, created_by)
  VALUES (p_product_id, p_movement_type, p_quantity, v_current_qty, v_new_qty, p_reference_id, p_reference_type, COALESCE(p_notes, p_movement_type || ' via system'), COALESCE(p_created_by, auth.uid()))
  RETURNING id INTO v_movement_id;
  RETURN jsonb_build_object('movement_id', v_movement_id, 'quantity_after', v_new_qty, 'stock_status', v_new_status);
END;
$$;

-- Atomic Order Inventory Allocation (Sorted processing to prevent deadlocks and hardened params)
CREATE OR REPLACE FUNCTION public.allocate_order_inventory_atomic(
  p_customer_name   TEXT,
  p_customer_id     UUID,
  p_customer_email  TEXT,
  p_customer_phone  TEXT,
  p_delivery_address TEXT,
  p_notes           TEXT,
  p_payment_method  TEXT,
  p_subtotal        NUMERIC,
  p_gst_amount      NUMERIC,
  p_total           NUMERIC,
  p_discount_amount NUMERIC,
  p_shipping_amount NUMERIC,
  p_payment_status  TEXT,
  p_order_type      TEXT,
  p_items           JSONB,
  p_agent_id        UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item         RECORD;
  v_order_id     UUID;
  v_order_row    JSONB;
BEGIN
  IF p_customer_id IS DISTINCT FROM auth.uid() AND NOT public.is_staff_member() THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Access denied: cannot allocate inventory for another user');
  END IF;

  INSERT INTO public.orders (
    customer_id, customer_name, customer_email, customer_phone, delivery_address, notes, payment_method, subtotal, gst_amount, total, discount_amount, shipping_amount, payment_status, status, items, agent_id
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone, p_delivery_address, p_notes, p_payment_method, p_subtotal, p_gst_amount, p_total, p_discount_amount, p_shipping_amount, COALESCE(p_payment_status, 'Awaiting Payment'), 'Pending', p_items, p_agent_id
  ) RETURNING id INTO v_order_id;

  -- Process and lock products in consistent sorted order to prevent concurrency deadlocks
  FOR v_item IN 
    SELECT 
      COALESCE((value->>'product_id')::UUID, (value->>'id')::UUID) AS product_id,
      (value->>'quantity')::INTEGER AS quantity
    FROM jsonb_array_elements(p_items->'cart_items')
    WHERE COALESCE((value->>'product_id')::UUID, (value->>'id')::UUID) IS NOT NULL
    ORDER BY 1 -- Sort consistently by product ID
  LOOP
    IF v_item.quantity > 0 THEN
      PERFORM public.record_atomic_stock_movement(v_item.product_id, 'online_sale', v_item.quantity, v_order_id::TEXT, 'online_order', 'Inventory allocated for order ' || v_order_id, FALSE, p_customer_id);
    END IF;
  END LOOP;
  SELECT to_jsonb(o.*) INTO v_order_row FROM public.orders o WHERE id = v_order_id;
  RETURN jsonb_build_object('success', TRUE, 'order', v_order_row);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

-- Atomic OTP Verification (Hardened for authorization check)
CREATE OR REPLACE FUNCTION public.verify_order_otp_atomic(
  p_order_id       UUID,
  p_customer_phone TEXT,
  p_otp_code       TEXT,
  p_max_attempts   INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_otp_record RECORD;
  v_now        TIMESTAMPTZ := NOW();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = p_order_id 
      AND (customer_id = auth.uid() OR customer_id IS NULL OR public.is_staff_member())
  ) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Access denied');
  END IF;

  SELECT * INTO v_otp_record FROM public.order_otp_verifications WHERE order_id = p_order_id AND customer_phone = p_customer_phone AND verified = FALSE FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'OTP not found or already verified'); END IF;
  IF v_otp_record.expires_at < v_now THEN RETURN jsonb_build_object('success', FALSE, 'error', 'OTP has expired'); END IF;
  IF v_otp_record.attempts >= p_max_attempts THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Maximum verification attempts exceeded'); END IF;
  UPDATE public.order_otp_verifications SET attempts = attempts + 1 WHERE id = v_otp_record.id;
  IF v_otp_record.otp_code = p_otp_code THEN
    UPDATE public.order_otp_verifications SET verified = TRUE, verified_at = v_now WHERE id = v_otp_record.id;
    UPDATE public.orders SET otp_verified = TRUE, updated_at = v_now WHERE id = p_order_id;
    RETURN jsonb_build_object('success', TRUE, 'verified', TRUE);
  ELSE
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid OTP code', 'attempts_left', p_max_attempts - (v_otp_record.attempts + 1));
  END IF;
END;
$$;

-- Transaction-safe Order Status Update (Hardened for authorization, checks transitions, sorted stock reversion)
CREATE OR REPLACE FUNCTION public.update_order_status_v1(
  target_order_id UUID,
  new_status TEXT,
  new_payment_status TEXT,
  additional_data JSONB,
  p_pickup_code TEXT,
  p_processed_by UUID
)
RETURNS VOID AS $$
DECLARE
  v_key TEXT;
  v_val JSONB;
  v_current_status TEXT;
  v_current_payment_status TEXT;
  v_items_json JSONB;
  v_item RECORD;
BEGIN
  SELECT status, payment_status, items INTO v_current_status, v_current_payment_status, v_items_json
  FROM public.orders
  WHERE id = target_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', target_order_id;
  END IF;

  -- Authorization check
  IF NOT public.is_staff_member() THEN
    IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM (SELECT customer_id FROM public.orders WHERE id = target_order_id) THEN
      RAISE EXCEPTION 'Access denied';
    END IF;
    -- Customer is calling. They can only transition to 'Cancelled' and only if current status is 'Pending'.
    IF new_status IS DISTINCT FROM 'Cancelled' THEN
      RAISE EXCEPTION 'Customers can only cancel orders';
    END IF;
    IF v_current_status IS DISTINCT FROM 'Pending' THEN
      RAISE EXCEPTION 'Only pending orders can be cancelled';
    END IF;
  END IF;

  IF v_current_status IN ('Cancelled', 'Rejected', 'Completed', 'Delivered') AND new_status NOT IN ('Cancelled', 'Rejected', 'Completed', 'Delivered') THEN
    RAISE EXCEPTION 'Cannot transition order % from terminal state (%) to %', target_order_id, v_current_status, new_status;
  END IF;

  UPDATE public.orders
  SET
    status = new_status,
    payment_status = COALESCE(new_payment_status, payment_status),
    processed_by = p_processed_by,
    updated_at = NOW()
  WHERE id = target_order_id;

  IF additional_data IS NOT NULL THEN
    FOR v_key, v_val IN SELECT * FROM jsonb_each(additional_data) LOOP
      IF v_key = 'cancellation_reason' THEN
        UPDATE public.orders SET cancellation_reason = v_val#>>'{}' WHERE id = target_order_id;
      ELSIF v_key = 'payment_reference' THEN
        UPDATE public.orders SET payment_reference = v_val#>>'{}' WHERE id = target_order_id;
      ELSIF v_key = 'notes' THEN
        UPDATE public.orders SET notes = v_val#>>'{}' WHERE id = target_order_id;
      ELSIF v_key = 'shipping_amount' THEN
        UPDATE public.orders SET shipping_amount = (v_val#>>'{}')::NUMERIC WHERE id = target_order_id;
      ELSIF v_key = 'discount_amount' THEN
        UPDATE public.orders SET discount_amount = (v_val#>>'{}')::NUMERIC WHERE id = target_order_id;
      END IF;
    END LOOP;
  END IF;

  IF p_pickup_code IS NOT NULL AND p_pickup_code <> '' THEN
    UPDATE public.orders SET pickup_code = p_pickup_code WHERE id = target_order_id;
  END IF;

  IF new_status IN ('Cancelled', 'Rejected') THEN
    UPDATE public.orders
    SET
      cancelled_at = NOW(),
      cancelled_by = p_processed_by
    WHERE id = target_order_id;

    IF v_current_status NOT IN ('Cancelled', 'Rejected') AND v_items_json IS NOT NULL THEN
      -- Revert stock using sorted IDs to prevent deadlocks
      FOR v_item IN 
        SELECT 
          COALESCE((value->>'id')::uuid, (value->>'product_id')::uuid) AS id, 
          (value->>'quantity')::integer AS quantity 
        FROM jsonb_array_elements(v_items_json->'cart_items') 
        WHERE COALESCE((value->>'id')::uuid, (value->>'product_id')::uuid) IS NOT NULL
        ORDER BY 1 -- Sort consistently
      LOOP
        PERFORM public.record_atomic_stock_movement(
          v_item.id,
          'return',
          v_item.quantity,
          target_order_id::TEXT,
          'online_order',
          'Reverted stock due to order cancellation',
          true,
          p_processed_by
        );
      END LOOP;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Transaction-safe Service Completion (Hardened for authorization and parts fields)
CREATE OR REPLACE FUNCTION public.complete_service_ticket_v1(
  p_ticket_id          UUID,
  p_engineer_notes     TEXT,
  p_service_charge     NUMERIC,
  p_actual_duration    INTEGER,
  p_photos             TEXT[],
  p_parts_used         JSONB -- Array of parts
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_part RECORD;
  v_total_parts_cost NUMERIC := 0;
  v_total_cost NUMERIC := 0;
  v_current_status TEXT;
BEGIN
  -- Authorization check: caller must be staff or the assigned service engineer
  IF NOT (
    public.is_staff_member() OR
    EXISTS (
      SELECT 1 FROM public.service_engineers 
      WHERE service_engineers.id = (SELECT assigned_engineer_id FROM public.service_tickets WHERE id = p_ticket_id)
        AND service_engineers.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: you are not authorized to complete this service ticket';
  END IF;

  SELECT status INTO v_current_status
  FROM public.service_tickets
  WHERE id = p_ticket_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service ticket % not found', p_ticket_id;
  END IF;

  IF v_current_status = 'completed' THEN
    RAISE EXCEPTION 'Service ticket % is already completed', p_ticket_id;
  END IF;

  IF p_parts_used IS NOT NULL AND jsonb_array_length(p_parts_used) > 0 THEN
    FOR v_part IN SELECT * FROM jsonb_to_recordset(p_parts_used) AS x(product_id UUID, part_name TEXT, quantity INTEGER, unit_cost NUMERIC, warranty_days INTEGER) LOOP
      INSERT INTO public.service_parts (
        ticket_id, product_id, part_name, quantity, unit_cost, warranty_days
      ) VALUES (
        p_ticket_id, v_part.product_id, v_part.part_name, v_part.quantity, v_part.unit_cost, COALESCE(v_part.warranty_days, 0)
      );
      v_total_parts_cost := v_total_parts_cost + (v_part.quantity * v_part.unit_cost);
    END LOOP;
  END IF;

  v_total_cost := COALESCE(p_service_charge, 0) + v_total_parts_cost;

  UPDATE public.service_tickets
  SET
    status = 'completed',
    completed_at = NOW(),
    engineer_notes = p_engineer_notes,
    service_charge = p_service_charge,
    parts_cost = v_total_parts_cost,
    total_cost = v_total_cost,
    actual_duration = p_actual_duration,
    photos = p_photos,
    updated_at = NOW()
  WHERE id = p_ticket_id;

  RETURN v_total_cost;
END;
$$;

-- Wishlist matchmaking function and trigger
CREATE OR REPLACE FUNCTION public.match_wishlist_coupons()
RETURNS TRIGGER AS $$
DECLARE
    user_wishlist_count INT;
    available_coupon_code TEXT;
    marketing_meta JSONB;
BEGIN
    SELECT COUNT(*) INTO user_wishlist_count 
    FROM public.wishlist_items 
    WHERE profile_id = NEW.profile_id;

    IF user_wishlist_count >= 3 AND NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE customer_email = (SELECT email FROM public.profiles WHERE id = NEW.profile_id)
    ) THEN
        SELECT code INTO available_coupon_code 
        FROM public.coupons 
        WHERE status = 'active' 
        AND type = 'percentage'
        AND (expiry_date IS NULL OR expiry_date > NOW())
        ORDER BY value DESC
        LIMIT 1;

        IF available_coupon_code IS NOT NULL THEN
            SELECT marketing_metadata INTO marketing_meta FROM public.profiles WHERE id = NEW.profile_id;
            marketing_meta = jsonb_set(
                COALESCE(marketing_meta, '{}'::jsonb), 
                '{suggested_coupon}', 
                jsonb_build_object(
                    'code', available_coupon_code,
                    'reason', 'wishlist_loyalty',
                    'matched_at', NOW()
                )
            );
            
            UPDATE public.profiles 
            SET marketing_metadata = marketing_meta 
            WHERE id = NEW.profile_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_match_wishlist_coupons ON public.wishlist_items;
CREATE TRIGGER trigger_match_wishlist_coupons
AFTER INSERT ON public.wishlist_items
FOR EACH ROW EXECUTE FUNCTION public.match_wishlist_coupons();

-- Advance payment status change tracking function and trigger
CREATE OR REPLACE FUNCTION public.track_advance_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource,
      details,
      severity,
      event_type,
      event_data
    ) VALUES (
      auth.uid(),
      'status_update',
      'advance_payment_requests',
      jsonb_build_object(
        'table_name', 'advance_payment_requests',
        'record_id', NEW.id,
        'old_value', OLD.status,
        'new_value', NEW.status
      ),
      'info',
      'advance_payment_status_change',
      jsonb_build_object(
        'table_name', 'advance_payment_requests',
        'record_id', NEW.id,
        'old_value', OLD.status,
        'new_value', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS advance_payment_status_change_trigger ON public.advance_payment_requests;
CREATE TRIGGER advance_payment_status_change_trigger
AFTER UPDATE ON public.advance_payment_requests
FOR EACH ROW EXECUTE FUNCTION public.track_advance_payment_status_change();

-- Free Installation Slots Functions (Hardened for concurrency and direct order linkage)
CREATE OR REPLACE FUNCTION public.get_or_create_monthly_slot()
RETURNS TABLE (id UUID, remaining_slots INTEGER) AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Concurrent-safe upsert with DO NOTHING to prevent unique constraints crashes
  INSERT INTO public.free_installation_slots (month, total_slots, remaining_slots, confirmed_count)
  VALUES (v_month, 10, 10, 0)
  ON CONFLICT (month) DO NOTHING;
  
  SELECT f.id, f.remaining_slots INTO id, remaining_slots
  FROM public.free_installation_slots f
  WHERE f.month = v_month;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.decrement_free_installation_slot(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_month DATE;
  v_customer_id UUID;
  v_slot_id UUID;
BEGIN
  -- Validate that order exists, is owned by caller or caller is staff, and hasn't had slot decremented
  SELECT customer_id INTO v_customer_id FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF (v_customer_id IS NULL OR auth.uid() IS NULL OR v_customer_id IS DISTINCT FROM auth.uid()) AND NOT public.is_staff_member() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF COALESCE((SELECT (metadata->>'free_installation_slot_decremented')::BOOLEAN FROM public.orders WHERE id = p_order_id), FALSE) THEN
    RETURN TRUE; -- already decremented
  END IF;

  v_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  INSERT INTO public.free_installation_slots (month, total_slots, remaining_slots, confirmed_count)
  VALUES (v_month, 10, 10, 0)
  ON CONFLICT (month) DO NOTHING;
  
  UPDATE public.free_installation_slots 
  SET remaining_slots = remaining_slots - 1,
      confirmed_count = confirmed_count + 1,
      updated_at = NOW()
  WHERE month = v_month
    AND remaining_slots > 0
  RETURNING id INTO v_slot_id;

  IF v_slot_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.orders 
  SET used_free_installation = TRUE,
      metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{free_installation_slot_decremented}', 'true'::jsonb),
      updated_at = NOW()
  WHERE id = p_order_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- ============================================================================
-- 7. Seed Defaults
-- ============================================================================

INSERT INTO public.tax_rates (name, rate, is_default, description)
VALUES ('GST 5%', 5.00, false, '5% GST'), ('GST 12%', 12.00, false, '12% GST'), ('GST 18%', 18.00, true, '18% GST'), ('GST 28%', 28.00, false, '28% GST')
ON CONFLICT (name) DO UPDATE SET rate = EXCLUDED.rate;

INSERT INTO public.inventory_current (product_id, stock_quantity, min_stock_level, stock_status)
SELECT id, stock_quantity, min_stock_level, stock_status
FROM public.products
ON CONFLICT (product_id) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  min_stock_level = EXCLUDED.min_stock_level,
  stock_status = EXCLUDED.stock_status,
  updated_at = NOW();

-- ============================================================================
-- 8. Permissions Lockdown
-- ============================================================================

-- Revoke all direct execution from public roles for SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.cleanup_expired_superadmin_tokens() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prune_old_logs() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.soft_delete_product(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restore_product(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_agent_points(uuid, numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_atomic_stock_movement(uuid, text, integer, text, text, text, boolean, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.allocate_order_inventory_atomic(text, uuid, text, text, text, text, text, numeric, numeric, numeric, numeric, numeric, text, text, jsonb, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_order_otp_atomic(uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_order_status_v1(uuid, text, text, jsonb, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_service_ticket_v1(uuid, text, numeric, integer, text[], jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_superadmin_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_manager_or_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_staff_member() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_profile_role_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_profile_role_to_auth() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.match_wishlist_coupons() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.track_advance_payment_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_or_create_monthly_slot() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decrement_free_installation_slot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.adjust_webhook_event_rollup(integer, text, text, timestamptz, numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_webhook_event_rollup() FROM PUBLIC, anon, authenticated;

-- Explicitly grant execute to authorized roles
GRANT EXECUTE ON FUNCTION public.is_superadmin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_member() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_order_otp_atomic(UUID, TEXT, TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_status_v1(uuid, text, text, jsonb, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_service_ticket_v1(uuid, text, numeric, integer, text[], jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_wishlist_coupons() TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_advance_payment_status_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_monthly_slot() TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_free_installation_slot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_product(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_agent_points(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_webhook_event_rollup(integer, text, text, timestamptz, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_webhook_event_rollup() TO service_role;

-- Sequence generation for human-readable quote numbers (format: YYYYMMXXXXX) - concurrent-safe via database sequence
CREATE SEQUENCE IF NOT EXISTS public.quotes_quote_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := to_char(NOW(), 'YYYYMM') || lpad(nextval('public.quotes_quote_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Grant execute and create trigger
REVOKE ALL ON FUNCTION public.generate_quote_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_quote_number() TO authenticated, anon;

DROP TRIGGER IF EXISTS before_insert_quote ON public.quotes;
CREATE TRIGGER before_insert_quote
BEFORE INSERT ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.generate_quote_number();

-- Sequence generation for human-readable order numbers (format: ORD-YYYYMMXXXXX)
CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_id IS NULL THEN
    NEW.order_id := NEW.id::TEXT;
  END IF;

  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || to_char(NOW(), 'YYYYMM') || lpad(nextval('public.orders_order_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS before_insert_order ON public.orders;
CREATE TRIGGER before_insert_order
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- ============================================================================
-- 9. RLS Fallback Security Automation
-- ============================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND rowsecurity = false
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Auto-enabled RLS on table: public.%', r.tablename;
    END LOOP;
END $$;

-- ============================================================================
-- 10. Composite Indexes
-- ============================================================================
-- Create composite index on orders (status, payment_status)
CREATE INDEX IF NOT EXISTS idx_orders_status_payment 
ON public.orders (status, payment_status);

-- Create composite index on products (is_deleted, status, category)
CREATE INDEX IF NOT EXISTS idx_products_active_status
ON public.products (is_deleted, status, category);

-- Composite index on auth profiles for staff filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role_active
ON public.profiles (role, is_active);

-- ============================================================================
-- 11. Inventory Serials and Locking
-- ============================================================================
-- 1. Create the inventory_serials table to manage individual serial numbers
DROP TABLE IF EXISTS public.inventory_serials CASCADE;
CREATE TABLE IF NOT EXISTS public.inventory_serials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'sold', 'reserved'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(serial_number)
);

-- Ensure the status column exists just in case the table existed without it
ALTER TABLE public.inventory_serials ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available';
ALTER TABLE public.inventory_serials
ADD CONSTRAINT chk_inventory_serials_status CHECK (status IN ('available', 'reserved', 'sold', 'damaged', 'returned'));

DROP TRIGGER IF EXISTS trg_inventory_serials_updated_at ON public.inventory_serials;
CREATE TRIGGER trg_inventory_serials_updated_at BEFORE UPDATE ON public.inventory_serials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_inventory_serials_product_status ON public.inventory_serials(product_id, status, created_at, id);

-- Enable Row Level Security and add policies
ALTER TABLE public.inventory_serials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_serials_staff_all ON public.inventory_serials;
CREATE POLICY inventory_serials_staff_all ON public.inventory_serials FOR ALL TO authenticated USING (public.is_staff_member()) WITH CHECK (public.is_staff_member());

-- 2. Create an atomic function in your Supabase SQL editor
CREATE OR REPLACE FUNCTION public.assign_serial_number(target_product_id UUID)
RETURNS TEXT AS $$
DECLARE
  assigned_serial TEXT;
BEGIN
  SELECT serial_number INTO assigned_serial
  FROM public.inventory_serials
  WHERE product_id = target_product_id AND status = 'available'
  ORDER BY created_at, id
  LIMIT 1
  FOR UPDATE SKIP LOCKED; -- Locks the row, ignores already-locked rows

  IF assigned_serial IS NOT NULL THEN
    UPDATE public.inventory_serials 
    SET status = 'sold' 
    WHERE serial_number = assigned_serial;
  END IF;

  RETURN assigned_serial;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.assign_serial_number(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_serial_number(uuid) TO authenticated, anon;

-- Create database view to safely expose product columns to PostgREST
CREATE OR REPLACE VIEW public.products_columns_view
WITH (security_invoker = true) AS
SELECT column_name::text
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public';

GRANT SELECT ON public.products_columns_view TO anon, authenticated, service_role;



COMMIT;


-- =============================================
-- MERGED MIGRATION: 20260619000000_global_app_config.sql
-- =============================================

-- Create the singleton app_config table
CREATE TABLE public.app_config (
  id integer PRIMARY KEY CHECK (id = 1),
  
  -- Company Identity
  company_name text NOT NULL,
  registered_address text,
  gstin text,
  pan text,
  cin text,
  tan text,
  support_email text,
  support_phone text,
  
  -- Branding
  logo_url text,
  font_regular_url text,
  font_bold_url text,
  
  -- Extensible Application Settings
  settings jsonb NOT NULL DEFAULT '{
    "max_quote_items": 150,
    "max_quote_pdf_mb": 5,
    "max_concurrent_pdfs": 2,
    "site_url": "https://www.tecbunny.com",
    "review_url": "https://g.page/r/tecbunny/review"
  }'::jsonb,
  
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Seed data from legacy company-info.json
INSERT INTO public.app_config (
  id, 
  company_name, 
  registered_address, 
  pan, 
  tan, 
  cin, 
  gstin, 
  support_phone, 
  support_email, 
  logo_url
) VALUES (
  1, 
  'TECBUNNY SOLUTIONS PRIVATE LIMITED', 
  'H NO 11 NHAYGINWADA, PARSE, Parxem, Pernem, North Goa- 403512, Goa',
  'AAMCT1608G', 
  'BLRT25863F', 
  'U80200GA2025PTC017488', 
  '30AAMCT1608G1ZO',
  '+91 96041 36010', 
  'support@tecbunny.com',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/TECBUNNY_SOLUTIONS_PVT_LTD-removebg-preview.png'
);

-- Row Level Security
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read app config" 
ON public.app_config FOR SELECT 
USING (true);

CREATE POLICY "Admins can update app config" 
ON public.app_config FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
  )
);


-- =============================================
-- MERGED MIGRATION: 20260620000000_performance_database_hardening.sql
-- =============================================

-- Database performance, integrity, and RLS optimizations
-- Migration: 20260620000000_performance_database_hardening.sql

BEGIN;

-- 1. Create a secure view for auth users to avoid N+1 REST/admin calls
CREATE OR REPLACE VIEW public.auth_users_summary AS
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at,
  banned_until
FROM auth.users;

-- Revoke all privileges on this view to prevent client-side data leaks
REVOKE ALL ON public.auth_users_summary FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.auth_users_summary TO service_role;

-- 2. Optimize checking functions to prevent N+1 profiles table querying in RLS policies
CREATE OR REPLACE FUNCTION public.is_superadmin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'superadmin'
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'superadmin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'manager', 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'superadmin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'service_role' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'manager', 'sales', 'accounts', 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'sales', 'accounts', 'superadmin')
    );
$$;

-- 3. Enhance allocate_order_inventory_atomic to support both wrapped cart_items objects and raw arrays
CREATE OR REPLACE FUNCTION public.allocate_order_inventory_atomic(
  p_customer_name   TEXT,
  p_customer_id     UUID,
  p_customer_email  TEXT,
  p_customer_phone  TEXT,
  p_delivery_address TEXT,
  p_notes           TEXT,
  p_payment_method  TEXT,
  p_subtotal        NUMERIC,
  p_gst_amount      NUMERIC,
  p_total           NUMERIC,
  p_discount_amount NUMERIC,
  p_shipping_amount NUMERIC,
  p_payment_status  TEXT,
  p_order_type      TEXT,
  p_items           JSONB,
  p_agent_id        UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item         RECORD;
  v_order_id     UUID;
  v_order_row    JSONB;
BEGIN
  IF p_customer_id IS DISTINCT FROM auth.uid() AND NOT public.is_staff_member() THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Access denied: cannot allocate inventory for another user');
  END IF;

  INSERT INTO public.orders (
    customer_id, customer_name, customer_email, customer_phone, delivery_address, notes, payment_method, subtotal, gst_amount, total, discount_amount, shipping_amount, payment_status, status, items, agent_id
  ) VALUES (
    p_customer_id, p_customer_name, p_customer_email, p_customer_phone, p_delivery_address, p_notes, p_payment_method, p_subtotal, p_gst_amount, p_total, p_discount_amount, p_shipping_amount, COALESCE(p_payment_status, 'Awaiting Payment'), 'Pending', p_items, p_agent_id
  ) RETURNING id INTO v_order_id;

  -- Process and lock products in consistent sorted order to prevent concurrency deadlocks
  -- Support both wrapped cart_items object format and raw items array format
  FOR v_item IN 
    SELECT 
      COALESCE((value->>'product_id')::UUID, (value->>'id')::UUID) AS product_id,
      (value->>'quantity')::INTEGER AS quantity
    FROM (
      SELECT 
        CASE 
          WHEN jsonb_typeof(p_items) = 'array' THEN p_items
          WHEN jsonb_typeof(p_items) = 'object' AND p_items ? 'cart_items' THEN p_items->'cart_items'
          ELSE '[]'::jsonb
        END AS items_arr
    ) t,
    jsonb_array_elements(t.items_arr)
    WHERE COALESCE((value->>'product_id')::UUID, (value->>'id')::UUID) IS NOT NULL
    ORDER BY 1 -- Sort consistently by product ID
  LOOP
    IF v_item.quantity > 0 THEN
      PERFORM public.record_atomic_stock_movement(v_item.product_id, 'online_sale', v_item.quantity, v_order_id::TEXT, 'online_order', 'Inventory allocated for order ' || v_order_id, FALSE, p_customer_id);
    END IF;
  END LOOP;
  SELECT to_jsonb(o.*) INTO v_order_row FROM public.orders o WHERE id = v_order_id;
  RETURN jsonb_build_object('success', TRUE, 'order', v_order_row);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_order_inventory_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, JSONB, UUID) TO service_role;

COMMIT;


-- =============================================
-- MERGED MIGRATION: 20260621000000_storage_security_hardening.sql
-- =============================================

-- Storage Security Hardening
-- Migration: 20260621000000_storage_security_hardening.sql

BEGIN;

-- Ensure the images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for images bucket to prevent duplicates
DROP POLICY IF EXISTS "Public Read Access on Images Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Staff Manage Access on Images Bucket" ON storage.objects;

-- Create policy to allow public read access to 'images' bucket
CREATE POLICY "Public Read Access on Images Bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Create policy to allow staff to manage (insert, update, delete) items in 'images' bucket
CREATE POLICY "Staff Manage Access on Images Bucket" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'images' AND public.is_staff_member())
  WITH CHECK (bucket_id = 'images' AND public.is_staff_member());

COMMIT;


-- =============================================
-- MERGED MIGRATION: 20260621095702_create_otp_verifications.sql
-- =============================================



-- =============================================
-- MERGED MIGRATION: 20260621230000_dynamic_rbac_schema.sql
-- =============================================

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(action, resource)
);
CREATE INDEX idx_permissions_resource ON public.permissions(resource);

-- Create role_permissions junction
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  tenant_id UUID, -- For future multi-tenant expansion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_user_tenant ON public.user_roles(user_id, tenant_id);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only superadmins/admins can view/edit these in production, but let's allow authenticated users to read roles/permissions
CREATE POLICY "Allow read access to authenticated users on roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users on permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users on role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users on user_roles" ON public.user_roles FOR SELECT USING (auth.role() = 'authenticated');

-- Function to aggregate user claims
CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER AS $$
DECLARE
  _target_user_id uuid;
  _permissions jsonb;
  _roles jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _target_user_id := OLD.user_id;
  ELSE
    _target_user_id := NEW.user_id;
  END IF;

  SELECT jsonb_agg(DISTINCT r.name) INTO _roles
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = _target_user_id;

  SELECT jsonb_agg(DISTINCT p.resource || ':' || p.action) INTO _permissions
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  JOIN public.role_permissions rp ON r.id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _target_user_id;

  UPDATE auth.users
  SET raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'roles', coalesce(_roles, '[]'::jsonb), 
      'permissions', coalesce(_permissions, '[]'::jsonb)
    )
  WHERE id = _target_user_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
CREATE TRIGGER on_user_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

-- Optional: Seed default roles to match their existing system
INSERT INTO public.roles (name, description) VALUES
('superadmin', 'System Super Administrator'),
('admin', 'Administrator'),
('manager', 'Manager'),
('accounts', 'Accounts Manager'),
('sales', 'Sales Representative'),
('sales-staff', 'Sales Staff'),
('sales-external', 'External Sales'),
('service_engineer', 'Service Engineer'),
('customer', 'Customer')
ON CONFLICT (name) DO NOTHING;


-- =============================================
-- MERGED MIGRATION: 20260622000000_immutable_audit_trails.sql
-- =============================================

-- Make security audit logs immutable
-- Migration: 20260622000000_immutable_audit_trails.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.lock_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_log_mutation ON public.security_audit_log;
CREATE TRIGGER prevent_audit_log_mutation
BEFORE UPDATE OR DELETE ON public.security_audit_log
FOR EACH ROW EXECUTE FUNCTION public.lock_audit_logs();

COMMIT;


-- =============================================
-- MERGED: update_products.sql
-- =============================================

-- 1. App Configuration / Settings
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GST Rates
CREATE TABLE IF NOT EXISTS gst_rates (
  category VARCHAR PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Roles and Permissions
CREATE TABLE IF NOT EXISTS roles_permissions (
  role VARCHAR PRIMARY KEY,
  permissions JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer & B2B Categories (Discounts & Benefits)
CREATE TABLE IF NOT EXISTS customer_categories (
  id SERIAL PRIMARY KEY,
  type VARCHAR NOT NULL, -- 'B2C' or 'B2B'
  name VARCHAR NOT NULL, -- e.g., 'Standard', 'Gold'
  discount_percentage NUMERIC NOT NULL,
  benefits JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Custom Setup Prices & Constants
CREATE TABLE IF NOT EXISTS custom_setup_constants (
  key VARCHAR PRIMARY KEY,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_setup_inventory (
  id VARCHAR PRIMARY KEY,
  category VARCHAR NOT NULL, -- 'analog_dvr', 'ip_nvr', 'hdd', 'monitor', etc.
  label VARCHAR NOT NULL,
  capacity INT,
  mrp NUMERIC,
  sale NUMERIC NOT NULL,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_constants ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_setup_inventory ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Admin Write)
CREATE POLICY "Allow public read-only access to app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to gst_rates" ON gst_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to roles_permissions" ON roles_permissions FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to customer_categories" ON customer_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to custom_setup_constants" ON custom_setup_constants FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to custom_setup_inventory" ON custom_setup_inventory FOR SELECT USING (true);


-- 1. App Configuration / Settings
INSERT INTO app_settings (key, value, description) VALUES
('NEXT_PUBLIC_SUPPORT_PHONE', '"+91 96041 36010"', 'Global support phone number'),
('GST_RATE', '0.18', 'Fallback GST rate'),
('siteUrl', '"https://www.tecbunny.com"', 'Base URL for the site'),
('defaultOgImage', '"https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/TecBunny%20Solution/TECBUNNY_SOLUTIONS_PVT_LTD-removebg-preview.png"', 'Default OpenGraph Image'),
('defaultDescription', '"TecBunny Solutions provides premium CCTV installation, IT services, AMC support, and home automation in Goa and Maharashtra. Secure your space now."', 'Default Site Description'),
('fallbackTitle', '"TecBunny | CCTV, IT Services & Home Automation in Goa"', 'Fallback SEO Title'),
('VALIDATION_PATTERNS', '{"email": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "mobile": "^[6-9]\\d{9}$", "gstin": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", "pan": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", "pincode": "^[1-9][0-9]{5}$"}', 'Regex validation strings'),
('ORDER_STATUS_FLOW', '["Pending", "Awaiting Payment", "Payment Failed", "Payment Confirmed", "Confirmed", "Processing", "Ready to Ship", "Shipped", "Ready for Pickup", "Completed", "Delivered"]', 'Order status steps'),
('SERVICE_ORDER_STATUS_FLOW', '["Pending", "Awaiting Payment", "Visit Scheduled", "Visit Completed", "Diagnosis Done", "Quote Sent", "Awaiting Customer Approval", "Approved", "Parts Ordered", "Work In Progress", "Quality Check", "Ready for Pickup", "Ready for Delivery", "Delivered/Picked Up", "Completed", "Warranty/Support Active"]', 'Service order status steps'),
('ERROR_MESSAGES', '{"INVALID_EMAIL": "Please enter a valid email address", "INVALID_MOBILE": "Please enter a valid 10-digit mobile number", "INVALID_GSTIN": "Please enter a valid GSTIN", "REQUIRED_FIELD": "This field is required", "NETWORK_ERROR": "Network error. Please try again.", "UNAUTHORIZED": "You are not authorized to perform this action", "SERVER_ERROR": "Server error. Please try again later."}', 'Standard error messages')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. GST Rates
INSERT INTO gst_rates (category, rate) VALUES
('Electronics', 18),
('Accessories', 18),
('Books', 5),
('Clothing', 12),
('Food', 5),
('Health', 12),
('Home', 18),
('Sports', 18),
('Software', 18),
('Services', 18),
('Gaming', 18),
('Furniture', 18),
('Automotive', 28)
ON CONFLICT (category) DO UPDATE SET rate = EXCLUDED.rate;

-- 3. Roles and Permissions
INSERT INTO roles_permissions (role, permissions) VALUES
('customer', '{"canViewProducts": true, "canPlaceOrders": true, "canViewOwnOrders": true, "canManageProfile": true}'),
('sales', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true}'),
('sales-staff', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true}'),
('sales-external', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true}'),
('manager', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canProcessPayments": true, "canManageInventory": true, "canViewReports": true}'),
('accounts', '{"canViewOrders": true, "canManageInvoices": true, "canViewReports": true, "canManageExpenses": true}'),
('admin', '{"canManageEverything": true}'),
('superadmin', '{"canManageEverything": true}'),
('service_engineer', '{"canViewProducts": true, "canManageOrders": true, "canViewCustomers": true, "canManageInventory": true, "canViewReports": true}')
ON CONFLICT (role) DO UPDATE SET permissions = EXCLUDED.permissions;

-- 4. Customer Categories
INSERT INTO customer_categories (type, name, discount_percentage, benefits) VALUES
('B2C', 'Normal', 0, '["Standard pricing", "Basic support"]'),
('B2C', 'Standard', 5, '["5% discount on all products", "Priority support", "Extended warranty"]'),
('B2C', 'Premium', 10, '["10% discount on all products", "VIP support", "Free installation", "Extended warranty"]'),
('B2B', 'Bronze', 8, '["8% wholesale discount", "Account manager"]'),
('B2B', 'Silver', 12, '["12% wholesale discount", "Account manager", "Priority fulfillment"]'),
('B2B', 'Gold', 15, '["15% wholesale discount", "Dedicated account manager", "Net-30 terms available"]')
ON CONFLICT DO NOTHING; -- Rely on serial ID, simplistic seed here.

-- 5. Custom Setup Constants
INSERT INTO custom_setup_constants (key, value) VALUES
('AVERAGE_RUN_METERS_PER_CAMERA', 25),
('INSTALLATION_LABOR_PER_CAMERA', 299),
('INSTALLATION_SETUP_CONFIGURATION_COST', 1000),
('INSTALLATION_LABOR_PER_METER_CABLE', 2)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. Custom Setup Inventory (Sample based on fallback arrays)
INSERT INTO custom_setup_inventory (id, category, label, capacity, mrp, sale) VALUES
('dvr-4-2mp', 'analog_dvr', '4 Channel DVR (2MP Model)', 4, 5199, 2499),
('dvr-4-5mp', 'analog_dvr', '4 Channel DVR (5MP Model)', 4, 5799, 2799),
('dvr-8', 'analog_dvr', '8 Channel DVR', 8, 6699, 3799),
('dvr-16', 'analog_dvr', '16 Channel DVR', 16, 19999, 6999),
('dvr-32', 'analog_dvr', '32 Channel DVR', 32, 32999, 13999),

('smps-4', 'analog_smps', '4 Channel SMPS (5A)', 4, 1999, 1249),
('smps-8', 'analog_smps', '8 Channel SMPS (10A)', 8, 2699, 1699),
('smps-16', 'analog_smps', '16 Channel SMPS (20A)', 16, 3999, 2599),

('analog-2.4-standard', 'analog_camera', '2.4 MP Standard', null, 1899, 1299),
('analog-2.4-dual', 'analog_camera', '2.4 MP Dual-light', null, 2199, 1499),
('analog-5-standard', 'analog_camera', '5 MP Standard', null, 2499, 1799),
('analog-5-dual', 'analog_camera', '5 MP Dual-light', null, 2899, 2149),

('cable-coaxial-100m', 'analog_cable', 'CCTV Coaxial Cable (100m Roll)', 100, 3199, 2499),

('nvr-8', 'ip_nvr', '8 Channel NVR', 8, 8999, 5499),
('nvr-16', 'ip_nvr', '16 Channel NVR', 16, 12999, 7899),
('nvr-32', 'ip_nvr', '32 Channel NVR', 32, 18999, 11499),

('poe-8', 'ip_poe', '8 Port PoE Switch', 8, 4999, 3199),
('poe-16', 'ip_poe', '16 Port PoE Switch', 16, 6999, 4499),
('poe-32', 'ip_poe', '32 Port PoE Switch', 32, 10999, 6999),

('ip-2-standard', 'ip_camera', '2 MP Standard', null, 3299, 2399),
('ip-2-dual', 'ip_camera', '2 MP Dual-light', null, 3699, 2699),
('ip-4-standard', 'ip_camera', '4 MP Standard', null, 4199, 2999),
('ip-4-dual', 'ip_camera', '4 MP Dual-light', null, 4899, 3699),

('cable-lan-100m', 'ip_cable', 'LAN Cable (100m Box)', 100, 3399, 2699),

('hdd-500', 'hdd', '500 GB Surveillance HDD', null, 3499, 2699),
('hdd-1tb', 'hdd', '1 TB Surveillance HDD', null, 4499, 3399),
('hdd-2tb', 'hdd', '2 TB Surveillance HDD', null, 5999, 4699),

('monitor-19', 'monitor', '19" Surveillance Monitor', null, 9999, 7499),
('monitor-21', 'monitor', '21" Surveillance Monitor', null, 12999, 9999),
('monitor-24', 'monitor', '24" Surveillance Monitor', null, 15999, 11999),

('wall-mount-addon', 'accessory', 'Wall Mount Installation Kit', null, 699, 499),
('spike-guard', 'accessory', 'Spike Guard / Power Surge Protector', null, 1999, 1299),

('rack-2u', 'rack', 'Rack Cabinet - 2U', null, 4999, 3299),
('rack-3u', 'rack', 'Rack Cabinet - 3U', null, 5999, 3999),
('rack-4u', 'rack', 'Rack Cabinet - 4U', null, 6999, 4599),

('conduit-open', 'conduit', 'Open Conduit Pipe (₹10/mtr)', null, 10, 10),
('conduit-concealed', 'conduit', 'Concealed Conduit Pipe (₹4/mtr)', null, 4, 4),

('installation', 'installation', 'On-site Installation & Configuration', null, 4500, 4500)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  capacity = EXCLUDED.capacity,
  mrp = EXCLUDED.mrp,
  sale = EXCLUDED.sale;


-- Extend the existing contact inbox into the Superadmin inquiry pipeline.
-- Existing users and roles remain the source of truth for assignment eligibility.

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS inquiry_category TEXT NOT NULL DEFAULT 'Sales',
  ADD COLUMN IF NOT EXISTS origin_key TEXT NOT NULL DEFAULT 'general_contact',
  ADD COLUMN IF NOT EXISTS origin_path TEXT,
  ADD COLUMN IF NOT EXISTS form_identifier TEXT,
  ADD COLUMN IF NOT EXISTS referrer_url TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS origin_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_by_label TEXT,
  ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.contact_messages
SET inquiry_category = CASE
      WHEN LOWER(COALESCE(subject, '')) LIKE '%support%'
        OR LOWER(COALESCE(subject, '')) LIKE '%service%'
        OR LOWER(COALESCE(subject, '')) LIKE '%infrastructure%'
      THEN 'Services'
      ELSE 'Sales'
    END,
    origin_key = CASE
      WHEN LOWER(COALESCE(subject, '')) LIKE '%web development%' THEN 'web_development'
      WHEN LOWER(COALESCE(subject, '')) LIKE '%infrastructure%' THEN 'smart_infrastructure'
      WHEN LOWER(COALESCE(subject, '')) LIKE '%service%' THEN 'services_core_desk'
      ELSE 'general_contact'
    END
WHERE origin_key = 'general_contact';

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_status_check,
  ADD CONSTRAINT contact_messages_status_check
    CHECK (status IN ('New', 'Assigned', 'Contacted', 'In Progress', 'Resolved', 'Closed', 'Rejected')),
  DROP CONSTRAINT IF EXISTS contact_messages_inquiry_category_check,
  ADD CONSTRAINT contact_messages_inquiry_category_check
    CHECK (inquiry_category IN ('Sales', 'Services')),
  DROP CONSTRAINT IF EXISTS contact_messages_priority_check,
  ADD CONSTRAINT contact_messages_priority_check
    CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent'));

CREATE INDEX IF NOT EXISTS idx_contact_messages_pipeline
  ON public.contact_messages(inquiry_category, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assignee
  ON public.contact_messages(assigned_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_origin
  ON public.contact_messages(origin_key, created_at DESC);

CREATE TABLE IF NOT EXISTS public.inquiry_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  previous_assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT,
  resulting_status TEXT NOT NULL,
  assigned_by_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_assignment_history_inquiry
  ON public.inquiry_assignment_history(inquiry_id, created_at DESC);

ALTER TABLE public.inquiry_assignment_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inquiry_assignment_history FROM anon, authenticated;
GRANT SELECT, INSERT ON public.inquiry_assignment_history TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO service_role;

CREATE OR REPLACE FUNCTION public.superadmin_assign_inquiry(
  p_inquiry_id UUID,
  p_assigned_user_id UUID,
  p_assigned_by_label TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_inquiry public.contact_messages%ROWTYPE;
  v_assignee_role TEXT;
  v_assignee_name TEXT;
  v_assignee_email TEXT;
  v_resulting_status TEXT;
  v_changed BOOLEAN;
  v_previous_assigned_user_id UUID;
  v_previous_status TEXT;
BEGIN
  SELECT *
  INTO v_inquiry
  FROM public.contact_messages
  WHERE id = p_inquiry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inquiry not found';
  END IF;

  SELECT
    role,
    COALESCE(NULLIF(TRIM(full_name), ''), NULLIF(TRIM(name), ''), email),
    email
  INTO v_assignee_role, v_assignee_name, v_assignee_email
  FROM public.profiles
  WHERE id = p_assigned_user_id
    AND is_active = TRUE;

  IF v_assignee_role IS NULL THEN
    RAISE EXCEPTION 'Selected assignee is not an active staff user';
  END IF;

  IF v_inquiry.inquiry_category = 'Sales'
    AND v_assignee_role NOT IN ('sales_manager', 'sales_executive', 'store_executive', 'sales_agent') THEN
    RAISE EXCEPTION 'Sales inquiries can only be assigned to Sales Team users';
  END IF;

  IF v_inquiry.inquiry_category = 'Services'
    AND v_assignee_role <> 'service_manager' THEN
    RAISE EXCEPTION 'Services inquiries can only be assigned to Service Manager users';
  END IF;

  v_changed := v_inquiry.assigned_user_id IS DISTINCT FROM p_assigned_user_id;
  v_previous_assigned_user_id := v_inquiry.assigned_user_id;
  v_previous_status := v_inquiry.status;
  v_resulting_status := CASE
    WHEN v_inquiry.status = 'New' THEN 'Assigned'
    ELSE v_inquiry.status
  END;

  UPDATE public.contact_messages
  SET assigned_user_id = p_assigned_user_id,
      assigned_at = CASE WHEN v_changed THEN NOW() ELSE assigned_at END,
      assigned_by_label = NULLIF(TRIM(p_assigned_by_label), ''),
      handled_by = p_assigned_user_id::TEXT,
      handled_by_name = v_assignee_name,
      status = v_resulting_status,
      last_activity_at = NOW()
  WHERE id = p_inquiry_id
  RETURNING * INTO v_inquiry;

  IF v_changed THEN
    INSERT INTO public.inquiry_assignment_history (
      inquiry_id,
      previous_assigned_user_id,
      assigned_user_id,
      previous_status,
      resulting_status,
      assigned_by_label
    ) VALUES (
      p_inquiry_id,
      v_previous_assigned_user_id,
      p_assigned_user_id,
      v_previous_status,
      v_resulting_status,
      COALESCE(NULLIF(TRIM(p_assigned_by_label), ''), 'Superadmin')
    );
  END IF;

  RETURN jsonb_build_object(
    'changed', v_changed,
    'inquiry', to_jsonb(v_inquiry),
    'assignee', jsonb_build_object(
      'id', p_assigned_user_id,
      'name', v_assignee_name,
      'email', v_assignee_email,
      'role', v_assignee_role
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.superadmin_assign_inquiry(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_assign_inquiry(UUID, UUID, TEXT)
  TO service_role;

NOTIFY pgrst, 'reload schema';


-- TecBunny regional area/team setup.
-- Safe to run once from Supabase SQL Editor and idempotent on repeat runs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.areas
  ADD COLUMN IF NOT EXISTS sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS services_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.area_pincodes (
  pincode TEXT PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT area_pincodes_valid_pincode CHECK (pincode ~ '^[1-9][0-9]{5}$')
);

CREATE TABLE IF NOT EXISTS public.user_area_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, area_id)
);

CREATE TABLE IF NOT EXISTS public.area_postal_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  pincode TEXT NOT NULL,
  office_name TEXT NOT NULL,
  block_taluka TEXT,
  district TEXT,
  state TEXT,
  division TEXT,
  region TEXT,
  circle TEXT,
  branch_type TEXT,
  delivery_status TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (area_id, pincode, office_name)
);

CREATE INDEX IF NOT EXISTS idx_area_pincodes_area_active
  ON public.area_pincodes(area_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_area_area_user
  ON public.user_area_assignments(area_id, user_id);
CREATE INDEX IF NOT EXISTS idx_areas_sales_manager
  ON public.areas(sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_areas_service_manager
  ON public.areas(service_manager_id);
CREATE INDEX IF NOT EXISTS idx_area_postal_location_lookup
  ON public.area_postal_locations(area_id, pincode);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id),
  ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.service_tickets
  ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id),
  ADD COLUMN IF NOT EXISTS service_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_area_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_postal_locations ENABLE ROW LEVEL SECURITY;

-- This setup is managed only by server-side service-role APIs. Staff access to
-- orders and tickets remains controlled by the existing regional RLS policies.
REVOKE ALL ON public.areas FROM anon;
REVOKE ALL ON public.area_pincodes FROM anon;
REVOKE ALL ON public.user_area_assignments FROM anon;
REVOKE ALL ON public.area_postal_locations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.areas TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_pincodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_area_assignments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_postal_locations TO service_role;

CREATE OR REPLACE FUNCTION public.superadmin_save_area_team(
  p_area_id UUID,
  p_code TEXT,
  p_name TEXT,
  p_is_active BOOLEAN,
  p_services_enabled BOOLEAN,
  p_pincodes TEXT[],
  p_sales_manager_id UUID,
  p_service_manager_id UUID,
  p_sales_team_ids UUID[],
  p_service_engineer_ids UUID[],
  p_postal_locations JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_area_id UUID;
  v_user_id UUID;
  v_role TEXT;
BEGIN
  IF NULLIF(TRIM(p_code), '') IS NULL OR NULLIF(TRIM(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'Area code and name are required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(COALESCE(p_pincodes, ARRAY[]::TEXT[])) value
    WHERE value !~ '^[1-9][0-9]{5}$'
  ) THEN
    RAISE EXCEPTION 'Every pincode must be a valid six-digit Indian pincode';
  END IF;

  IF p_sales_manager_id IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = p_sales_manager_id AND is_active = TRUE;
    IF v_role IS DISTINCT FROM 'sales_manager' THEN
      RAISE EXCEPTION 'Selected Sales Manager does not have sales_manager role';
    END IF;
  END IF;

  IF p_service_manager_id IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = p_service_manager_id AND is_active = TRUE;
    IF v_role IS DISTINCT FROM 'service_manager' THEN
      RAISE EXCEPTION 'Selected Service Manager does not have service_manager role';
    END IF;
  END IF;

  FOREACH v_user_id IN ARRAY COALESCE(p_sales_team_ids, ARRAY[]::UUID[]) LOOP
    SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id AND is_active = TRUE;
    IF v_role IS NULL OR v_role NOT IN ('sales_executive', 'store_executive', 'sales_agent') THEN
      RAISE EXCEPTION 'Sales team member % has incompatible role %', v_user_id, v_role;
    END IF;
  END LOOP;

  FOREACH v_user_id IN ARRAY COALESCE(p_service_engineer_ids, ARRAY[]::UUID[]) LOOP
    SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id AND is_active = TRUE;
    IF v_role IS DISTINCT FROM 'service_engineer' THEN
      RAISE EXCEPTION 'Service team member % does not have service_engineer role', v_user_id;
    END IF;
  END LOOP;

  IF p_area_id IS NULL THEN
    INSERT INTO public.areas (
      code, name, is_active, services_enabled, sales_manager_id, service_manager_id
    ) VALUES (
      UPPER(TRIM(p_code)), TRIM(p_name), COALESCE(p_is_active, TRUE),
      COALESCE(p_services_enabled, FALSE),
      p_sales_manager_id, p_service_manager_id
    )
    RETURNING id INTO v_area_id;
  ELSE
    UPDATE public.areas
    SET code = UPPER(TRIM(p_code)),
        name = TRIM(p_name),
        is_active = COALESCE(p_is_active, TRUE),
        services_enabled = COALESCE(p_services_enabled, FALSE),
        sales_manager_id = p_sales_manager_id,
        service_manager_id = p_service_manager_id,
        updated_at = NOW()
    WHERE id = p_area_id
    RETURNING id INTO v_area_id;

    IF v_area_id IS NULL THEN
      RAISE EXCEPTION 'Area not found';
    END IF;
  END IF;

  DELETE FROM public.area_pincodes WHERE area_id = v_area_id;
  INSERT INTO public.area_pincodes (pincode, area_id, is_active)
  SELECT DISTINCT value, v_area_id, TRUE
  FROM unnest(COALESCE(p_pincodes, ARRAY[]::TEXT[])) value;

  DELETE FROM public.area_postal_locations WHERE area_id = v_area_id;
  INSERT INTO public.area_postal_locations (
    area_id, pincode, office_name, block_taluka, district, state,
    division, region, circle, branch_type, delivery_status, raw_data
  )
  SELECT
    v_area_id,
    record.pincode,
    record.office_name,
    record.block_taluka,
    record.district,
    record.state,
    record.division,
    record.region,
    record.circle,
    record.branch_type,
    record.delivery_status,
    COALESCE(record.raw_data, '{}'::JSONB)
  FROM jsonb_to_recordset(COALESCE(p_postal_locations, '[]'::JSONB)) AS record(
    pincode TEXT,
    office_name TEXT,
    block_taluka TEXT,
    district TEXT,
    state TEXT,
    division TEXT,
    region TEXT,
    circle TEXT,
    branch_type TEXT,
    delivery_status TEXT,
    raw_data JSONB
  )
  WHERE record.pincode ~ '^[1-9][0-9]{5}$'
    AND NULLIF(TRIM(record.office_name), '') IS NOT NULL
  ON CONFLICT (area_id, pincode, office_name) DO UPDATE SET
    block_taluka = EXCLUDED.block_taluka,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    division = EXCLUDED.division,
    region = EXCLUDED.region,
    circle = EXCLUDED.circle,
    branch_type = EXCLUDED.branch_type,
    delivery_status = EXCLUDED.delivery_status,
    raw_data = EXCLUDED.raw_data,
    updated_at = NOW();

  DELETE FROM public.user_area_assignments WHERE area_id = v_area_id;

  INSERT INTO public.user_area_assignments (user_id, area_id, is_primary)
  SELECT DISTINCT user_id, v_area_id, FALSE
  FROM unnest(
    array_remove(
      ARRAY[p_sales_manager_id, p_service_manager_id]
      || COALESCE(p_sales_team_ids, ARRAY[]::UUID[])
      || COALESCE(p_service_engineer_ids, ARRAY[]::UUID[]),
      NULL
    )
  ) user_id
  ON CONFLICT (user_id, area_id) DO UPDATE SET
    created_at = NOW();

  RETURN v_area_id;
END;
$$;

REVOKE ALL ON FUNCTION public.superadmin_save_area_team(
  UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT[], UUID, UUID, UUID[], UUID[], JSONB
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_save_area_team(
  UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT[], UUID, UUID, UUID[], UUID[], JSONB
) TO service_role;

NOTIFY pgrst, 'reload schema';


-- Exact pincode coverage for the existing regional RBAC model.
-- Notification routing is performed server-side with the service role.

CREATE TABLE IF NOT EXISTS public.area_pincodes (
  pincode TEXT PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT area_pincodes_valid_pincode CHECK (pincode ~ '^[1-9][0-9]{5}$')
);

CREATE INDEX IF NOT EXISTS idx_area_pincodes_area_active
  ON public.area_pincodes(area_id, is_active);

ALTER TABLE public.areas
  ADD COLUMN IF NOT EXISTS sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_areas_sales_manager ON public.areas(sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_areas_service_manager ON public.areas(service_manager_id);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.service_tickets
  ADD COLUMN IF NOT EXISTS service_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_pincode ON public.orders(delivery_pincode);
CREATE INDEX IF NOT EXISTS idx_orders_sales_manager ON public.orders(assigned_sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_manager ON public.orders(assigned_service_manager_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_service_pincode ON public.service_tickets(service_pincode);
CREATE INDEX IF NOT EXISTS idx_service_tickets_service_manager ON public.service_tickets(assigned_service_manager_id);

CREATE TABLE IF NOT EXISTS public.area_notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('order', 'service_ticket')),
  source_id UUID NOT NULL,
  notification_kind TEXT NOT NULL,
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pincode TEXT,
  routing_status TEXT NOT NULL CHECK (routing_status IN ('assigned', 'unassigned', 'failed')),
  recipients JSONB NOT NULL DEFAULT '[]'::JSONB,
  provider_message_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_type, source_id, notification_kind)
);

CREATE INDEX IF NOT EXISTS idx_area_notification_area_created
  ON public.area_notification_deliveries(area_id, created_at DESC);

ALTER TABLE public.area_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS area_pincodes_staff_read ON public.area_pincodes;
CREATE POLICY area_pincodes_staff_read ON public.area_pincodes
  FOR SELECT TO authenticated
  USING (
    (SELECT private.has_role('admin'))
    OR (SELECT private.has_role('superadmin'))
    OR (SELECT private.user_has_area(area_id))
  );

DROP POLICY IF EXISTS area_pincodes_superadmin_manage ON public.area_pincodes;
CREATE POLICY area_pincodes_superadmin_manage ON public.area_pincodes
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));

DROP POLICY IF EXISTS area_notification_superadmin_read ON public.area_notification_deliveries;
CREATE POLICY area_notification_superadmin_read ON public.area_notification_deliveries
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role('superadmin')));

-- New Supabase projects require explicit Data API grants.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_pincodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_notification_deliveries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_pincodes TO authenticated;
GRANT SELECT ON public.area_notification_deliveries TO authenticated;


CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping')),
  discount_value NUMERIC(12,2),
  minimum_purchase_amount NUMERIC(12,2),
  maximum_discount_amount NUMERIC(12,2),
  offer_code TEXT UNIQUE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
  customer_eligibility TEXT NOT NULL DEFAULT 'all',
  banner_text TEXT,
  banner_color TEXT,
  terms_and_conditions TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit_per_customer INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date > start_date),
  CHECK (usage_count >= 0),
  CHECK (usage_limit IS NULL OR usage_limit > 0),
  CHECK (usage_limit_per_customer IS NULL OR usage_limit_per_customer > 0),
  CHECK (usage_limit IS NULL OR usage_count <= usage_limit),
  CHECK (usage_limit IS NULL OR usage_limit_per_customer IS NULL OR usage_limit_per_customer <= usage_limit)
);

CREATE INDEX IF NOT EXISTS idx_offers_active_dates ON public.offers (is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_offers_featured ON public.offers (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_offers_homepage ON public.offers (display_on_homepage) WHERE display_on_homepage = TRUE;
CREATE INDEX IF NOT EXISTS idx_offers_priority_created ON public.offers (priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_offer_code ON public.offers (offer_code) WHERE offer_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.offer_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID,
  email TEXT,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_usage_offer_id ON public.offer_usage (offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_user_id ON public.offer_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_offer_usage_email ON public.offer_usage (email) WHERE email IS NOT NULL;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active offers" ON public.offers;
CREATE POLICY "Public can read active offers"
ON public.offers
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE AND start_date <= NOW() AND end_date >= NOW());

DROP POLICY IF EXISTS "Staff can manage offers" ON public.offers;
CREATE POLICY "Staff can manage offers"
ON public.offers
FOR ALL
TO authenticated
USING (public.is_staff_member())
WITH CHECK (public.is_staff_member());

DROP POLICY IF EXISTS "Service role can manage offers" ON public.offers;
CREATE POLICY "Service role can manage offers"
ON public.offers
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff can read offer usage" ON public.offer_usage;
CREATE POLICY "Staff can read offer usage"
ON public.offer_usage
FOR SELECT
TO authenticated
USING (public.is_staff_member());

DROP POLICY IF EXISTS "Service role can manage offer usage" ON public.offer_usage;
CREATE POLICY "Service role can manage offer usage"
ON public.offer_usage
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Master additive, region-aware RBAC architecture.
-- Canonical staff roles:
-- superadmin > admin > (sales_manager > sales execution roles,
--                       service_manager > service_engineer)

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_area_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, area_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_area_one_primary
  ON public.user_area_assignments(user_id)
  WHERE is_primary;
CREATE INDEX IF NOT EXISTS idx_user_area_area_user
  ON public.user_area_assignments(area_id, user_id);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id);
ALTER TABLE public.service_tickets ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id);
CREATE INDEX IF NOT EXISTS idx_orders_area_id ON public.orders(area_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_area_id ON public.service_tickets(area_id);

ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS tier SMALLINT;

CREATE TABLE IF NOT EXISTS public.role_inheritance (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  inherited_role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, inherited_role_id),
  CHECK (role_id <> inherited_role_id)
);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_area_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_inheritance ENABLE ROW LEVEL SECURITY;

INSERT INTO public.roles (name, description, tier, is_system) VALUES
  ('customer', 'Authenticated customer', 0, TRUE),
  ('sales_executive', 'Field sales operations', 1, TRUE),
  ('store_executive', 'Retail and point-of-sale operations', 1, TRUE),
  ('sales_agent', 'Independent commission-based sales partner', 1, TRUE),
  ('service_engineer', 'Assigned field service technician', 1, TRUE),
  ('sales_manager', 'Regional sales team manager', 2, TRUE),
  ('service_manager', 'Regional service team manager', 2, TRUE),
  ('admin', 'Day-to-day operations administrator', 3, TRUE),
  ('superadmin', 'System owner', 4, TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tier = EXCLUDED.tier,
  is_system = TRUE;

WITH edges(role_name, inherited_name) AS (
  VALUES
    ('sales_executive', 'customer'),
    ('store_executive', 'customer'),
    ('sales_agent', 'customer'),
    ('service_engineer', 'customer'),
    ('sales_manager', 'sales_executive'),
    ('sales_manager', 'store_executive'),
    ('sales_manager', 'sales_agent'),
    ('service_manager', 'service_engineer'),
    ('admin', 'sales_manager'),
    ('admin', 'service_manager'),
    ('superadmin', 'admin')
)
INSERT INTO public.role_inheritance (role_id, inherited_role_id)
SELECT child.id, parent.id
FROM edges
JOIN public.roles child ON child.name = edges.role_name
JOIN public.roles parent ON parent.name = edges.inherited_name
ON CONFLICT DO NOTHING;

INSERT INTO public.permissions (resource, action, description) VALUES
  ('user', 'all', 'Full user and company governance'),
  ('system', 'config', 'Website, policy and infrastructure configuration'),
  ('ai', 'config', 'AI engine and prompt configuration'),
  ('catalog', 'all', 'Full product, brand and service catalog control'),
  ('orders', 'all', 'Unrestricted order and logistics control'),
  ('crm', 'all', 'Unrestricted CRM control'),
  ('reports', 'all', 'Unfiltered reporting and audit intelligence'),
  ('admin', 'users', 'Customer and lower-staff operations'),
  ('admin', 'inventory', 'Inventory tuning without catalog deletion'),
  ('admin', 'crm', 'Operational CRM management'),
  ('admin', 'orders', 'Core order operations'),
  ('admin', 'services', 'Service dispatch and lifecycle operations'),
  ('admin', 'reports', 'Standard operational reports'),
  ('team', 'read:area', 'Read assigned regional team performance'),
  ('orders', 'dispatch:area', 'Dispatch product orders in assigned areas'),
  ('leads', 'assign:area', 'Create and assign regional leads'),
  ('leads', 'write', 'Capture regional leads'),
  ('orders', 'create', 'Create product orders'),
  ('orders', 'process', 'Process storefront orders'),
  ('billing', 'quick', 'Use point-of-sale quick billing'),
  ('orders', 'create:delegate', 'Create orders for a customer'),
  ('commission', 'read', 'Read own commission dashboard'),
  ('service_orders', 'dispatch', 'Dispatch regional service orders'),
  ('engineers', 'assign', 'Assign engineers in the regional pool'),
  ('service_orders', 'update:own', 'Update own assigned service orders'),
  ('reports', 'submit', 'Submit own field reports')
ON CONFLICT (action, resource) DO UPDATE SET description = EXCLUDED.description;

WITH grants(role_name, resource, action) AS (
  VALUES
    ('sales_executive', 'leads', 'write'),
    ('sales_executive', 'orders', 'create'),
    ('store_executive', 'orders', 'process'),
    ('store_executive', 'billing', 'quick'),
    ('sales_agent', 'orders', 'create:delegate'),
    ('sales_agent', 'commission', 'read'),
    ('sales_manager', 'team', 'read:area'),
    ('sales_manager', 'orders', 'dispatch:area'),
    ('sales_manager', 'leads', 'assign:area'),
    ('service_engineer', 'service_orders', 'update:own'),
    ('service_engineer', 'reports', 'submit'),
    ('service_manager', 'team', 'read:area'),
    ('service_manager', 'service_orders', 'dispatch'),
    ('service_manager', 'engineers', 'assign'),
    ('admin', 'admin', 'users'),
    ('admin', 'admin', 'inventory'),
    ('admin', 'admin', 'crm'),
    ('admin', 'admin', 'orders'),
    ('admin', 'admin', 'services'),
    ('admin', 'admin', 'reports'),
    ('superadmin', 'user', 'all'),
    ('superadmin', 'system', 'config'),
    ('superadmin', 'ai', 'config'),
    ('superadmin', 'catalog', 'all'),
    ('superadmin', 'orders', 'all'),
    ('superadmin', 'crm', 'all'),
    ('superadmin', 'reports', 'all')
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN public.roles roles ON roles.name = grants.role_name
JOIN public.permissions permissions
  ON permissions.resource = grants.resource
 AND permissions.action = grants.action
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  target_user_id UUID;
  effective_roles JSONB;
  effective_permissions JSONB;
BEGIN
  target_user_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END;

  WITH RECURSIVE inherited_roles AS (
    SELECT r.id, r.name
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = target_user_id
    UNION
    SELECT parent.id, parent.name
    FROM inherited_roles child
    JOIN public.role_inheritance ri ON ri.role_id = child.id
    JOIN public.roles parent ON parent.id = ri.inherited_role_id
  )
  SELECT COALESCE(jsonb_agg(DISTINCT name), '[]'::JSONB)
  INTO effective_roles
  FROM inherited_roles;

  WITH RECURSIVE inherited_roles AS (
    SELECT r.id
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = target_user_id
    UNION
    SELECT ri.inherited_role_id
    FROM inherited_roles child
    JOIN public.role_inheritance ri ON ri.role_id = child.id
  )
  SELECT COALESCE(jsonb_agg(DISTINCT p.resource || ':' || p.action), '[]'::JSONB)
  INTO effective_permissions
  FROM inherited_roles roles
  JOIN public.role_permissions rp ON rp.role_id = roles.id
  JOIN public.permissions p ON p.id = rp.permission_id;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB)
    || jsonb_build_object(
      'roles', effective_roles,
      'permissions', effective_permissions
    )
  WHERE id = target_user_id;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_claims() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.current_user_role_names()
RETURNS SETOF TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH RECURSIVE direct_roles AS (
    SELECT r.id, r.name
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
    UNION
    SELECT r.id, r.name
    FROM public.roles r
    WHERE r.name = COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '')
  ),
  inherited_roles AS (
    SELECT id, name FROM direct_roles
    UNION
    SELECT parent.id, parent.name
    FROM inherited_roles child
    JOIN public.role_inheritance ri ON ri.role_id = child.id
    JOIN public.roles parent ON parent.id = ri.inherited_role_id
  )
  SELECT DISTINCT name FROM inherited_roles;
$$;

CREATE OR REPLACE FUNCTION private.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.current_user_role_names() role_name
    WHERE role_name = required_role
  );
$$;

CREATE OR REPLACE FUNCTION private.has_direct_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND r.name = required_role
  )
  OR COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = required_role;
$$;

CREATE OR REPLACE FUNCTION private.has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    private.has_role('superadmin')
    OR EXISTS (
      SELECT 1
      FROM private.current_user_role_names() role_name
      JOIN public.roles r ON r.name = role_name
      JOIN public.role_permissions rp ON rp.role_id = r.id
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE p.resource || ':' || p.action = required_permission
         OR p.action = 'all'
    );
$$;

CREATE OR REPLACE FUNCTION private.user_has_area(target_area UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT target_area IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.user_area_assignments assignment
    WHERE assignment.user_id = (SELECT auth.uid())
      AND assignment.area_id = target_area
  );
$$;

CREATE OR REPLACE FUNCTION private.is_region_scoped_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.current_user_role_names() role_name
    WHERE role_name IN (
      'sales_executive', 'store_executive', 'sales_agent',
      'service_engineer', 'sales_manager', 'service_manager'
    )
  )
  AND NOT private.has_role('admin')
  AND NOT private.has_role('superadmin');
$$;

REVOKE ALL ON FUNCTION private.current_user_role_names() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_role(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_direct_role(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_permission(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.user_has_area(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_region_scoped_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_user_role_names() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_direct_role(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_permission(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.user_has_area(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_region_scoped_staff() TO authenticated, service_role;

DROP POLICY IF EXISTS "Allow read access to authenticated users on roles" ON public.roles;
DROP POLICY IF EXISTS "Allow read access to authenticated users on permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow read access to authenticated users on role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Allow read access to authenticated users on user_roles" ON public.user_roles;

CREATE POLICY rbac_catalog_authenticated_read ON public.roles
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY permission_catalog_authenticated_read ON public.permissions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY role_permissions_authenticated_read ON public.role_permissions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY role_inheritance_authenticated_read ON public.role_inheritance
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY user_roles_self_or_superadmin_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.has_role('superadmin')));
CREATE POLICY user_roles_superadmin_manage ON public.user_roles
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));

CREATE POLICY areas_staff_read ON public.areas
  FOR SELECT TO authenticated
  USING (
    (SELECT private.has_role('admin'))
    OR (SELECT private.has_role('superadmin'))
    OR (SELECT private.user_has_area(id))
  );
CREATE POLICY areas_superadmin_manage ON public.areas
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));
CREATE POLICY user_area_self_or_management_read ON public.user_area_assignments
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT private.has_role('admin'))
    OR (SELECT private.has_role('superadmin'))
  );
CREATE POLICY user_area_superadmin_manage ON public.user_area_assignments
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));

-- Restrictive policies are ANDed with existing business policies. They ensure
-- every region-scoped staff query carries an area match, even when another
-- permissive policy would otherwise expose rows across regions.
DROP POLICY IF EXISTS orders_region_sandbox ON public.orders;
CREATE POLICY orders_region_sandbox ON public.orders
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  )
  WITH CHECK (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  );

DROP POLICY IF EXISTS service_tickets_region_sandbox ON public.service_tickets;
CREATE POLICY service_tickets_region_sandbox ON public.service_tickets
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  )
  WITH CHECK (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  );

-- Service engineers may only update tickets assigned to their engineer record.
DROP POLICY IF EXISTS service_engineer_own_ticket_update ON public.service_tickets;
CREATE POLICY service_engineer_own_ticket_update ON public.service_tickets
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    NOT (SELECT private.has_direct_role('service_engineer'))
    OR assigned_engineer_id IN (
      SELECT id FROM public.service_engineers
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    NOT (SELECT private.has_direct_role('service_engineer'))
    OR assigned_engineer_id IN (
      SELECT id FROM public.service_engineers
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- The existing audit mutation trigger remains the final immutable boundary.
-- This policy makes the intended read boundary explicit.
DROP POLICY IF EXISTS security_audit_log_superadmin_only ON public.security_audit_log;
CREATE POLICY security_audit_log_superadmin_only ON public.security_audit_log
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role('superadmin')));


-- Add contact message storage used by the admin/superadmin inbox.
-- This migration is additive and safe for existing deployments.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT,
  handled_by TEXT,
  handled_by_name TEXT,
  ip_address TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_messages_status_check CHECK (status IN ('New', 'In Progress', 'Resolved'))
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON public.contact_messages(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email
  ON public.contact_messages(email);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contact_messages_service_role_all ON public.contact_messages;
CREATE POLICY contact_messages_service_role_all
  ON public.contact_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_staff_select ON public.contact_messages;
CREATE POLICY contact_messages_staff_select
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_staff_member());

DROP POLICY IF EXISTS contact_messages_staff_update ON public.contact_messages;
CREATE POLICY contact_messages_staff_update
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_staff_member())
  WITH CHECK (public.is_staff_member());

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- DDL to create the public.upcoming_projects table and RLS policies

CREATE TABLE IF NOT EXISTS public.upcoming_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    explanation TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    amount_raised NUMERIC NOT NULL DEFAULT 0,
    motive TEXT NOT NULL,
    detailed_information TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pipeline',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_upcoming_projects_created_at ON public.upcoming_projects (created_at DESC);

-- Enable RLS
ALTER TABLE public.upcoming_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow idempotent runs)
DROP POLICY IF EXISTS "Allow public read access to upcoming projects" ON public.upcoming_projects;
DROP POLICY IF EXISTS "Superadmins can manage upcoming projects" ON public.upcoming_projects;

-- 1. Policy for SELECT: Allow anyone to read
CREATE POLICY "Allow public read access to upcoming projects"
ON public.upcoming_projects
FOR SELECT
USING (true);

-- 2. Policy for ALL (Write): Restrict to superadmins only
CREATE POLICY "Superadmins can manage upcoming projects"
ON public.upcoming_projects
FOR ALL
TO authenticated
USING (public.is_superadmin_user())
WITH CHECK (public.is_superadmin_user());

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS set_upcoming_projects_updated_at ON public.upcoming_projects;
CREATE TRIGGER set_upcoming_projects_updated_at
BEFORE UPDATE ON public.upcoming_projects
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();


