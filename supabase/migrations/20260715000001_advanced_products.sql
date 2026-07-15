-- Migration: Advanced Product Engine & Pricing Engine
-- Extends the existing products table to support enterprise-grade features (variants, bundles, dynamic specifications)

ALTER TABLE public.products
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN bundle_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN specifications JSONB DEFAULT '{}'::jsonb,
ADD COLUMN related_product_ids UUID[] DEFAULT '{}',
ADD COLUMN upsell_product_ids UUID[] DEFAULT '{}',
ADD COLUMN cross_sell_product_ids UUID[] DEFAULT '{}',
ADD COLUMN warranty_details JSONB,
ADD COLUMN amc_details JSONB,
ADD COLUMN purchase_price NUMERIC,
ADD COLUMN margin NUMERIC,
ADD COLUMN commission_rate NUMERIC,
ADD COLUMN gst_rate NUMERIC,
ADD COLUMN barcode TEXT,
ADD COLUMN rfid_tag TEXT,
ADD COLUMN serial_tracking BOOLEAN DEFAULT false,
ADD COLUMN weight NUMERIC,
ADD COLUMN dimensions JSONB,
ADD COLUMN seo_metadata JSONB,
ADD COLUMN videos JSONB,
ADD COLUMN documents JSONB;

-- Advanced Pricing Engine Tables
CREATE TABLE public.customer_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    discount_percentage NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'BOGO', 'FLASH_SALE', 'BULK', 'BIRTHDAY'
    conditions JSONB, -- Defines the rules (min amount, specific products, customer group, etc)
    discount_value NUMERIC,
    is_percentage BOOLEAN DEFAULT true,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    max_usage INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.branch_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    location_in_store TEXT,
    last_restock_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(branch_id, product_id)
);

-- Enable RLS
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_inventory ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Superadmins can manage customer groups" ON public.customer_groups FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage discount rules" ON public.discount_rules FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage branch inventory" ON public.branch_inventory FOR ALL USING (public.is_superadmin());

CREATE POLICY "Anyone can view active discount rules" ON public.discount_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can view branch inventory" ON public.branch_inventory FOR SELECT USING (public.is_admin_or_staff());
