-- SQL Schema for WABA (WhatsApp Business API) App Tables
-- This script creates the tables and RLS policies specific to the WhatsApp integration

-- 1. User (Agents/Users in WABA context)
-- Note: This might map to public.profiles in other apps, but if WABA specifically queries 'User', we create it here.
CREATE TABLE IF NOT EXISTS public."User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'agent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Conversation
CREATE TABLE IF NOT EXISTS public."Conversation" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_number TEXT UNIQUE NOT NULL,
    contact_name TEXT,
    active_flow TEXT,
    ai_active BOOLEAN DEFAULT true,
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Message
CREATE TABLE IF NOT EXISTS public."Message" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public."Conversation"(id) ON DELETE CASCADE,
    message_id TEXT UNIQUE, -- WhatsApp message ID
    sender_number TEXT NOT NULL,
    receiver_number TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'text', -- text, image, document, template
    status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Template
CREATE TABLE IF NOT EXISTS public."Template" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FailedApiCall
CREATE TABLE IF NOT EXISTS public."FailedApiCall" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT,
    payload JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
-- You will need to run these manually in Supabase Storage or via SQL if enabled:
-- insert into storage.buckets (id, name, public) values ('whatsapp_media', 'whatsapp_media', true);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FailedApiCall" ENABLE ROW LEVEL SECURITY;

-- Note: The WABA app primarily runs server-side API routes that use a service_role key.
-- Service role keys bypass RLS automatically. 
-- However, for authenticated front-end agents viewing the dashboard:

CREATE POLICY "Agents can view all conversations" 
    ON public."Conversation" FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Agents can view all messages" 
    ON public."Message" FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Agents can view templates" 
    ON public."Template" FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Agents can view users" 
    ON public."User" FOR SELECT 
    USING (auth.role() = 'authenticated');
