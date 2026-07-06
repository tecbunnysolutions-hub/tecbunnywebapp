-- SQL Schema for API App Tables
-- This script creates the core tables and RLS policies used by the TecBunny API

-- 1. Tenants
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Webhook Events
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    source TEXT NOT NULL,
    payload JSONB,
    error TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Webhook Stats
CREATE TABLE IF NOT EXISTS public.webhook_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    avg_processing_time NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(date, event_type, status)
);

-- 4. Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    payment_id TEXT,
    payment_method TEXT,
    payment_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Pending',
    items JSONB,
    used_free_installation BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT UNIQUE NOT NULL,
    order_id TEXT REFERENCES public.orders(order_id),
    customer_phone TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT,
    status TEXT NOT NULL,
    gateway_response JSONB,
    source TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Free Installation Slots
CREATE TABLE IF NOT EXISTS public.free_installation_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month DATE NOT NULL UNIQUE,
    total_slots INTEGER NOT NULL DEFAULT 10,
    remaining_slots INTEGER NOT NULL DEFAULT 10,
    confirmed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Customer Interactions
CREATE TABLE IF NOT EXISTS public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    interaction_type TEXT NOT NULL,
    direction TEXT NOT NULL,
    interaction_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Order Cancellations
CREATE TABLE IF NOT EXISTS public.order_cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(order_id),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_installation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cancellations ENABLE ROW LEVEL SECURITY;

-- Note: In a typical setup, the API routes use a service role key for webhooks,
-- which bypasses RLS. The following policies are examples for authenticated client access.

-- Customers: Users can read and update their own customer record
CREATE POLICY "Users can view their own customer record" 
    ON public.customers FOR SELECT 
    USING (auth.uid() = id OR phone = auth.jwt()->>'phone');

-- Orders: Users can read their own orders
CREATE POLICY "Users can view their own orders" 
    ON public.orders FOR SELECT 
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id OR phone = auth.jwt()->>'phone'));

-- Payments: Users can read their own payments
CREATE POLICY "Users can view their own payments" 
    ON public.payments FOR SELECT 
    USING (customer_phone = auth.jwt()->>'phone');

-- Order Cancellations: Users can read their own cancellations
CREATE POLICY "Users can view their own order cancellations" 
    ON public.order_cancellations FOR SELECT 
    USING (order_id IN (SELECT order_id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id OR phone = auth.jwt()->>'phone')));

-- Allow service role to bypass RLS for background processes (webhooks)
-- Service role bypasses RLS automatically, so explicit policies are not strictly needed for service_role keys.
