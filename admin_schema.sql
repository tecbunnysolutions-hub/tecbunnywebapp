-- SQL Schema for SuperAdmin and Staff (Mgmt) App Tables
-- This script creates the tables and RLS policies specific to internal management

-- 1. Contact Messages (Inquiries)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Security Audit Log
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    sku TEXT,
    quantity INTEGER DEFAULT 0,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Sales Agent Commissions
CREATE TABLE IF NOT EXISTS public.sales_agent_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.sales_agents(id),
    order_id TEXT REFERENCES public.orders(order_id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Purchases
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    cost NUMERIC NOT NULL,
    purchase_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agent_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is superadmin or staff
-- Assumes you have a 'role' column in public.profiles: 'superadmin', 'admin', 'staff', 'manager'
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


-- Contact Messages
CREATE POLICY "Staff can view and update contact messages" 
    ON public.contact_messages FOR ALL 
    USING (public.is_admin_or_staff());

CREATE POLICY "Anyone can insert contact messages" 
    ON public.contact_messages FOR INSERT 
    WITH CHECK (true);

-- Security Audit Log
CREATE POLICY "Superadmins can view security audit logs" 
    ON public.security_audit_log FOR SELECT 
    USING (public.is_superadmin());

CREATE POLICY "Superadmins can insert security audit logs" 
    ON public.security_audit_log FOR INSERT 
    WITH CHECK (public.is_superadmin());

-- Inventory
CREATE POLICY "Staff can manage inventory" 
    ON public.inventory FOR ALL 
    USING (public.is_admin_or_staff());

-- Sales Agent Commissions
CREATE POLICY "Staff can manage commissions" 
    ON public.sales_agent_commissions FOR ALL 
    USING (public.is_admin_or_staff());

CREATE POLICY "Agents can view their own commissions" 
    ON public.sales_agent_commissions FOR SELECT 
    USING (agent_id IN (SELECT id FROM public.sales_agents WHERE user_id = auth.uid()));

-- Purchases
CREATE POLICY "Staff can manage purchases" 
    ON public.purchases FOR ALL 
    USING (public.is_admin_or_staff());

-- Expenses
CREATE POLICY "Staff can manage expenses" 
    ON public.expenses FOR ALL 
    USING (public.is_admin_or_staff());

-- Note: The admin and staff apps also heavily use orders, products, profiles, and services.
-- To grant full access to these tables for admins, you would add policies like this to the core tables:
-- CREATE POLICY "Staff full access to orders" ON public.orders FOR ALL USING (public.is_admin_or_staff());
-- CREATE POLICY "Staff full access to products" ON public.products FOR ALL USING (public.is_admin_or_staff());
-- CREATE POLICY "Staff full access to profiles" ON public.profiles FOR ALL USING (public.is_admin_or_staff());
