-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table (Multi-tenant mapping)
-- Note: Assuming you might already have a users table or use auth.users, 
-- but this establishes the multi-tenant role mapping.
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id)
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 3. WABA Credentials
CREATE TABLE IF NOT EXISTS public.waba_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    phone_number_id VARCHAR(255) NOT NULL UNIQUE,
    waba_account_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    waba_message_id VARCHAR(255) UNIQUE,
    sender_number VARCHAR(50) NOT NULL,
    receiver_number VARCHAR(50) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waba_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Base RLS Policies
CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Tenant Isolation Policy for Messages" ON public.messages
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    );

CREATE POLICY "Tenant Isolation Policy for Credentials" ON public.waba_credentials
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    );
