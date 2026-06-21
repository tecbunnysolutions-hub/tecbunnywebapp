-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(action, resource)
);
CREATE INDEX idx_permissions_resource ON public.permissions(resource);

-- Create role_permissions junction
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  tenant_id UUID, -- For future multi-tenant expansion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_user_tenant ON public.user_roles(user_id, tenant_id);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only superadmins/admins can view/edit these in production, but let's allow authenticated users to read roles/permissions
CREATE POLICY "Allow read access to authenticated users on roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users on permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users on role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to authenticated users on user_roles" ON public.user_roles FOR SELECT USING (auth.role() = 'authenticated');

-- Function to aggregate user claims
CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER AS $$
DECLARE
  _target_user_id uuid;
  _permissions jsonb;
  _roles jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _target_user_id := OLD.user_id;
  ELSE
    _target_user_id := NEW.user_id;
  END IF;

  SELECT jsonb_agg(DISTINCT r.name) INTO _roles
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = _target_user_id;

  SELECT jsonb_agg(DISTINCT p.resource || ':' || p.action) INTO _permissions
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  JOIN public.role_permissions rp ON r.id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _target_user_id;

  UPDATE auth.users
  SET raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'roles', coalesce(_roles, '[]'::jsonb), 
      'permissions', coalesce(_permissions, '[]'::jsonb)
    )
  WHERE id = _target_user_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
CREATE TRIGGER on_user_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

-- Optional: Seed default roles to match their existing system
INSERT INTO public.roles (name, description) VALUES
('superadmin', 'System Super Administrator'),
('admin', 'Administrator'),
('manager', 'Manager'),
('accounts', 'Accounts Manager'),
('sales', 'Sales Representative'),
('sales-staff', 'Sales Staff'),
('sales-external', 'External Sales'),
('service_engineer', 'Service Engineer'),
('customer', 'Customer')
ON CONFLICT (name) DO NOTHING;
