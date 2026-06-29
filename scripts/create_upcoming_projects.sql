-- DDL to create the public.upcoming_projects table and RLS policies

CREATE TABLE IF NOT EXISTS public.upcoming_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    explanation TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    amount_raised NUMERIC NOT NULL DEFAULT 0,
    motive TEXT NOT NULL,
    detailed_information TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pipeline',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_upcoming_projects_created_at ON public.upcoming_projects (created_at DESC);

-- Enable RLS
ALTER TABLE public.upcoming_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow idempotent runs)
DROP POLICY IF EXISTS "Allow public read access to upcoming projects" ON public.upcoming_projects;
DROP POLICY IF EXISTS "Superadmins can manage upcoming projects" ON public.upcoming_projects;

-- 1. Policy for SELECT: Allow anyone to read
CREATE POLICY "Allow public read access to upcoming projects"
ON public.upcoming_projects
FOR SELECT
USING (true);

-- 2. Policy for ALL (Write): Restrict to superadmins only
CREATE POLICY "Superadmins can manage upcoming projects"
ON public.upcoming_projects
FOR ALL
TO authenticated
USING (public.is_superadmin_user())
WITH CHECK (public.is_superadmin_user());

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS set_upcoming_projects_updated_at ON public.upcoming_projects;
CREATE TRIGGER set_upcoming_projects_updated_at
BEFORE UPDATE ON public.upcoming_projects
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
