-- Migration: Superadmin OS Core (Organizations, Branches, RBAC)

-- Organizations
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Branches
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles (Dynamic RBAC)
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL for global/system roles
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Permissions
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(module, action)
);

-- Role Permissions Mapping
CREATE TABLE public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

-- Add relations to profiles
ALTER TABLE public.profiles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
ADD COLUMN role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Superadmin has full access, others will be scoped later)
CREATE POLICY "Superadmins can manage organizations" ON public.organizations FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage branches" ON public.branches FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage roles" ON public.roles FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage permissions" ON public.permissions FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_superadmin());

-- Users can view their own organization, branch, and role
CREATE POLICY "Users can view their organization" ON public.organizations FOR SELECT USING (id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view their branch" ON public.branches FOR SELECT USING (id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view their role" ON public.roles FOR SELECT USING (id = (SELECT role_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view their role permissions" ON public.role_permissions FOR SELECT USING (role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);
