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

INSERT INTO public.products (
  handle,
  name,
  title,
  description,
  brand,
  price,
  mrp,
  stock_status,
  status,
  warranty,
  category,
  image,
  images,
  created_at,
  updated_at
) VALUES
(
  'cp-plus-2-4-mp-4-camera-setup',
  'CP PLUS 2.4 MP - 4 Camera Full Setup 2Dom and 2Bullet Analogue Dual Light cameras',
  'CP PLUS 2.4 MP - 4 Camera Full Setup 2Dom and 2Bullet Analogue Dual Light cameras',
  'CP PLUS 2.4 MP - 4 Camera Full Setup containing 2 Dome and 2 Bullet Analogue Dual Light cameras. Complete set without hard drive. Includes DVR 8CH, 10amps SMPS, 4 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  17999.00,
  24999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-2-4-mp-8-camera-setup',
  'CP PLUS 2.4 MP - 8 Camera Full Setup 4Dom and 4Bullet Analogue Dual Light cameras',
  'CP PLUS 2.4 MP - 8 Camera Full Setup 4Dom and 4Bullet Analogue Dual Light cameras',
  'CP PLUS 2.4 MP - 8 Camera Full Setup containing 4 Dome and 4 Bullet Analogue Dual Light cameras. Complete set without hard drive. Includes DVR 8CH, 10amps SMPS, 8 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  25999.00,
  33999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-5-mp-4-camera-setup',
  'CP PLUS 5 MP - 4 Camera Full Setup 2Dom and 2Bullet Analogue Dual Light cameras',
  'CP PLUS 5 MP - 4 Camera Full Setup 2Dom and 2Bullet Analogue Dual Light cameras',
  'CP PLUS 5 MP - 4 Camera Full Setup containing 2 Dome and 2 Bullet Analogue Dual Light cameras. Complete set without hard drive. Includes DVR 8CH, 10amps SMPS, 4 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  23999.00,
  31999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-5-mp-8-camera-setup',
  'CP PLUS 5 MP - 8 Camera Full Setup 4Dom and 4Bullet Analogue Dual Light cameras',
  'CP PLUS 5 MP - 8 Camera Full Setup 4Dom and 4Bullet Analogue Dual Light cameras',
  'CP PLUS 5 MP - 8 Camera Full Setup containing 4 Dome and 4 Bullet Analogue Dual Light cameras. Complete set without hard drive. Includes DVR 8CH, 10amps SMPS, 8 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  33999.00,
  37999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-2mp-ip-16-camera-setup',
  'CP PLUS 2MP IP 16 Camera Full Setup 4Dom and 12Bullet IP Dual Light cameras',
  'CP PLUS 2MP IP 16 Camera Full Setup 4Dom and 12Bullet IP Dual Light cameras',
  'CP PLUS 2MP IP 16 Camera Full Setup containing 4 Dome and 12 Bullet IP Dual Light cameras. Complete set without hard drive. Includes NVR 16CH, 2pcs POE 8CH, 16 Cameras, and 100Mtr Lan Cable.',
  'CP PLUS',
  81999.00,
  129999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-2mp-ip-8-camera-setup',
  'CP PLUS 2MP IP 8 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 2MP IP 8 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 2MP IP 8 Camera Full Setup containing 4 Dome and 4 Bullet IP Dual Light cameras. Complete set without hard drive. Includes NVR 8CH, 1pc POE 8CH, 8 Cameras, and 100Mtr Lan Cable.',
  'CP PLUS',
  49999.00,
  75999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-2mp-ip-4-camera-setup',
  'CP PLUS 2MP IP 4 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 2MP IP 4 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 2MP IP 4 Camera Full Setup containing 4 Dome and 4 Bullet IP Dual Light cameras. Complete set without hard drive. Includes NVR 8CH, 1pc POE 8CH, 4 Cameras, and 100Mtr Lan Cable.',
  'CP PLUS',
  29999.00,
  47999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-4mp-ip-16-camera-setup',
  'CP PLUS 4MP IP 16 Camera Full Setup 4Dom and 12Bullet IP Dual Light cameras',
  'CP PLUS 4MP IP 16 Camera Full Setup 4Dom and 12Bullet IP Dual Light cameras',
  'CP PLUS 4MP IP 16 Camera Full Setup containing 4 Dome and 12 Bullet IP Dual Light cameras. Complete set without hard drive. Includes NVR 16CH, 2pcs POE 8CH, 16 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  99999.00,
  145999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-4mp-ip-8-camera-setup',
  'CP PLUS 4MP IP 8 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 4MP IP 8 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 4MP IP 8 Camera Full Setup containing 4 Dome and 4 Bullet IP Dual Light cameras. Complete set without hard drive. Includes NVR 16CH, 1pc POE 8CH, 8 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  75999.00,
  95999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'cp-plus-4mp-ip-4-camera-setup',
  'CP PLUS 4MP IP 4 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 4MP IP 4 Camera Full Setup 4Dom and 4Bullet IP Dual Light cameras',
  'CP PLUS 4MP IP 4 Camera Full Setup containing 4 Dome and 4 Bullet IP Dual Light cameras. Complete set without hard drive. Includes NVR 16CH, 1pc POE 8CH, 4 Cameras, and 100Mtr CCTV wire.',
  'CP PLUS',
  39999.00,
  145999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '1 Year',
  'CCTV Setup',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-cctv.webp'],
  NOW(),
  NOW()
),
(
  'seagate-1-tb-hdd-surveillance',
  'Seagate 1 TB HDD Surveillance',
  'Seagate 1 TB HDD Surveillance',
  'Seagate Surveillance HDD 1 TB storage drive built for 24/7 video capture systems. Offers high performance and reliability for multiple security camera feeds.',
  'Seagate',
  11999.00,
  14999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '3 Years',
  'Storage',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp'],
  NOW(),
  NOW()
),
(
  'seagate-2tb-hdd-surveillance',
  'Seagate 2TB HDD Surveillance',
  'Seagate 2TB HDD Surveillance',
  'Seagate Surveillance HDD 2 TB storage drive built for 24/7 video capture systems. Provides expanded capacity for longer video archive retention.',
  'Seagate',
  13999.00,
  17999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '3 Years',
  'Storage',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp'],
  NOW(),
  NOW()
),
(
  'consistent-500gb-hdd',
  'Consistant 500GB HDD',
  'Consistant 500GB HDD',
  'Consistant 500 GB Hard Disk Drive for surveillance and desktop computer storage. Reliable budget storage solution.',
  'Consistent',
  5999.00,
  7999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '2 Years',
  'Storage',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp'],
  NOW(),
  NOW()
),
(
  'consistent-1tb-hdd',
  'Consistant 1TB HDD',
  'Consistant 1TB HDD',
  'Consistant 1 TB Hard Disk Drive for surveillance and desktop computer storage. High performance budget storage drive.',
  'Consistent',
  8999.00,
  11999.00,
  'in_stock',
  'active'::public.product_lifecycle_status,
  '2 Years',
  'Storage',
  'https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp',
  ARRAY['https://fbcsagupcxheyiusjfak.supabase.co/storage/v1/object/public/images/products/placeholder-storage.webp'],
  NOW(),
  NOW()
)
ON CONFLICT (handle) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  warranty = EXCLUDED.warranty,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  updated_at = NOW();

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

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-ultra-64gb-usb-3-0-flash-drive', 
  'SanDisk Ultra 64GB USB 3.0 Flash Drive', 
  'SanDisk Ultra 64GB USB 3.0 Flash Drive', 
  '<p>Step up to high-speed USB 3.0 and transfer your videos, photos, and files faster. The SanDisk Ultra USB 3.0 Flash Drive offers transfer speeds of up to 130MB/s.</p><ul><li><b>Capacity:</b> 64GB</li><li><b>Interface:</b> USB 3.0 (USB 3.2 Gen 1)</li><li><b>Speed:</b> Read speeds up to 130MB/s.</li><li><b>Design:</b> Sleek, durable design with a retractable connector.</li><li><b>Security:</b> Includes SanDisk SecureAccess software.</li></ul>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3d82a476-913e-40a3-8113-8da9113a66f1-1781881374781.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3d82a476-913e-40a3-8113-8da9113a66f1-1781881374781.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1299, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-128gb-m-2-nvme-ssd-evmnv-128gb-520mb-s-read-370mb-s-writ', 
  'EVM 128GB M.2 NVMe SSD (EVMNV/128GB)-- 520MB/s Read & 370MB/s Write ', 
  'EVM 128GB M.2 NVMe SSD (EVMNV/128GB)-- 520MB/s Read & 370MB/s Write ', 
  '<p>Experience next-level performance with the EVM 128GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d715fe1d-7522-4e36-8a57-c655307d5c91-1781881376034.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d715fe1d-7522-4e36-8a57-c655307d5c91-1781881376034.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2599, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-ultra-256gb-usb-3-0-flash-drive', 
  'SanDisk Ultra 256GB USB 3.0 Flash Drive', 
  'SanDisk Ultra 256GB USB 3.0 Flash Drive', 
  '<p>Step up to high-speed USB 3.0 and transfer your videos, photos, and files faster. The SanDisk Ultra USB 3.0 Flash Drive offers transfer speeds of up to 130MB/s and a massive 256GB capacity.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Interface:</b> USB 3.0 (USB 3.2 Gen 1)</li><li><b>Speed:</b> Read speeds up to 130MB/s.</li><li><b>Design:</b> Sleek, durable design with a retractable connector.</li><li><b>Security:</b> Includes SanDisk SecureAccess software.</li></ul>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1c12ff30-e126-4fb0-93bf-b2b6398924a6-1781881376910.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1c12ff30-e126-4fb0-93bf-b2b6398924a6-1781881376910.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2799, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-256gb-m-2-nvme-ssd-evmnv-256gb-540mb-s-read-450mb-s-writ', 
  'EVM 256GB M.2 NVMe SSD (EVMNV/256GB) 540MB/s Read & 450MB/s Write', 
  'EVM 256GB M.2 NVMe SSD (EVMNV/256GB) 540MB/s Read & 450MB/s Write', 
  '<p>Experience next-level performance with the EVM 256GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a974d404-e943-4397-97fe-96652bedd595-1781881377768.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a974d404-e943-4397-97fe-96652bedd595-1781881377768.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4399, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-1tb-2-5-inch-sata-ssd-evm25-1tb', 
  'EVM 1TB 2.5-inch SATA SSD (EVM25/1TB)', 
  'EVM 1TB 2.5-inch SATA SSD (EVM25/1TB)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 1TB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness with ample storage.</p><ul><li><b>Capacity:</b> 1TB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect high-capacity upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e925f5c6-3a7d-4095-8965-387171f0c240-1781881378701.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e925f5c6-3a7d-4095-8965-387171f0c240-1781881378701.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  13299, 
  15999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-256gb-2-5-inch-sata-ssd-evm25-256', 
  'EVM 256GB 2.5-inch SATA SSD (EVM25/256)', 
  'EVM 256GB 2.5-inch SATA SSD (EVM25/256)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 256GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 256GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2b9e6d69-b3e2-47a0-8e26-3ec128c12c92-1781881379579.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2b9e6d69-b3e2-47a0-8e26-3ec128c12c92-1781881379579.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3799, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-cruzer-blade-64gb-usb-2-0-flash-drive', 
  'SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive', 
  'SanDisk Cruzer Blade 64GB USB 2.0 Flash Drive', 
  '<p>The SanDisk Cruzer Blade USB 2.0 Flash Drive offers a compact, stylish design and ample capacity.</p><ul><li><b>Capacity:</b> 64GB</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Ultra-compact and portable contoured styling.</li><li><b>Software:</b> Includes SanDisk SecureAccess software for password protection.</li></ul><p>A reliable and easy way to store, share, and transfer your photos, videos, music, and other files.</p>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/9c5fb4e1-b450-4d81-bc77-c6156dcfe370-1781881380576.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/9c5fb4e1-b450-4d81-bc77-c6156dcfe370-1781881380576.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  699, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-128gb-2-5-inch-sata-ssd-evm25-128', 
  'EVM 128GB 2.5-inch SATA SSD (EVM25/128)', 
  'EVM 128GB 2.5-inch SATA SSD (EVM25/128)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 128GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2c4a78a8-395b-4e57-b222-d156e58f1fef-1781881381707.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2c4a78a8-395b-4e57-b222-d156e58f1fef-1781881381707.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2399, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'sandisk-cruzer-blade-128gb-usb-2-0-flash-drive', 
  'SanDisk Cruzer Blade 128GB USB 2.0 Flash Drive', 
  'SanDisk Cruzer Blade 128GB USB 2.0 Flash Drive', 
  '<p>The SanDisk Cruzer Blade USB 2.0 Flash Drive offers a compact, stylish design and a large 128GB capacity.</p><ul><li><b>Capacity:</b> 128GB</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Ultra-compact and portable contoured styling.</li><li><b>Software:</b> Includes SanDisk SecureAccess software for password protection.</li></ul><p>A reliable and easy way to store, share, and transfer your photos, videos, music, and other files.</p>', 
  'SanDisk', 
  'Storage', 
  'Flash Drives', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/801c679f-906a-4a8b-9720-d83e6b75532d-1781881382939.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/801c679f-906a-4a8b-9720-d83e6b75532d-1781881382939.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1399, 
  1999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-512gb-2-5-inch-sata-ssd-evm25-512', 
  'EVM 512GB 2.5-inch SATA SSD (EVM25/512)', 
  'EVM 512GB 2.5-inch SATA SSD (EVM25/512)', 
  '<p>Boost your laptop or desktop PC performance with the EVM 512GB SATA SSD. Experience faster boot-ups, quicker application loads, and improved overall system responsiveness.</p><ul><li><b>Capacity:</b> 512GB</li><li><b>Form Factor:</b> 2.5-inch</li><li><b>Interface:</b> SATA III (6Gb/s)</li><li><b>Technology:</b> 3D NAND</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>A perfect upgrade to breathe new life into an aging computer.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a9337df3-b731-4451-9148-8a11efa6e5bf-1781881383514.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a9337df3-b731-4451-9148-8a11efa6e5bf-1781881383514.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  5899, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-512gb-m-2-nvme-ssd-evmnv-512gb-540mb-s-read-450mb-s-writ', 
  'EVM 512GB M.2 NVMe SSD (EVMNV/512GB) 540MB/s Read & 450MB/s Write', 
  'EVM 512GB M.2 NVMe SSD (EVMNV/512GB) 540MB/s Read & 450MB/s Write', 
  '<p>Experience next-level performance with the EVM 512GB M.2 NVMe SSD. Utilizing the PCIe Gen3x4 interface, it delivers significantly faster speeds than traditional SATA SSDs.</p><ul><li><b>Capacity:</b> 512GB</li><li><b>Form Factor:</b> M.2 2280</li><li><b>Interface:</b> PCIe Gen3x4 NVMe 1.3</li><li><b>Warranty:</b> 5-Year Warranty</li></ul><p>Ideal for ultra-thin notebooks and high-performance desktops.</p>', 
  'EVM', 
  'Storage', 
  'Internal SSDs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bb78d6d8-0bc2-4fdd-8bfd-6437ef4d46be-1781881384968.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bb78d6d8-0bc2-4fdd-8bfd-6437ef4d46be-1781881384968.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  7299, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-h110-motherboard', 
  'EVM H110 Motherboard', 
  'EVM H110 Motherboard', 
  '<p>Upgrade to DDR4 with the EVM H110 Motherboard, designed for 6th and 7th Generation Intel Core processors.</p><ul><li><b>Chipset:</b> Intel H110</li><li><b>Socket:</b> LGA 1151</li><li><b>Memory Support:</b> Dual Channel DDR4 (2133/2400MHz)</li><li><b>Form Factor:</b> Micro-ATX</li><li><b>Ports:</b> VGA, HDMI, USB 3.0, USB 2.0, LAN</li></ul>', 
  'EVM', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/eda7cb1d-7e44-4578-8086-19df90dd5e31-1781881385815.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/eda7cb1d-7e44-4578-8086-19df90dd5e31-1781881385815.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4599, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-8gb-ddr3-1600mhz-ram', 
  'EVM 8GB DDR3 1600MHz RAM', 
  'EVM 8GB DDR3 1600MHz RAM', 
  '<p>Maximize your DDR3 system''s multitasking capabilities with this 8GB memory module from EVM.</p><ul><li><b>Capacity:</b> 8GB</li><li><b>Type:</b> DDR3</li><li><b>Speed:</b> 1600MHz (PC3-12800)</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>', 
  'EVM', 
  'Computer Components', 
  'RAM', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e5c05292-ed89-4d55-a8ac-9f550220571d-1781881386788.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e5c05292-ed89-4d55-a8ac-9f550220571d-1781881386788.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1799, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-8gb-ddr4-2666mhz-ram', 
  'EVM 8GB DDR4 2666MHz RAM', 
  'EVM 8GB DDR4 2666MHz RAM', 
  '<p>A high-performance 8GB DDR4 memory module for modern desktops. Runs at a speedy 2666MHz.</p><ul><li><b>Capacity:</b> 8GB</li><li><b>Type:</b> DDR4</li><li><b>Speed:</b> 2666MHz</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>', 
  'EVM', 
  'Computer Components', 
  'RAM', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5c3ba1d8-f649-4c5b-972c-614c6dec93a8-1781881387679.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5c3ba1d8-f649-4c5b-972c-614c6dec93a8-1781881387679.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4699, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'evm-4gb-ddr3-1600mhz-ram', 
  'EVM 4GB DDR3 1600MHz RAM', 
  'EVM 4GB DDR3 1600MHz RAM', 
  '<p>Boost your PC''s performance with this 4GB DDR3 memory module. Ideal for systems supporting 1600MHz RAM.</p><ul><li><b>Capacity:</b> 4GB</li><li><b>Type:</b> DDR3</li><li><b>Speed:</b> 1600MHz (PC3-12800)</li><li><b>Form Factor:</b> DIMM (Desktop)</li><li><b>Warranty:</b> 10-Year Warranty</li></ul>', 
  'EVM', 
  'Computer Components', 
  'RAM', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7420b8e6-dabd-4ee7-ae14-4a5caeaf8bba-1781881388902.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7420b8e6-dabd-4ee7-ae14-4a5caeaf8bba-1781881388902.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  799, 
  3999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'enter-19-inch-led-monitor', 
  'Enter 19-Inch LED Monitor', 
  'Enter 19-Inch LED Monitor', 
  '<p>An affordable and reliable 19-inch (18.5-inch viewable) LED monitor from Enter. Perfect for office work, home use, or as a secondary display.</p><ul><li><b>Screen Size:</b> 19-inch (18.5" diagonal)</li><li><b>Panel Type:</b> LED</li><li><b>Resolution:</b> 1366 x 768 (HD)</li><li><b>Inputs:</b> 1x VGA, 1x HDMI</li><li><b>Design:</b> Slim profile, VESA mount compatible.</li></ul>', 
  'Enter', 
  'Monitors', 
  'LED Monitors', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/05721867-8454-4c1c-95a3-a71f142cb16a-1781881389843.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/05721867-8454-4c1c-95a3-a71f142cb16a-1781881389843.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2999, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'zebronics-600va-ups-zeb-u725', 
  'Zebronics 600VA UPS (Zeb-U725)', 
  'Zebronics 600VA UPS (Zeb-U725)', 
  '<p>Protect your PC and other electronics from power outages with the Zebronics 600VA UPS. Provides essential battery backup and surge protection.</p><ul><li><b>Capacity:</b> 600VA / 360W</li><li><b>Type:</b> Line Interactive</li><li><b>Backup Time:</b> Provides 10-15 minutes of backup (typical PC load).</li><li><b>Features:</b> Automatic Voltage Regulation (AVR), Audible Alarm.</li><li><b>Outlets:</b> 3x India 3-pin outlets (battery backup).</li></ul>', 
  'Zebronics', 
  'Power Backup', 
  'UPS', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/cba71234-8cb9-4936-a256-83fe2c0055c7-1781881390668.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/cba71234-8cb9-4936-a256-83fe2c0055c7-1781881390668.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  999, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'artis-smp-400c-smps-power-supply', 
  'Artis SMP 400C SMPS (Power Supply)', 
  'Artis SMP 400C SMPS (Power Supply)', 
  '<p>A reliable standard power supply for basic desktop computers. The Artis 400C provides stable power for home and office builds.</p><ul><li><b>Wattage:</b> 400W (Peak)</li><li><b>Fan:</b> 80mm Cooling Fan</li><li><b>Connectors:</b> 24-pin ATX, 4-pin CPU, SATA, Molex</li><li><b>Protection:</b> Over Voltage Protection (OVP).</li></ul>', 
  'Artis', 
  'Computer Components', 
  'Power Supplies', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/93d79bc8-86d9-484b-802a-4948b96f21df-1781881391512.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/93d79bc8-86d9-484b-802a-4948b96f21df-1781881391512.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2699, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'quick-heal-internet-security-1-user-1-year', 
  'Quick Heal Internet Security 1 User 1 Year', 
  'Quick Heal Internet Security 1 User 1 Year', 
  '<p>Comprehensive antivirus and internet security for your PC. Quick Heal Internet Security protects you from malware, ransomware, and online threats.</p><ul><li><b>Device Support:</b> 1 User (PC)</li><li><b>Subscription:</b> 1 Year License</li><li><b>Protection:</b> Advanced DNAScan, Ransomware Protection, Safe Banking, Firewall.</li><li><b>Type:</b> Digital License / Activation Code.</li></ul>', 
  'Quick Heal', 
  'Software', 
  'Antivirus & Security', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a4139eb4-ad02-429f-8b18-c2f1cb8241a5-1781881392440.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a4139eb4-ad02-429f-8b18-c2f1cb8241a5-1781881392440.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  499, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'tp-link-archer-c6-ac1200-wireless-router', 
  'TP-Link Archer C6 AC1200 Wireless Router', 
  'TP-Link Archer C6 AC1200 Wireless Router', 
  '<p>Upgrade your home network to high-speed dual-band Wi-Fi with the TP-Link Archer C6. It supports the 802.11ac standard and delivers speeds up to 1200Mbps.</p><ul><li><b>Speed:</b> AC1200 (867Mbps on 5GHz + 300Mbps on 2.4GHz)</li><li><b>Antennas:</b> 4x external antennas + 1x internal</li><li><b>Ports:</b> 1x Gigabit WAN, 4x Gigabit LAN</li><li><b>Features:</b> MU-MIMO, Access Point Mode, OneMesh support.</li></ul>', 
  'TP-Link', 
  'Networking', 
  'Routers', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/522c2967-941d-4710-b18d-d009ea8919e3-1781881393460.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/522c2967-941d-4710-b18d-d009ea8919e3-1781881393460.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3199, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-vintage-keyboard-combo-blue', 
  'Coconut Vintage Keyboard Combo - Blue', 
  'Coconut Vintage Keyboard Combo - Blue', 
  '<p>A stylish wired keyboard and mouse combo with a retro "vintage" typewriter-key design in a striking blue color.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Vintage Blue, Round Typewriter-style Keycaps</li><li><b>Features:</b> LED backlit keyboard, Ergonomic mouse.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/78a2c7e9-006f-4653-831b-6d233e9ad0d8-1781881394702.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/78a2c7e9-006f-4653-831b-6d233e9ad0d8-1781881394702.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1699, 
  3999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-k26-illume-mechanical-keyboard', 
  'Coconut K26 Illume Mechanical Keyboard', 
  'Coconut K26 Illume Mechanical Keyboard', 
  '<p>The Coconut K26 Illume is a full-sized mechanical keyboard built for gamers and typists. Features durable mechanical switches and vibrant illumination.</p><ul><li><b>Type:</b> Mechanical (Blue/Red switches common)</li><li><b>Layout:</b> Full-size 104 Keys</li><li><b>Lighting:</b> LED Backlit (e.g., Rainbow or 7-color)</li><li><b>Build:</b> Metal Panel, Braided Cable</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/8d3ee7b2-f0e6-4d73-8771-749eb4a03ddd-1781881395794.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/8d3ee7b2-f0e6-4d73-8771-749eb4a03ddd-1781881395794.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  599, 
  1999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-m16-usb-gaming-mouse-zeta-black', 
  'Coconut M16 USB Gaming Mouse - Zeta Black', 
  'Coconut M16 USB Gaming Mouse - Zeta Black', 
  '<p>The Coconut M16 is a wired USB gaming mouse designed for comfort and precision. Features customizable RGB lighting to match your setup.</p><ul><li><b>Connection:</b> Wired USB</li><li><b>Design:</b> Ergonomic, Zeta Black, RGB Lighting</li><li><b>DPI:</b> High-Precision Sensor (e.g., up to 3200 DPI)</li><li><b>Buttons:</b> 6 Buttons with scroll wheel.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e52b13cc-c2f0-4e6e-abda-1717ef075fa2-1781881396825.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e52b13cc-c2f0-4e6e-abda-1717ef075fa2-1781881396825.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  199, 
  399
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wm21-wireless-bt-mouse-kudos-black', 
  'Coconut WM21 Wireless+BT Mouse Kudos - Black', 
  'Coconut WM21 Wireless+BT Mouse Kudos - Black', 
  '<p>The ultimate versatile mouse. The Coconut WM21 can connect via 2.4GHz Wireless (with USB dongle) or directly via Bluetooth, allowing you to switch between devices.</p><ul><li><b>Connection:</b> Dual Mode (2.4GHz Wireless + Bluetooth)</li><li><b>Design:</b> Ergonomic, Black, 6 Buttons</li><li><b>DPI:</b> Adjustable DPI (1000/1600/2400)</li><li><b>Features:</b> Rechargeable Battery, Silent Click.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b45dc1a0-60a1-4579-9c4e-bbda293efd9c-1781881399446.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b45dc1a0-60a1-4579-9c4e-bbda293efd9c-1781881399446.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  499, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-bling-keyboard-combo-blue', 
  'Coconut Bling Keyboard Combo - Blue', 
  'Coconut Bling Keyboard Combo - Blue', 
  '<p>A vibrant and colorful wired keyboard and mouse combo. The "Bling" combo features bright LED illumination and a modern design.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Blue, Ergonomic</li><li><b>Lighting:</b> Rainbow LED Backlit Keyboard, 7-Color LED Mouse</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/aec8255a-a6f4-4a16-a1b4-d17b8bf505b0-1781881400642.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/aec8255a-a6f4-4a16-a1b4-d17b8bf505b0-1781881400642.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1599, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wk29-wm29-wireless-combo-mini-desire-black-grey', 
  'Coconut WK29+WM29 Wireless Combo Mini Desire - Black/Grey', 
  'Coconut WK29+WM29 Wireless Combo Mini Desire - Black/Grey', 
  '<p>A sleek and modern wireless keyboard and mouse combo. Features a full-size keyboard with a number pad and an ergonomic mouse.</p><ul><li><b>Type:</b> Wireless Keyboard + Mouse Combo</li><li><b>Connection:</b> 2.4GHz Wireless (Single Receiver)</li><li><b>Design:</b> Slim, Black/Grey, Full-size Keyboard</li><li><b>Features:</b> Quiet keys, Auto sleep mode.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/144a90df-03fc-4027-93b3-40f5ff138420-1781881402534.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/144a90df-03fc-4027-93b3-40f5ff138420-1781881402534.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  899, 
  1999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wk31-bluetooth-keyboard-bravo3-black', 
  'Coconut WK31 Bluetooth Keyboard Bravo3- Black', 
  'Coconut WK31 Bluetooth Keyboard Bravo3- Black', 
  '<p>A slim, compact, and wireless Bluetooth keyboard. The Coconut WK31 is perfect for connecting to your PC, tablet, or smartphone.</p><ul><li><b>Connection:</b> Bluetooth 3.0</li><li><b>Design:</b> Slim, Mini Keyboard, Black</li><li><b>Compatibility:</b> Windows, macOS, Android, iOS</li><li><b>Features:</b> Scissor-switch keys for quiet typing.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2175f52b-c8f3-4687-9b29-e36e96f70eec-1781881405409.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/2175f52b-c8f3-4687-9b29-e36e96f70eec-1781881405409.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1299, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-k27-wired-keyboard-steel-black', 
  'Coconut K27 Wired Keyboard STEEL - Black', 
  'Coconut K27 Wired Keyboard STEEL - Black', 
  '<p>A simple, reliable, and full-sized wired USB keyboard. The Coconut K27 is perfect for home or office use, featuring a spill-resistant design.</p><ul><li><b>Connection:</b> Wired USB</li><li><b>Layout:</b> Full-size 104 Keys</li><li><b>Design:</b> Standard, Black, Spill-Resistant</li><li><b>Features:</b> Plug and Play, Durable build.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fe526cac-52c0-4307-8fec-42df92a3c631-1781881406240.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fe526cac-52c0-4307-8fec-42df92a3c631-1781881406240.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  599, 
  1399
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-desire-2-0-keyboard-combo-black-grey', 
  'Coconut Desire 2.0 Keyboard Combo - Black/Grey', 
  'Coconut Desire 2.0 Keyboard Combo - Black/Grey', 
  '<p>A basic and affordable wired keyboard and mouse combo. The Desire 2.0 is built for reliability and everyday use in the office or at home.</p><ul><li><b>Type:</b> Wired Keyboard + Mouse Combo</li><li><b>Connection:</b> Wired USB (x2)</li><li><b>Design:</b> Standard, Black/Grey, Full-size Keyboard</li><li><b>Features:</b> Plug and Play, Durable and spill-resistant.</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Keyboard & Mouse Combos', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/47cb59ff-3fb3-44ae-aa19-59414e13f918-1781881407672.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/47cb59ff-3fb3-44ae-aa19-59414e13f918-1781881407672.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  899, 
  1599
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wm28-prism-wireless-mouse-black', 
  'Coconut WM28 Prism Wireless Mouse - Black', 
  'Coconut WM28 Prism Wireless Mouse - Black', 
  '<p>The Coconut WM28 Prism features eye-catching RGB lighting in a wireless, rechargeable design. Ergonomically built for comfortable use.</p><ul><li><b>Connection:</b> 2.4GHz Wireless via USB Nano Receiver</li><li><b>Battery:</b> Rechargeable via Micro-USB</li><li><b>Lighting:</b> 7-Color RGB "Prism" effect</li><li><b>DPI:</b> Adjustable DPI (up to 1600)</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7d62abca-14ad-4460-89c3-d5cc5581de61-1781881409279.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7d62abca-14ad-4460-89c3-d5cc5581de61-1781881409279.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  499, 
  899
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-wm20-wireless-mouse-lucid-black', 
  'Coconut WM20 Wireless Mouse - Lucid Black', 
  'Coconut WM20 Wireless Mouse - Lucid Black', 
  '<p>Experience wireless freedom with the Coconut WM20. This mouse features a sleek, ergonomic design in a striking Lucid White finish.</p><ul><li><b>Connection:</b> 2.4GHz Wireless via USB Nano Receiver</li><li><b>Design:</b> Ergonomic, Ambidextrous, Lucid White</li><li><b>DPI:</b> Adjustable DPI (800/1200/1600)</li><li><b>Features:</b> Silent Click, Auto Sleep Mode</li></ul>', 
  'Coconut', 
  'Peripherals', 
  'Mice', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/70d345aa-0b22-4002-b9f5-d346128e6585-1781881410488.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/70d345aa-0b22-4002-b9f5-d346128e6585-1781881410488.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  799, 
  2499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'coconut-x25-nvme-enclosure-space-gray', 
  'Coconut X25 NVMe Enclosure - Space Gray', 
  'Coconut X25 NVMe Enclosure - Space Gray', 
  '<p>Transform your M.2 NVMe SSD into a super-fast portable external drive. The Coconut X25 features a durable aluminum alloy shell and a high-speed USB 3.1/3.2 interface.</p><ul><li><b>For SSD Type:</b> M.2 NVMe (M-Key / B+M Key)</li><li><b>Interface:</b> USB 3.1/3.2 Gen 2 Type-C</li><li><b>Speed:</b> Up to 10Gbps</li><li><b>Build:</b> Aluminum Alloy, Space Gray</li></ul>', 
  'Coconut', 
  'Storage', 
  'External Enclosures', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d36dc99b-594c-4595-aeb7-883dc403f85b-1781881411530.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d36dc99b-594c-4595-aeb7-883dc403f85b-1781881411530.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  799, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '862784e7-6ee2-4c44-82e5-09e5b93c459b', 
  'Coconut WA04 Wireless Adapter - V2', 
  'Coconut WA04 Wireless Adapter - V2', 
  '<p>Add Wi-Fi connectivity to your desktop or laptop with this compact USB wireless adapter. The "V2" likely indicates an updated chipset or design.</p><ul><li><b>Type:</b> USB Wi-Fi Adapter</li><li><b>Speed:</b> N150 (150Mbps) or N300 (300Mbps)</li><li><b>Interface:</b> USB 2.0</li><li><b>Design:</b> Nano or Mini with small antenna</li></ul>', 
  'Coconut', 
  'Networking', 
  'Wi-Fi Adapters', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bf062e20-0d97-450a-ba9c-099e9c466006-1781881412502.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bf062e20-0d97-450a-ba9c-099e9c466006-1781881412502.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  199, 
  449
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ee67aa17-1079-41f8-9de4-78aef6c97c77', 
  'Coconut CF01 CPU Cooler - Black', 
  'Coconut CF01 CPU Cooler - Black', 
  '<p>An aftermarket air cooler for your CPU. The Coconut CF01 is a top-flow style cooler, providing efficient cooling with an LED fan.</p><ul><li><b>Type:</b> CPU Air Cooler (Top-Flow)</li><li><b>Compatibility:</b> Intel & AMD Sockets</li><li><b>Fan:</b> 90mm or 120mm with LED/RGB lighting</li><li><b>Heatsink:</b> Aluminum Heatsink</li></ul>', 
  'Coconut', 
  'Computer Components', 
  'CPU Coolers', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3c514d90-92f1-4d92-9225-c6d4fb8db3ee-1781881413593.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3c514d90-92f1-4d92-9225-c6d4fb8db3ee-1781881413593.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  199, 
  449
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'e3a49a0c-906f-4df2-a127-851c7c5c8622', 
  'Coconut MOB-12 Mobile Stand - Silver', 
  'Coconut MOB-12 Mobile Stand - Silver', 
  '<p>A premium, adjustable desktop stand for your smartphone or tablet. Made from durable aluminum alloy, it''s perfect for video calls or hands-free viewing.</p><ul><li><b>Type:</b> Mobile/Tablet Desktop Stand</li><li><b>Material:</b> Aluminum Alloy</li><li><b>Color:</b> Silver</li><li><b>Features:</b> Adjustable Angle, Foldable, Anti-slip silicone pads.</li></ul>', 
  'Coconut', 
  'Accessories', 
  'Stands', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e1faf0f8-5bad-444d-9bc5-d0edec8c71a6-1781881414299.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e1faf0f8-5bad-444d-9bc5-d0edec8c71a6-1781881414299.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  229, 
  499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '83bec406-9e4b-4dd0-8d9b-dc79ac3b4e79', 
  'Coconut CF03 CPU Cooler - Black', 
  'Coconut CF03 CPU Cooler - Black', 
  '<p>An aftermarket air cooler for your CPU. The Coconut CF03 provides better cooling performance and quieter operation than stock coolers, with RGB/LED lighting.</p><ul><li><b>Type:</b> CPU Air Cooler</li><li><b>Compatibility:</b> Intel & AMD Sockets (e.g., LGA 115x/1200, AM4)</li><li><b>Fan:</b> 90mm or 120mm with LED/RGB lighting</li><li><b>Heatsink:</b> Aluminum Heatsink</li></ul>', 
  'Coconut', 
  'Computer Components', 
  'CPU Coolers', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/831c207a-36f2-4510-a5ad-7c1b241a4753-1781881415424.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/831c207a-36f2-4510-a5ad-7c1b241a4753-1781881415424.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  699, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '00256181-2e09-49bf-ac10-ff245e27b244', 
  'CP PLUS IP 2MP DOME DUALLIGHT (CP-UNC-DA21L3C-LQ)', 
  'CP PLUS IP 2MP DOME DUALLIGHT (CP-UNC-DA21L3C-LQ)', 
  '<p>Secure your premises with the CP Plus 2MP IP Dome Camera. Equipped with Dual Light technology, it switches between infrared and warm light for clear full-color night vision. Features a built-in microphone for synchronized audio monitoring.</p><ul><li><b>Resolution:</b> Full HD 1080p (2 Megapixel)</li><li><b>Illumination:</b> Dual Light (IR and Warm Light up to 30m)</li><li><b>Audio:</b> Built-in high sensitivity microphone</li><li><b>Protection:</b> IP67 Weatherproof</li><li><b>Power:</b> Power over Ethernet (PoE) support</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/f1df765a-e1ba-4990-901a-53d6137d9f95-1781881416422.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/f1df765a-e1ba-4990-901a-53d6137d9f95-1781881416422.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3899, 
  5999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ff142575-bf13-4790-9223-3e5200ff531e', 
  'CP PLUS IP 2MP DUALLIGHT - BULLET (CP-UNC-TA21L3C-LQ)', 
  'CP PLUS IP 2MP DUALLIGHT - BULLET (CP-UNC-TA21L3C-LQ)', 
  '<p>Durable and high-performing, the CP Plus 2MP IP Bullet Camera offers reliable outdoor protection. Features Dual Light technology for full-color day/night video and built-in audio capture.</p><ul><li><b>Form Factor:</b> Outdoor Bullet Camera</li><li><b>Resolution:</b> 1080p (2 Megapixel)</li><li><b>Illumination:</b> Smart Dual Light (up to 30m)</li><li><b>Audio:</b> Integrated microphone for audio recording</li><li><b>Durability:</b> IP67 weatherproof housing</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/0e2593ee-1563-4c55-9491-4ee3a0c0b022-1781881417448.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/0e2593ee-1563-4c55-9491-4ee3a0c0b022-1781881417448.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4199, 
  6999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '3ee6d862-1cbc-4192-866d-62ded06490f5', 
  'CP PLUS IP 4MP DOME DUALLIGHT (CP-UNC-DA41L3C-D-LQ)', 
  'CP PLUS IP 4MP DOME DUALLIGHT (CP-UNC-DA41L3C-D-LQ)', 
  '<p>Upgrade your security to high-definition with the CP Plus 4MP IP Dome Camera. Features WDR (120dB) for high contrast lighting situations, Dual Light full-color night vision, and an integrated microphone.</p><ul><li><b>Resolution:</b> 4 Megapixel (Super HD)</li><li><b>Optics:</b> Fixed 3.6mm lens with Smart IR</li><li><b>Night Vision:</b> Dual Light (IR + Warm Light up to 30m)</li><li><b>Features:</b> 120dB Wide Dynamic Range (WDR), Built-in Mic</li><li><b>Network:</b> PoE support, IP67 housing</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e38ed727-10e3-4cb4-aacb-59add361dd1c-1781881418259.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e38ed727-10e3-4cb4-aacb-59add361dd1c-1781881418259.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4899, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '3e9aa63d-ac84-43c3-9e5a-6759f9bc7847', 
  'CP PLUS IP 4MP BULLET DUALLIGHT (CP-UNC-TA41L3C-D-LQ)', 
  'CP PLUS IP 4MP BULLET DUALLIGHT (CP-UNC-TA41L3C-D-LQ)', 
  '<p>Get high-detail outdoor surveillance with the CP Plus 4MP IP Bullet Camera. Combines sharp 4MP resolution, true 120dB WDR, and Dual Light technology for colored footage even in low-light environments.</p><ul><li><b>Form Factor:</b> Weatherproof Bullet</li><li><b>Resolution:</b> 4 Megapixel (2688 x 1520)</li><li><b>Night Vision:</b> Dual Light range up to 30 meters</li><li><b>Audio:</b> Built-in microphone</li><li><b>Advanced:</b> 120dB WDR, H.265 compression, PoE support</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'IP Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7f3f4e1d-4a40-4472-a2c2-a59467a2c5e4-1781881419017.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7f3f4e1d-4a40-4472-a2c2-a59467a2c5e4-1781881419017.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  5199, 
  8999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ee22e34b-a3f9-4684-b06a-e73f644b6343', 
  'CP PLUS DVR 4CH (CP-UVR-0401E1-IC2 2MP)', 
  'CP PLUS DVR 4CH (CP-UVR-0401E1-IC2 2MP)', 
  '<p>Consolidate your security network with the CP Plus 4-Channel Hybrid DVR. Supporting standard analog, HD analog, and IP cameras, it balances quality and storage with efficient H.265 compression and Smart Motion Detection (SMD Plus).</p><ul><li><b>Channels:</b> 4 BNC Analog channels + 1 additional IP channel</li><li><b>Compression:</b> H.265 video compression</li><li><b>Smart:</b> SMD Plus (Smart Motion Detection for human/vehicle)</li><li><b>Storage:</b> Supports 1 SATA HDD up to 6TB</li><li><b>Interface:</b> HDMI and VGA output</li></ul>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'DVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3af4d266-e45f-442a-b54f-d5460273e10a-1781881419965.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3af4d266-e45f-442a-b54f-d5460273e10a-1781881419965.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4199, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '74fb6f3e-4913-4bb6-aab7-ffd9ffccb878', 
  'CP Plus 16 Channel Full HD H.265+ DVR Upto 2 MP Supported (Model - CP-UVR-1601E1-IC OR CP-UVR-1601E1-HC)', 
  'CP Plus 16 Channel Full HD H.265+ DVR Upto 2 MP Supported (Model - CP-UVR-1601E1-IC OR CP-UVR-1601E1-HC)', 
  '<p>CP-UVR-1601E1-IC2 Description ðŸ“¹ CP-UVR-1601E1-IC2 Digital Video Recorder (DVR) The CP-UVR-1601E1-IC2 is a powerful 16-Channel Hybrid Digital Video Recorder (DVR) from CP Plus, designed for medium-scale surveillance systems.</p><ul><li><b>Channels:</b> Supports 16 BNC channels for connecting analog cameras.</li><li><b>Resolution:</b> Records main stream video at up to 1080N (1080p Lite) resolution, balancing quality and storage needs.</li><li><b>Hybrid (Penta-brid) Technology:</b> Highly flexible, supporting all five common analog signal types: HDCVI, AHD, TVI, CVBS (Analog) , plus it supports **two additional IP channels** (up to 18 channels total).</li><li><b>Smart Features:</b> Utilizes the efficient H.265+ video compression standard and includes SMD Plus (Smart Motion Detection) on analog channels to accurately distinguish and classify Humans and Vehicles , significantly reducing false alerts.</li><li><b>Storage:</b> Supports 1 SATA hard disk drive (HDD) up to 6TB for recorded footage.</li><li><b>Outputs:</b> Features simultaneous video output via HDMI and VGA ports.</li></ul><p>In summary, this is a versatile, high-channel-count 16-channel Hybrid DVR featuring AI-based human/vehicle detection and efficient H.265+ compression, making it ideal for large home or small commercial security installations.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'DVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5cb02f3c-3c4e-43ad-ac62-7a938a41e288-1781881420840.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/5cb02f3c-3c4e-43ad-ac62-7a938a41e288-1781881420840.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  7999, 
  12999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '029ff84d-01be-45e3-9b87-f3445bb34e99', 
  'CP PLUS 8CH 2MP HD DVR (CP-UVR-0801E1-IC2)', 
  'CP PLUS 8CH 2MP HD DVR (CP-UVR-0801E1-IC2)', 
  '<p>CP-UVR-0801E1-IC2 Description ðŸ“¹ CP-UVR-0801E1-IC2 Digital Video Recorder (DVR) The CP-UVR-0801E1-IC2 is an 8-Channel Hybrid Digital Video Recorder (DVR) from CP Plus, designed for small to medium-sized surveillance systems.</p><ul><li><b>Channels:</b> Supports 8 BNC channels for analog cameras.</li><li><b>Resolution:</b> Records video streams at up to 1080N (1080p Lite) resolution.</li><li><b>Hybrid (Penta-brid) Compatibility:</b> Flexible support for all major analog formats (HDCVI, AHD, TVI, CVBS), plus **two additional IP channels** (up to 10 channels total) at 2MP.</li><li><b>Smart Features:</b> Includes efficient H.265+ compression and SMD Plus (Smart Motion Detection) on analog channels to accurately distinguish and classify Humans and Vehicles .</li><li><b>Storage:</b> Supports 1 SATA hard disk drive (HDD) up to 6TB.</li><li><b>Outputs:</b> Features simultaneous video output via HDMI and VGA ports.</li></ul><p>In summary, this is a versatile 8-channel Hybrid DVR that allows users to connect various camera types and features AI-based detection for smarter, more focused recording.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'DVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/42738d97-52d5-4fee-88e9-0c6548609910-1781881421675.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/42738d97-52d5-4fee-88e9-0c6548609910-1781881421675.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4999, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'b04befb0-06e1-461d-a275-952d9823d75e', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - BULLET (TC24PL3C-L-V2)', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - BULLET (TC24PL3C-L-V2)', 
  '<p>TC24PL3C-L-V2 Description ðŸ“¹ TC24PL3C-L-V2 Camera (Bullet) The TC24PL3C-L-V2 is a reliable **HD Analog Bullet Camera** suitable for universal surveillance applications.</p><ul><li><b>Form Factor:</b> Robust **Bullet-style camera** designed for easy outdoor and indoor installation.</li><li><b>Resolution:</b> Provides **Full HD 1080p** video quality (likely 2.4 Megapixel sensor).</li><li><b>Multi-Format:</b> It is a 4-in-1 camera , capable of outputting video in **HDCVI, HDTVI, AHD, and CVBS** formats, ensuring broad compatibility with various DVR systems.</li><li><b>Night Vision:</b> Equipped with built-in **IR (Infrared) illumination** for clear black and white video capture in total darkness.</li><li><b>Use Case:</b> Ideal for reliable, all-weather (typically IP66/IP67 rated) surveillance where high definition is required.</li></ul><p>In summary, this is a versatile, 1080p, multi-format analog bullet camera used for reliable day and night surveillance in various environments.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bdfb22f0-fff9-49a0-92a4-ccb08582a270-1781881422648.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bdfb22f0-fff9-49a0-92a4-ccb08582a270-1781881422648.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1899, 
  3499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'ac03b6a8-1013-43db-9c4d-1ca4a07d5c28', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2)', 
  'CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2)', 
  '<p>DC24PL3C-L-V2 Description ðŸ“¹ CP PLUS 2.4MP DUAL LIGHT MIC - DOME (DC24PL3C-L-V2) The DC24PL3C-L-V2 is an **HD Analog Dome Camera** featuring both high-quality video and enhanced lighting technology, plus built-in audio.</p><ul><li><b>Resolution:</b> Captures video in **Full HD 1080p** resolution (2.4 Megapixel sensor).</li><li><b>Form Factor:</b> Classic **Dome-style camera** (indicated by ''DC''), suitable for discreet indoor or protected outdoor mounting.</li><li><b>Dual Light Technology:</b> Provides clear night vision using both **IR (Infrared)** for standard B/W viewing and **Warm Light** to deliver full-color images in low-light conditions.</li><li><b>Audio:</b> Includes a **Built-in Mic** for simultaneous video and audio recording (audio over coax/PoC compatibility may vary by DVR).</li><li><b>Multi-Format:</b> A 4-in-1 camera , compatible with **HDCVI, HDTVI, AHD, and CVBS** analog DVRs.</li><li><b>Use Case:</b> Ideal for locations where both visual detail, audio recording, and color night vision are required.</li></ul><p>In summary, this is a feature-rich 1080p dome camera providing both Dual Light color night vision and integrated audio recording, highly compatible with existing analog systems.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d933ceab-4838-418d-9598-7294a537640e-1781881423538.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/d933ceab-4838-418d-9598-7294a537640e-1781881423538.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1799, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '4701065d-51da-40f1-ba75-b2fb2c5962a8', 
  'CP PLUS 5MP DUAL LIGHT MIC - DOME (CP-URC-DC51PL3C-L-V2)', 
  'CP PLUS 5MP DUAL LIGHT MIC - DOME (CP-URC-DC51PL3C-L-V2)', 
  '<p>CP-URC-DC51PL3C-L-V2 Description ðŸ“¹ CP-URC-DC51PL3C-L-V2 Camera (5MP Dome) The CP-URC-DC51PL3C-L-V2 is a high-resolution, multi-format 5 Megapixel (5MP) Dome Camera from CP Plus, designed for high-detail surveillance.</p><ul><li><b>Resolution:</b> Provides superior image quality with a **5 Megapixel** resolution, which is significantly higher than Full HD.</li><li><b>Form Factor:</b> Features a **Dome-style housing** (indicated by ''DC''), suitable for discreet ceiling or wall mounting.</li><li><b>Technology:</b> It is a 4-in-1 HD Analog camera , ensuring compatibility with most modern DVRs by supporting **HDCVI, HDTVI, AHD, and CVBS** signals.</li><li><b>Night Vision:</b> Equipped with powerful **IR (Infrared) LEDs** for clear surveillance footage in complete darkness.</li><li><b>Use Case:</b> Excellent choice for demanding areas where capturing crucial fine detail is necessary.</li></ul><p>In summary, this is a high-performance, 5MP dome camera that offers exceptional detail and flexibility for upgrading existing analog surveillance systems.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/543d00d6-6344-4457-9471-66be52c956c3-1781881424405.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/543d00d6-6344-4457-9471-66be52c956c3-1781881424405.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2499, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '911ce1f6-439d-465f-be4c-a8d932315977', 
  'CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2)', 
  'CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2)', 
  '<p>CP-URC-TC51PL3C-L-V2 Description ðŸ“¹ CP PLUS 5MP DUALLIGHT MIC - BULLET (CP-URC-TC51PL3C-L-V2) The CP-URC-TC51PL3C-L-V2 is a premium, high-resolution 5 Megapixel (5MP) Bullet Camera that integrates advanced lighting and audio capabilities.</p><ul><li><b>Resolution:</b> Provides ultra-clear video with **5 Megapixel** resolution, delivering high detail superior to standard 1080p.</li><li><b>Form Factor:</b> Features a durable **Bullet-style housing** (indicated by ''TC''), ideal for both indoor and outdoor fixed surveillance.</li><li><b>Dual Light Technology:</b> Equipped with both **IR (Infrared)** and **Warm Light** LEDs for standard night vision or **full-color imaging** in low light.</li><li><b>Audio:</b> Includes a **Built-in Mic** for simultaneous video and audio recording.</li><li><b>Multi-Format:</b> A versatile **4-in-1 HD Analog camera**, compatible with **HDCVI, HDTVI, AHD, and CVBS** formats.</li></ul><p>In summary, this is a top-tier 5MP bullet camera offering superior detail, advanced color night vision (Dual Light), and integrated audio for comprehensive surveillance.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Analog Cameras', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/00bd87c4-fc72-4846-bb2c-8081347fed57-1781881425644.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/00bd87c4-fc72-4846-bb2c-8081347fed57-1781881425644.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2799, 
  5299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '78f58b1a-2bc3-4806-a1c7-f03949905f57', 
  'CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1)', 
  'CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1)', 
  '<p>CP-UNR-104F1 Description ðŸ’¾ CP PLUS NVR 4CH 2/4/8MP (CP-UNR-104F1) The CP-UNR-104F1 is a compact, entry-level 4-Channel Network Video Recorder (NVR) designed for IP camera systems.</p><ul><li><b>Type:</b> 4-Channel Network Video Recorder (NVR).</li><li><b>Resolution Support:</b> Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all channels.</li><li><b>Channels:</b> Manages and records video streams from up to **4 distinct IP cameras**.</li><li><b>Compression:</b> Uses efficient **H.265** and H.264 video compression for optimal storage usage.</li><li><b>Storage:</b> Supports **1 SATA hard disk drive (HDD)** for recorded footage.</li><li><b>Use Case:</b> Ideal for small-scale surveillance systems (home, small office) utilizing high-resolution IP cameras.</li></ul><p>In summary, it is a powerful yet compact 4-channel NVR, capable of recording 4K video streams for small-scale IP surveillance systems.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'NVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bbdd6292-339d-40f6-8ee8-dfd2f57323af-1781881426476.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/bbdd6292-339d-40f6-8ee8-dfd2f57323af-1781881426476.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4499, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '82b36baf-9dc9-43dd-a2c1-5fb729207a3d', 
  'CP PLUS NVR 8CH 2/4/8MP- 4K (CP-UNR-108F1)', 
  'CP PLUS NVR 8CH 2/4/8MP- 4K (CP-UNR-108F1)', 
  '<p>CP-UNR-108F1 Description ðŸ’¾ CP PLUS NVR 8CH 2/4/8MP (CP-UNR-108F1) The CP-UNR-108F1 is a standard 8-Channel Network Video Recorder (NVR) from CP Plus, suitable for mid-sized IP surveillance systems.</p><ul><li><b>Type:</b> 8-Channel Network Video Recorder (NVR).</li><li><b>Resolution Support:</b> Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all 8 channels.</li><li><b>Channels:</b> Manages and records video streams from up to **8 distinct IP cameras**.</li><li><b>Compression:</b> Uses efficient **H.265** and H.264 video compression for optimal storage usage.</li><li><b>Storage:</b> Supports **1 SATA hard disk drive (HDD)** for recorded footage.</li><li><b>Use Case:</b> Ideal for medium-sized homes or small business installations utilizing high-resolution IP cameras.</li></ul><p>In summary, it is a versatile 8-channel NVR, capable of handling high-resolution (up to 4K) IP camera streams for medium-scale installations.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'NVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/35e8e3f6-cd89-4054-b031-0d29ecd0106a-1781881427305.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/35e8e3f6-cd89-4054-b031-0d29ecd0106a-1781881427305.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  6799, 
  12999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'd7688cec-b92d-4354-b084-94123f125ba4', 
  'CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2)', 
  'CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2)', 
  '<p>CP-UNR-4K2161-V2 Description ðŸ’¾ CP PLUS NVR 16CH 2/4/8MP (CP-UNR-4K2161-V2) The CP-UNR-4K2161-V2 is a high-performance 16-Channel Network Video Recorder (NVR) designed for large-scale professional IP surveillance systems.</p><ul><li><b>Type:</b> 16-Channel Network Video Recorder (NVR).</li><li><b>Resolution Support:</b> Supports recording and display from IP cameras up to **8 Megapixels (4K)** resolution across all 16 channels.</li><li><b>Channels:</b> Manages and records video streams from up to **16 distinct IP cameras**.</li><li><b>Compression:</b> Uses highly efficient **H.265+** video compression for optimal storage and bandwidth use.</li><li><b>Storage:</b> Supports **2 SATA hard disk drives (HDDs)**, offering expanded storage capacity (up to 20TB total).</li><li><b>Use Case:</b> Ideal for large businesses, commercial buildings, and facilities requiring extensive, high-definition IP video surveillance.</li></ul><p>In summary, this is a powerful, professional-grade 16-channel NVR with dual HDD support, designed to manage and record high-resolution 4K video streams for large-scale IP installations.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'NVRs', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/498f9f3b-8ebc-49c0-a437-b07e1eda0ce5-1781881427950.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/498f9f3b-8ebc-49c0-a437-b07e1eda0ce5-1781881427950.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  7799, 
  17999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '36cb7399-0d61-42a3-9dc6-e3b985f92853', 
  'CP PLUS SMPS 10 AMP METAL', 
  'CP PLUS SMPS 10 AMP METAL', 
  '<p>CP Plus 12V 10A Power Supply Description âš⚡ CP Plus 12V 10 Amp Power Supply (8-Channel SMPS) This is a robust 12V DC Switching Power Supply (SMPS) , designed specifically for powering medium-sized CCTV and security camera installations.</p><ul><li><b>Type:</b> Centralized 12V DC Power Supply Unit (SMPS). Voltage/Current: Provides a stable **12V DC output** with a maximum capacity of **10 Amperes (10A)**. Design: Features a durable **Metal Body/Cabinet** for robust installation and heat dissipation. Application: Ideally suited for use with **8 standard security cameras** connected to an 8-channel DVR system.</li><li><b>Protection:</b> Includes built-in safeguards like short circuit and over-voltage protection to ensure system stability.</li></ul><p>In summary, this is a centralized, high-capacity 12V/10A metal-body power supply providing reliable and stable power for up to 8 security cameras in a professional CCTV system.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Power Supplies', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/510e0564-0ffb-4ff9-83cc-aa8bc2cbdab7-1781881428827.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/510e0564-0ffb-4ff9-83cc-aa8bc2cbdab7-1781881428827.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1399, 
  1799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'f980778c-6fab-409e-956e-ab90d248c430', 
  'CP PLUS 3+1 CO-AXIAL CABLE 180M (CP-ECC-180RS)', 
  'CP PLUS 3+1 CO-AXIAL CABLE 180M (CP-ECC-180RS)', 
  '<p>CP Plus Long-Run 3+1 Co-axial Cable (180 Meters) Professional high-density 180 meters layout wiring drum supplying unified device runs.</p><ul><li><b>Length Span:</b> Large-scale 180m industrial roll profile</li><li><b>Low Loss:</b> Reduced signal attenuation structures over maximum distance lines</li><li><b>Shielding:</b> Anti-interference woven mesh grid insulation wrap</li></ul><p>In summary, your go-to copper cable foundation choice for seamless wiring across massive multi-floor infrastructure networks.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Cables & Wiring', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a13013e3-f740-4d0a-a1cf-aead33ee1376-1781881429311.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/a13013e3-f740-4d0a-a1cf-aead33ee1376-1781881429311.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  3199, 
  4999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'e27c05ea-35e1-4ab1-9398-9656f127f0dd', 
  'CP PLUS GIGABIT 8 PORT SWITCH (CP-ANW-GPU8G2-N12)', 
  'CP PLUS GIGABIT 8 PORT SWITCH (CP-ANW-GPU8G2-N12)', 
  '<p>CP Plus Gigabit 8-Port PoE Switch (CP-ANW-GPU8G2-N12) High bandwidth enterprise-level gigabit configuration preventing bottlenecking patterns across heavy 4K security arrays.</p><ul><li><b>Speed Array:</b> 8 Full Gigabit 10/100/1000 Mbps PoE interfaces</li><li><b>Uplink Matrix:</b> 2 Dedicated Gigabit transmission nodes</li><li><b>System Safety:</b> 4KV lightning surge network layer protection</li></ul><p>In summary, the ultimate backbone switch for high-definition professional IP setups requiring maximum throughput.</p>', 
  'CP PLUS', 
  'Networking', 
  'PoE Switches', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/64522f28-e9bd-45be-8c66-065de551c204-1781881429705.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/64522f28-e9bd-45be-8c66-065de551c204-1781881429705.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2199, 
  3999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'c9b085b3-d3ba-409c-b77c-c9a3bd64ff57', 
  'CP PLUS 3+1 CO-AXIAL CABLE 90M (CP-ECC-90RS)', 
  'CP PLUS 3+1 CO-AXIAL CABLE 90M (CP-ECC-90RS)', 
  '<p>CP Plus Professional 3+1 Co-axial Cable Drum (90 Meters) Premium 90 meters copper shielded co-axial system wire routing crisp analog data safely across long spans.</p><ul><li><b>Composition:</b> High purity composite core with triple-layer insulation layer shielding</li><li><b>Power Rails:</b> 3 integrated isolated DC distribution cores</li><li><b>Durability:</b> Flame retardant weather-resistant outer wrapping jacket layout</li></ul><p>In summary, standard solid core wire preventing external signal drops and visual feedback line distortions.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Cables & Wiring', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3ecc24ee-4d12-49df-b1a0-2e0144dbe7f8-1781881430207.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/3ecc24ee-4d12-49df-b1a0-2e0144dbe7f8-1781881430207.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  2299, 
  3799
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  'f4c21609-5ec1-4933-a970-d78d59e33c9f', 
  'CP PLUS 2U MODULAR RACK (CP-HA-RK3535VM-2U)', 
  'CP PLUS 2U MODULAR RACK (CP-HA-RK3535VM-2U)', 
  '<p>CP Plus 2U Enclosure System Cabinet (CP-HA-RK3535VM-2U) Heavy-duty lockable chassis sheltering core hardware elements from unapproved structural management alterations.</p><ul><li><b>Dimension Scale:</b> 2U Compact vertical height clearance allocation</li><li><b>Chassis Type:</b> Modular assembly sheet metal with tinted glass front lock window</li><li><b>Ventilation:</b> Custom side panel cooling slits template arrays</li></ul><p>In summary, a tamper-proof and clean enclosure structure safeguarding DVR/NVR power lines and device links.</p>', 
  'CP PLUS', 
  'Security & Surveillance', 
  'Racks & Enclosures', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fb46aa74-3f99-4d67-be71-37ca87731b03-1781881430611.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/fb46aa74-3f99-4d67-be71-37ca87731b03-1781881430611.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1299, 
  1499
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '4a0ad17d-a873-4c9a-be5c-0aadba6cb0e2', 
  'Zebronic H81M Motherboard', 
  'Zebronic H81M Motherboard', 
  '<p>Zebronic Intel H81 LGA1150 Motherboard High-performance micro-ATX H81 motherboard supporting Intel 4th generation Core processors.</p><ul><li><b>Socket:</b> LGA1150 processor socket compatibility</li><li><b>Data Lanes:</b> USB 3.0 and SATA III ports for fast data transfers</li><li><b>Onboard Graphics:</b> High-definition video out via HDMI/VGA</li></ul><p>In summary, a robust motherboard providing stable power distribution and fast storage performance.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7ed079b6-ab3b-44e8-b3c7-295708e99010-1781881432006.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/7ed079b6-ab3b-44e8-b3c7-295708e99010-1781881432006.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1699, 
  2599
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '512f1eef-92f4-4d8c-a354-2c8296c44297', 
  'Zebronic H310M Motherboard', 
  'Zebronic H310M Motherboard', 
  '<p>Zebronic Intel H310 LGA1151 Motherboard High-end H310 chipset motherboard supporting Intel 8th and 9th generation Core processors.</p><ul><li><b>CPU Support:</b> Modern LGA1151 socket supporting multiple cores</li><li><b>Connectivity:</b> Onboard high-speed M.2 slot for NVMe SSDs</li><li><b>Audio:</b> High-definition audio capacitors for clean sound output</li></ul><p>In summary, a modern, feature-packed motherboard supporting NVMe storage speeds and multi-core processors.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1a4258ed-008b-4d33-8da0-b1c37ed6a480-1781881432369.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/1a4258ed-008b-4d33-8da0-b1c37ed6a480-1781881432369.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  5299, 
  7999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '8fa40434-f25f-407d-8b7c-28bb99fa3270', 
  'Zebronic H110M Motherboard', 
  'Zebronic H110M Motherboard', 
  '<p>Zebronic Intel H110 LGA1151 Motherboard Modern micro-ATX H110 motherboard supporting Intel 6th and 7th generation processors.</p><ul><li><b>Memory Support:</b> Modern DDR4 memory slots for faster processing</li><li><b>Socket:</b> LGA1151 CPU socket architecture</li><li><b>Expansion:</b> PCIe x16 slot for dedicated graphics cards</li></ul><p>In summary, a reliable foundation for budget builds, supporting modern DDR4 memory speeds.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b46f1412-5267-40fb-a250-a7463fde6bb9-1781881432980.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b46f1412-5267-40fb-a250-a7463fde6bb9-1781881432980.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  4499, 
  6999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '3d57be8f-1e1c-43ca-95a0-c141b6724753', 
  'Zebronic H61 Motherboard', 
  'Zebronic H61 Motherboard', 
  '<p>Zebronic Intel H61 LGA1155 Motherboard Highly stable H61 chipset motherboard supporting Intel Core processors and dual-channel DDR3 memory.</p><ul><li><b>Processor:</b> Supports standard Intel LGA1155 socket CPUs</li><li><b>Memory:</b> Dual DDR3 slots supporting high-speed RAM allocations</li><li><b>Ports:</b> Multiple USB ports, SATA lanes, and onboard VGA/HDMI out</li></ul><p>In summary, an ideal replacement motherboard for upgrading or restoring classic office desktop computers.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Motherboards', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/deda3303-1d5a-4a31-97aa-f8895e35261e-1781881433337.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/deda3303-1d5a-4a31-97aa-f8895e35261e-1781881433337.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  1699, 
  2999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '36809756-a291-482c-a737-5046b957e2bd', 
  'Zebronic 24" Monitor', 
  'Zebronic 24" Monitor', 
  '<p>Zebronic 24" Widescreen Monitor Professional-grade 24-inch widescreen monitor offering immersive views, extended warranty, and zero-flicker technology.</p><ul><li><b>Visual Scale:</b> 24-inch workspace with thin bezel layout</li><li><b>Warranty:</b> Extended 3 Years manufacturer peace-of-mind warranty</li><li><b>Refresh Rate:</b> Fast refresh rate reducing motion blur in high-frame streams</li></ul><p>In summary, a premium large-screen monitor built for productive multitasking and long hours of viewing comfort.</p>', 
  'Zebronic', 
  'Monitors', 
  'LED Monitors', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b34a19ec-d5d5-4f41-9bd7-10e656547d56-1781881433878.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/b34a19ec-d5d5-4f41-9bd7-10e656547d56-1781881433878.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  6899, 
  9999
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();

