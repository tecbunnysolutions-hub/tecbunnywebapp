-- =========================================================================================
-- FINAL CONSOLIDATED SQL SCHEMA FOR TECBUNNY
-- This script contains all tables, functions, and RLS policies for:
-- API, Public, Superadmin, Staff (Mgmt), and WABA apps.
-- Ensure that you run this in your Supabase SQL Editor.
-- =========================================================================================

-- ==========================================
-- 1. INDEPENDENT TABLES (No Foreign Keys)
-- ==========================================

-- Profiles
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers (Used heavily by webhooks)
DROP TABLE IF EXISTS public.customers CASCADE;
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
DROP TABLE IF EXISTS public.products CASCADE;
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    name TEXT,
    description TEXT,
    price NUMERIC,
    compare_at_price NUMERIC,
    status TEXT DEFAULT 'active',
    popularity INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    images JSONB,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenants
DROP TABLE IF EXISTS public.tenants CASCADE;
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Events
DROP TABLE IF EXISTS public.webhook_events CASCADE;
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE,
    event_type TEXT NOT NULL,
    source TEXT NOT NULL,
    payload JSONB,
    processed BOOLEAN DEFAULT false,
    status TEXT,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Stats (Aggregated View)
DROP VIEW IF EXISTS public.webhook_stats CASCADE;
CREATE OR REPLACE VIEW public.webhook_stats AS
SELECT 
    DATE(created_at) AS date,
    event_type,
    status,
    COUNT(*) AS count,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) AS avg_processing_time
FROM public.webhook_events
GROUP BY DATE(created_at), event_type, status;

-- Free Installation Slots
DROP TABLE IF EXISTS public.free_installation_slots CASCADE;
CREATE TABLE public.free_installation_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month DATE NOT NULL UNIQUE,
    total_slots INTEGER NOT NULL DEFAULT 10,
    remaining_slots INTEGER NOT NULL DEFAULT 10,
    confirmed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto Offers
DROP TABLE IF EXISTS public.auto_offers CASCADE;
CREATE TABLE public.auto_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_percent NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings
-- Settings
DROP TABLE IF EXISTS public.settings CASCADE;
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Page Content
DROP TABLE IF EXISTS public.page_content CASCADE;
CREATE TABLE public.page_content (
    key TEXT PRIMARY KEY,
    data JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FAQs
DROP TABLE IF EXISTS public.faqs CASCADE;
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom Setup Offers
DROP TABLE IF EXISTS public.custom_setup_offers CASCADE;
CREATE TABLE public.custom_setup_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Published Blueprints
DROP TABLE IF EXISTS public.published_blueprints CASCADE;
CREATE TABLE public.published_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT,
    components JSONB,
    config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services
DROP TABLE IF EXISTS public.services CASCADE;
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    base_price NUMERIC,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact Messages
DROP TABLE IF EXISTS public.contact_messages CASCADE;
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Audit Log
DROP TABLE IF EXISTS public.security_audit_log CASCADE;
CREATE TABLE public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses
DROP TABLE IF EXISTS public.expenses CASCADE;
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WABA: User
DROP TABLE IF EXISTS public."User" CASCADE;
CREATE TABLE public."User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'agent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WABA: Conversation
DROP TABLE IF EXISTS public."Conversation" CASCADE;
CREATE TABLE public."Conversation" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_number TEXT UNIQUE NOT NULL,
    contact_name TEXT,
    address TEXT,
    pincode TEXT,
    active_flow TEXT,
    ai_active BOOLEAN DEFAULT true,
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PROCESSING',
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_interaction_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WABA: Template
DROP TABLE IF EXISTS public."Template" CASCADE;
CREATE TABLE public."Template" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WABA: FailedApiCall
DROP TABLE IF EXISTS public."FailedApiCall" CASCADE;
CREATE TABLE public."FailedApiCall" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT,
    payload JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. LEVEL 1 DEPENDENT TABLES 
-- ==========================================

-- Orders
DROP TABLE IF EXISTS public.orders CASCADE;
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    type TEXT,
    total_amount NUMERIC,
    payment_id TEXT,
    payment_method TEXT,
    payment_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Pending',
    items JSONB,
    used_free_installation BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales Agents
DROP TABLE IF EXISTS public.sales_agents CASCADE;
CREATE TABLE public.sales_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Tickets
DROP TABLE IF EXISTS public.service_tickets CASCADE;
CREATE TABLE public.service_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id),
    issue_description TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Normal',
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotes
DROP TABLE IF EXISTS public.quotes CASCADE;
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    total_amount NUMERIC,
    items JSONB,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory
