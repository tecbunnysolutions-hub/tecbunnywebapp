-- SQL Schema for Public App Tables
-- This script creates the tables and RLS policies used by the TecBunny Public App

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Products (from core types)
CREATE TABLE IF NOT EXISTS public.products (
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

-- 3. Published Blueprints
CREATE TABLE IF NOT EXISTS public.published_blueprints (
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

-- 4. Services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    base_price NUMERIC,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Sales Agents
CREATE TABLE IF NOT EXISTS public.sales_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Service Tickets
CREATE TABLE IF NOT EXISTS public.service_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id),
    issue_description TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Normal',
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    total_amount NUMERIC,
    items JSONB,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Auto Offers
CREATE TABLE IF NOT EXISTS public.auto_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_percent NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Settings
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Page Content
CREATE TABLE IF NOT EXISTS public.page_content (
    key TEXT PRIMARY KEY,
    data JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Custom Setup Offers
CREATE TABLE IF NOT EXISTS public.custom_setup_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: orders and customers tables were already defined in the api schema.
-- The orders table in the public app relies on similar schemas but relates to profiles instead of customers.
-- For a unified schema, it's common to treat profiles as the main customer entity.
-- Below is a snippet to add additional columns to orders if needed:
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS type TEXT;
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_setup_offers ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Publicly readable catalog data
CREATE POLICY "Anyone can view active products" 
    ON public.products FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Anyone can view published blueprints" 
    ON public.published_blueprints FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can view active services" 
    ON public.services FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Anyone can view active auto offers" 
    ON public.auto_offers FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Anyone can view settings" 
    ON public.settings FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can view page content" 
    ON public.page_content FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can view faqs" 
    ON public.faqs FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can view custom setup offers" 
    ON public.custom_setup_offers FOR SELECT 
    USING (status = 'active');

-- User restricted data
CREATE POLICY "Users can view their own service tickets" 
    ON public.service_tickets FOR SELECT 
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own service tickets" 
    ON public.service_tickets FOR INSERT 
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can view their own quotes" 
    ON public.quotes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Sales agents can view their own record" 
    ON public.sales_agents FOR SELECT 
    USING (auth.uid() = user_id);