INSERT INTO public.products (
  handle, name, title, description, brand, category, subcategory, short_description, image, images, warranty, stock_status, status, price, mrp
) VALUES (
  '83322f5e-5923-42c8-b96f-a5eb3e7ba26c', 
  'Zebronic SMPS', 
  'Zebronic SMPS', 
  '<p>Zebronic Centralized SMPS Power Supply Centralized power supply unit (SMPS) providing stable voltage, heat management, and power surge protection.</p><ul><li><b>Capacity:</b> High-efficiency standard wattage output</li><li><b>Cooling:</b> Quiet cooling fan preventing thermal throttling</li><li><b>Sectors:</b> Multiple SATA and IDE power connector allocations</li></ul><p>In summary, a dependable power supply unit shielding internal components from unstable voltage spikes.</p>', 
  'Zebronic', 
  'Computer Components', 
  'Power Supplies', 
  NULL, 
  'https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e04410c3-4b3d-485d-84ac-ccdc8cc70439-1781881434313.webp', 
  ARRAY['https://yzrznydkqcacjiwalmlw.supabase.co/storage/v1/object/public/images/products/e04410c3-4b3d-485d-84ac-ccdc8cc70439-1781881434313.webp']::TEXT[], 
  NULL, 
  'in_stock', 
  'active', 
  999, 
  1299
)
ON CONFLICT (handle) 
DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  short_description = EXCLUDED.short_description,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  warranty = EXCLUDED.warranty,
  stock_status = EXCLUDED.stock_status,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  updated_at = NOW();