DROP TABLE IF EXISTS public.inventory CASCADE;
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    sku TEXT,
    quantity INTEGER DEFAULT 0,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchases
DROP TABLE IF EXISTS public.purchases CASCADE;
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    cost NUMERIC NOT NULL,
    purchase_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Interactions
DROP TABLE IF EXISTS public.customer_interactions CASCADE;
CREATE TABLE public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    interaction_type TEXT NOT NULL,
    direction TEXT NOT NULL,
    interaction_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WABA: Message
DROP TABLE IF EXISTS public."Message" CASCADE;
CREATE TABLE public."Message" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public."Conversation"(id) ON DELETE CASCADE,
    message_id TEXT UNIQUE, 
    sender_number TEXT NOT NULL,
    receiver_number TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'text', 
    status TEXT DEFAULT 'sent', 
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. LEVEL 2 DEPENDENT TABLES
-- ==========================================

-- Payments
DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments (
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

-- Order Cancellations
DROP TABLE IF EXISTS public.order_cancellations CASCADE;
CREATE TABLE public.order_cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(order_id),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales Agent Commissions
DROP TABLE IF EXISTS public.sales_agent_commissions CASCADE;
CREATE TABLE public.sales_agent_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.sales_agents(id),
    order_id TEXT REFERENCES public.orders(order_id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==========================================
-- 4. FUNCTIONS & HELPERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'staff', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_installation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_setup_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agent_commissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FailedApiCall" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin_or_staff());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin_or_staff());

-- Customers
CREATE POLICY "Users can view their own customer record" ON public.customers FOR SELECT USING (auth.uid() = id OR phone = auth.jwt()->>'phone' OR public.is_admin_or_staff());

-- Publicly readable catalog data
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (status = 'active' OR public.is_admin_or_staff());
CREATE POLICY "Anyone can view published blueprints" ON public.published_blueprints FOR SELECT USING (true);
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (status = 'active' OR public.is_admin_or_staff());
CREATE POLICY "Anyone can view active auto offers" ON public.auto_offers FOR SELECT USING (is_active = true OR public.is_admin_or_staff());
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone can view page content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Anyone can view active custom setup offers" ON public.custom_setup_offers FOR SELECT USING (status = 'active' OR public.is_admin_or_staff());

-- Orders & Payments
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id OR phone = auth.jwt()->>'phone')
    OR public.is_admin_or_staff()
);
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
    customer_phone = auth.jwt()->>'phone' OR public.is_admin_or_staff()
);
CREATE POLICY "Users can view their own order cancellations" ON public.order_cancellations FOR SELECT USING (
    order_id IN (SELECT order_id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE auth.uid() = id OR phone = auth.jwt()->>'phone'))
    OR public.is_admin_or_staff()
);

-- User restricted data
CREATE POLICY "Users can view their own service tickets" ON public.service_tickets FOR SELECT USING (auth.uid() = customer_id OR public.is_admin_or_staff());
CREATE POLICY "Users can insert their own service tickets" ON public.service_tickets FOR INSERT WITH CHECK (auth.uid() = customer_id OR public.is_admin_or_staff());
CREATE POLICY "Users can view their own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff());
CREATE POLICY "Sales agents can view their own record" ON public.sales_agents FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_staff());

-- Admin/Staff specific tables
CREATE POLICY "Staff can view and update contact messages" ON public.contact_messages FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Superadmins can view security audit logs" ON public.security_audit_log FOR SELECT USING (public.is_superadmin());
CREATE POLICY "Superadmins can insert security audit logs" ON public.security_audit_log FOR INSERT WITH CHECK (public.is_superadmin());

CREATE POLICY "Staff can manage inventory" ON public.inventory FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Staff can manage purchases" ON public.purchases FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Staff can manage expenses" ON public.expenses FOR ALL USING (public.is_admin_or_staff());

CREATE POLICY "Staff can manage commissions" ON public.sales_agent_commissions FOR ALL USING (public.is_admin_or_staff());
CREATE POLICY "Agents can view their own commissions" ON public.sales_agent_commissions FOR SELECT USING (agent_id IN (SELECT id FROM public.sales_agents WHERE user_id = auth.uid()) OR public.is_admin_or_staff());

-- WABA
CREATE POLICY "Agents can view all conversations" ON public."Conversation" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can view all messages" ON public."Message" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can view templates" ON public."Template" FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Agents can view users" ON public."User" FOR SELECT USING (auth.role() = 'authenticated');
