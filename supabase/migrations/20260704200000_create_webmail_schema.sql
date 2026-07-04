-- Migration for Webmail System
-- Creates domains, accounts, and messages tables

CREATE TABLE IF NOT EXISTS public.webmail_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webmail_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES public.webmail_domains(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    storage_quota_bytes BIGINT DEFAULT 1073741824, -- 1GB default
    storage_used_bytes BIGINT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.webmail_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.webmail_accounts(id) ON DELETE CASCADE,
    folder TEXT NOT NULL DEFAULT 'inbox', -- inbox, sent, drafts, trash, spam
    from_name TEXT,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    is_read BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    message_id TEXT, -- external message-id header
    raw_headers JSONB,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_webmail_accounts_email ON public.webmail_accounts(email);
CREATE INDEX IF NOT EXISTS idx_webmail_messages_account_folder ON public.webmail_messages(account_id, folder);
CREATE INDEX IF NOT EXISTS idx_webmail_messages_received_at ON public.webmail_messages(received_at DESC);

-- Enable RLS (Default Deny for public/anon)
ALTER TABLE public.webmail_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webmail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webmail_messages ENABLE ROW LEVEL SECURITY;

-- Note: All access to these tables should be done via Next.js Server Components / API Routes using the Service Role Key
-- or a specialized server client since webmail users are not part of auth.users.
