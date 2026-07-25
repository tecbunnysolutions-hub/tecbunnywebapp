-- ============================================================================
-- TECBUNNY MARKETPLACE & THIRD-PARTY SELLER ECOSYSTEM STANDALONE DATABASE DDL
-- Database Name: tecbunny_marketplace_db
-- Description: Dedicated persistence schema for Managed White-Label B2B2C Marketplace,
--              Seller Registration, Statutory KYC, Double-Entry Wallet Ledgers,
--              Automated Settlements Engine, WMS Pickup Requests, and Audit Telemetry.
-- ============================================================================

-- NOTE:
-- This script is intended to run inside an already selected database
-- (for example Supabase SQL Editor / migration runner).
-- Do not use psql meta-commands like `\c` here.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. SELLER IDENTITY & PROFILE MANAGEMENT
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mkt_sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PENDING_VERIFICATION, PENDING_APPROVAL, APPROVED, SUSPENDED, REJECTED, BLOCKED, INACTIVE
    kyc_status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, PENDING_REVIEW, VERIFICATION_IN_PROGRESS, APPROVED, REJECTED, CHANGES_REQUESTED
    rating NUMERIC(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_seller_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    logo_url TEXT,
    description TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. STATUTORY TAX & KYC VERIFICATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mkt_seller_business (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- PROPRIETORSHIP, PARTNERSHIP, LLP, PVT_LTD, PUBLIC_LTD, OPC
    gst_number VARCHAR(15) UNIQUE NOT NULL,
    gst_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    pan_number VARCHAR(10) UNIQUE NOT NULL,
    pan_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    incorporation_dt DATE,
    annual_turnover VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_seller_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- BUSINESS, BILLING, PICKUP
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    landmark TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_seller_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- GST_CERTIFICATE, PAN_CARD, CANCELLED_CHEQUE, AADHAAR, BUSINESS_REGISTRATION
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_seller_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    account_holder VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    penny_drop_status VARCHAR(50) DEFAULT 'PENDING',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_seller_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. FINANCIAL WALLET & DOUBLE-ENTRY LEDGER ACCOUNTING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mkt_seller_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    available_balance NUMERIC(15,2) DEFAULT 0.00,
    pending_balance NUMERIC(15,2) DEFAULT 0.00,
    hold_balance NUMERIC(15,2) DEFAULT 0.00,
    total_withdrawn NUMERIC(15,2) DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_seller_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    order_id UUID,
    settlement_id UUID,
    transaction_type VARCHAR(20) NOT NULL, -- CREDIT, DEBIT
    amount NUMERIC(15,2) NOT NULL,
    description TEXT NOT NULL,
    balance_after NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mkt_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    gross_amount NUMERIC(15,2) NOT NULL,
    net_settlement NUMERIC(15,2) NOT NULL,
    shipping_deduction NUMERIC(15,2) DEFAULT 0.00,
    commission_fee NUMERIC(15,2) DEFAULT 0.00,
    tds_deduction NUMERIC(15,2) DEFAULT 0.00,
    penalty_deduction NUMERIC(15,2) DEFAULT 0.00,
    gst_adjustment NUMERIC(15,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, GENERATED, UNDER_REVIEW, APPROVED, RELEASED, HELD
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mkt_settlement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID REFERENCES public.mkt_settlements(id) ON DELETE CASCADE,
    order_id UUID NOT NULL,
    order_item_id UUID NOT NULL,
    seller_purchase_price NUMERIC(15,2) NOT NULL,
    deductions NUMERIC(15,2) DEFAULT 0.00,
    net_amount NUMERIC(15,2) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. WAREHOUSE & LOGISTICS PICKUP MANAGEMENT
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.wms_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'PRIMARY', -- PRIMARY, REGIONAL, CITY, PICKUP_HUB, RETURN_CENTER
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 10000,
    manager_name VARCHAR(255),
    manager_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wms_pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    seller_id UUID REFERENCES public.mkt_sellers(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.wms_warehouses(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ASSIGNED, READY_FOR_PICKUP, PICKED_UP, DELIVERED_TO_WAREHOUSE, CANCELLED
    pickup_date TIMESTAMPTZ,
    otp_code VARCHAR(10),
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wms_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL,
    warehouse_id UUID REFERENCES public.wms_warehouses(id) ON DELETE CASCADE,
    inspector_id UUID,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PASSED, PASSED_WITH_REMARKS, FAILED
    remarks TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. IMMUTABLE AUDIT TRAIL LOGGING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sys_marketplace_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- SUPERADMIN, ADMIN, SELLER, WAREHOUSE, CUSTOMER
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address VARCHAR(50),
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES & PERFORMANCE OPTIMIZATION
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_mkt_sellers_status ON public.mkt_sellers(status);
CREATE INDEX IF NOT EXISTS idx_mkt_sellers_email ON public.mkt_sellers(email);
CREATE INDEX IF NOT EXISTS idx_mkt_seller_business_gst ON public.mkt_seller_business(gst_number);
CREATE INDEX IF NOT EXISTS idx_mkt_seller_business_pan ON public.mkt_seller_business(pan_number);
CREATE INDEX IF NOT EXISTS idx_mkt_seller_ledgers_seller ON public.mkt_seller_ledgers(seller_id);
CREATE INDEX IF NOT EXISTS idx_mkt_settlements_seller ON public.mkt_settlements(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_wms_pickup_seller ON public.wms_pickup_requests(seller_id, status);
