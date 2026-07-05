-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. MGMT (Management / Tenant Base)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    plan_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. SUPERADMIN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- references auth.users(id)
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(255),
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. API
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    scopes JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    requests_count INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tenant_id, endpoint)
);

CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. WEBMAIL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.email_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email_address VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    mailbox_id UUID REFERENCES public.mailboxes(id) ON DELETE CASCADE,
    folder VARCHAR(50) DEFAULT 'inbox',
    subject TEXT,
    body TEXT,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. WABA (WhatsApp Business API)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.waba_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    phone_number_id VARCHAR(255) NOT NULL UNIQUE,
    waba_account_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waba_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waba_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    waba_message_id VARCHAR(255) UNIQUE,
    sender_number VARCHAR(50) NOT NULL,
    receiver_number VARCHAR(50) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) Enablement
-- ==============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waba_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waba_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waba_messages ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- Helper Function for Superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users 
        WHERE user_id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. MGMT Policies
CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()) OR is_superadmin()
    );

CREATE POLICY "Users can view users in their tenant" ON public.tenant_users
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()) OR is_superadmin()
    );

CREATE POLICY "Users can view their tenant subscriptions" ON public.subscriptions
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()) OR is_superadmin()
    );

-- 2. SUPERADMIN Policies
CREATE POLICY "Superadmins can manage system_config" ON public.system_config
    FOR ALL USING (is_superadmin());

CREATE POLICY "Superadmins can manage audit_logs" ON public.audit_logs
    FOR ALL USING (is_superadmin());

-- 3. Tenant Isolation Policies (API, WEBMAIL, WABA)
-- Helper function to simplify tenant isolation policies
CREATE OR REPLACE FUNCTION public.has_tenant_access(target_tenant_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users 
        WHERE user_id = auth.uid() AND tenant_id = target_tenant_id
    ) OR is_superadmin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API Policies
CREATE POLICY "Tenant isolation for api_keys" ON public.api_keys FOR ALL USING (has_tenant_access(tenant_id));
CREATE POLICY "Tenant isolation for api_usage" ON public.api_usage FOR ALL USING (has_tenant_access(tenant_id));
CREATE POLICY "Tenant isolation for webhooks" ON public.webhooks FOR ALL USING (has_tenant_access(tenant_id));

-- Webmail Policies
CREATE POLICY "Tenant isolation for email_domains" ON public.email_domains FOR ALL USING (has_tenant_access(tenant_id));
CREATE POLICY "Tenant isolation for mailboxes" ON public.mailboxes FOR ALL USING (has_tenant_access(tenant_id));
CREATE POLICY "Tenant isolation for email_messages" ON public.email_messages FOR ALL USING (has_tenant_access(tenant_id));

-- WABA Policies
CREATE POLICY "Tenant isolation for waba_credentials" ON public.waba_credentials FOR ALL USING (has_tenant_access(tenant_id));
CREATE POLICY "Tenant isolation for waba_templates" ON public.waba_templates FOR ALL USING (has_tenant_access(tenant_id));
CREATE POLICY "Tenant isolation for waba_messages" ON public.waba_messages FOR ALL USING (has_tenant_access(tenant_id));
