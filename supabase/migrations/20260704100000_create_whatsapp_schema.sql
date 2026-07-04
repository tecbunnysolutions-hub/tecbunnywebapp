-- Migration: WhatsApp Omnichannel Schema

-- Create whatsapp_contacts table
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enum for conversation status
DO $$ BEGIN
    CREATE TYPE public.conversation_status AS ENUM ('bot', 'human_assigned', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create whatsapp_conversations table
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
    status public.conversation_status DEFAULT 'bot',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Assigned staff member
    location_data JSONB, -- Stores the extracted area/pin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enum for message sender type
DO $$ BEGIN
    CREATE TYPE public.message_sender_type AS ENUM ('customer', 'bot', 'agent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    sender_type public.message_sender_type NOT NULL,
    meta_message_id TEXT UNIQUE, -- ID from Meta WhatsApp API to prevent duplicates
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Note: Complex role-based policies (superadmin vs staff) are typically handled via the Next.js server actions using the service_role key,
-- or by inspecting auth.jwt() -> 'app_metadata' -> 'role'.
-- We will grant basic SELECT access for authenticated users, and rely on Next.js server logic for strict enforcement.
CREATE POLICY "Allow authenticated users to read contacts" ON public.whatsapp_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read conversations" ON public.whatsapp_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read messages" ON public.whatsapp_messages FOR SELECT TO authenticated USING (true);
