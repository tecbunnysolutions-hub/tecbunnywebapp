-- =============================================================================
-- Migration: Create feature_flags table & seed default flags (2026-07-25)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant privileges to standard Supabase roles
GRANT ALL ON public.feature_flags TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow public read access to feature flags
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feature_flags' AND policyname = 'Allow public read access to feature_flags'
    ) THEN
        CREATE POLICY "Allow public read access to feature_flags"
            ON public.feature_flags
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- Allow service role and authenticated users write access to feature flags
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feature_flags' AND policyname = 'Allow service role and authenticated write access'
    ) THEN
        CREATE POLICY "Allow service role and authenticated write access"
            ON public.feature_flags
            FOR ALL
            USING (
                auth.role() = 'service_role' OR
                auth.role() = 'authenticated'
            );
    END IF;
END $$;

-- Seed default feature flags idempotently
INSERT INTO public.feature_flags (key, enabled, description)
VALUES 
    ('checkout_enabled', true, 'Global switch to enable or suspend online checkout system'),
    ('new_payment_gateway', false, 'Enable new experimental payment gateway options')
ON CONFLICT (key) DO NOTHING;
