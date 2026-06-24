-- Master additive, region-aware RBAC architecture.
-- Canonical staff roles:
-- superadmin > admin > (sales_manager > sales execution roles,
--                       service_manager > service_engineer)

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_area_assignments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, area_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_area_one_primary
  ON public.user_area_assignments(user_id)
  WHERE is_primary;
CREATE INDEX IF NOT EXISTS idx_user_area_area_user
  ON public.user_area_assignments(area_id, user_id);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id);
ALTER TABLE public.service_tickets ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id);
CREATE INDEX IF NOT EXISTS idx_orders_area_id ON public.orders(area_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_area_id ON public.service_tickets(area_id);

ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS tier SMALLINT;

CREATE TABLE IF NOT EXISTS public.role_inheritance (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  inherited_role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, inherited_role_id),
  CHECK (role_id <> inherited_role_id)
);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_area_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_inheritance ENABLE ROW LEVEL SECURITY;

INSERT INTO public.roles (name, description, tier, is_system) VALUES
  ('customer', 'Authenticated customer', 0, TRUE),
  ('sales_executive', 'Field sales operations', 1, TRUE),
  ('store_executive', 'Retail and point-of-sale operations', 1, TRUE),
  ('sales_agent', 'Independent commission-based sales partner', 1, TRUE),
  ('service_engineer', 'Assigned field service technician', 1, TRUE),
  ('sales_manager', 'Regional sales team manager', 2, TRUE),
  ('service_manager', 'Regional service team manager', 2, TRUE),
  ('admin', 'Day-to-day operations administrator', 3, TRUE),
  ('superadmin', 'System owner', 4, TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  tier = EXCLUDED.tier,
  is_system = TRUE;

WITH edges(role_name, inherited_name) AS (
  VALUES
    ('sales_executive', 'customer'),
    ('store_executive', 'customer'),
    ('sales_agent', 'customer'),
    ('service_engineer', 'customer'),
    ('sales_manager', 'sales_executive'),
    ('sales_manager', 'store_executive'),
    ('sales_manager', 'sales_agent'),
    ('service_manager', 'service_engineer'),
    ('admin', 'sales_manager'),
    ('admin', 'service_manager'),
    ('superadmin', 'admin')
)
INSERT INTO public.role_inheritance (role_id, inherited_role_id)
SELECT child.id, parent.id
FROM edges
JOIN public.roles child ON child.name = edges.role_name
JOIN public.roles parent ON parent.name = edges.inherited_name
ON CONFLICT DO NOTHING;

INSERT INTO public.permissions (resource, action, description) VALUES
  ('user', 'all', 'Full user and company governance'),
  ('system', 'config', 'Website, policy and infrastructure configuration'),
  ('ai', 'config', 'AI engine and prompt configuration'),
  ('catalog', 'all', 'Full product, brand and service catalog control'),
  ('orders', 'all', 'Unrestricted order and logistics control'),
  ('crm', 'all', 'Unrestricted CRM control'),
  ('reports', 'all', 'Unfiltered reporting and audit intelligence'),
  ('admin', 'users', 'Customer and lower-staff operations'),
  ('admin', 'inventory', 'Inventory tuning without catalog deletion'),
  ('admin', 'crm', 'Operational CRM management'),
  ('admin', 'orders', 'Core order operations'),
  ('admin', 'services', 'Service dispatch and lifecycle operations'),
  ('admin', 'reports', 'Standard operational reports'),
  ('team', 'read:area', 'Read assigned regional team performance'),
  ('orders', 'dispatch:area', 'Dispatch product orders in assigned areas'),
  ('leads', 'assign:area', 'Create and assign regional leads'),
  ('leads', 'write', 'Capture regional leads'),
  ('orders', 'create', 'Create product orders'),
  ('orders', 'process', 'Process storefront orders'),
  ('billing', 'quick', 'Use point-of-sale quick billing'),
  ('orders', 'create:delegate', 'Create orders for a customer'),
  ('commission', 'read', 'Read own commission dashboard'),
  ('service_orders', 'dispatch', 'Dispatch regional service orders'),
  ('engineers', 'assign', 'Assign engineers in the regional pool'),
  ('service_orders', 'update:own', 'Update own assigned service orders'),
  ('reports', 'submit', 'Submit own field reports')
ON CONFLICT (action, resource) DO UPDATE SET description = EXCLUDED.description;

WITH grants(role_name, resource, action) AS (
  VALUES
    ('sales_executive', 'leads', 'write'),
    ('sales_executive', 'orders', 'create'),
    ('store_executive', 'orders', 'process'),
    ('store_executive', 'billing', 'quick'),
    ('sales_agent', 'orders', 'create:delegate'),
    ('sales_agent', 'commission', 'read'),
    ('sales_manager', 'team', 'read:area'),
    ('sales_manager', 'orders', 'dispatch:area'),
    ('sales_manager', 'leads', 'assign:area'),
    ('service_engineer', 'service_orders', 'update:own'),
    ('service_engineer', 'reports', 'submit'),
    ('service_manager', 'team', 'read:area'),
    ('service_manager', 'service_orders', 'dispatch'),
    ('service_manager', 'engineers', 'assign'),
    ('admin', 'admin', 'users'),
    ('admin', 'admin', 'inventory'),
    ('admin', 'admin', 'crm'),
    ('admin', 'admin', 'orders'),
    ('admin', 'admin', 'services'),
    ('admin', 'admin', 'reports'),
    ('superadmin', 'user', 'all'),
    ('superadmin', 'system', 'config'),
    ('superadmin', 'ai', 'config'),
    ('superadmin', 'catalog', 'all'),
    ('superadmin', 'orders', 'all'),
    ('superadmin', 'crm', 'all'),
    ('superadmin', 'reports', 'all')
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM grants
JOIN public.roles roles ON roles.name = grants.role_name
JOIN public.permissions permissions
  ON permissions.resource = grants.resource
 AND permissions.action = grants.action
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  target_user_id UUID;
  effective_roles JSONB;
  effective_permissions JSONB;
BEGIN
  target_user_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END;

  WITH RECURSIVE inherited_roles AS (
    SELECT r.id, r.name
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = target_user_id
    UNION
    SELECT parent.id, parent.name
    FROM inherited_roles child
    JOIN public.role_inheritance ri ON ri.role_id = child.id
    JOIN public.roles parent ON parent.id = ri.inherited_role_id
  )
  SELECT COALESCE(jsonb_agg(DISTINCT name), '[]'::JSONB)
  INTO effective_roles
  FROM inherited_roles;

  WITH RECURSIVE inherited_roles AS (
    SELECT r.id
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = target_user_id
    UNION
    SELECT ri.inherited_role_id
    FROM inherited_roles child
    JOIN public.role_inheritance ri ON ri.role_id = child.id
  )
  SELECT COALESCE(jsonb_agg(DISTINCT p.resource || ':' || p.action), '[]'::JSONB)
  INTO effective_permissions
  FROM inherited_roles roles
  JOIN public.role_permissions rp ON rp.role_id = roles.id
  JOIN public.permissions p ON p.id = rp.permission_id;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::JSONB)
    || jsonb_build_object(
      'roles', effective_roles,
      'permissions', effective_permissions
    )
  WHERE id = target_user_id;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_claims() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.current_user_role_names()
RETURNS SETOF TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH RECURSIVE direct_roles AS (
    SELECT r.id, r.name
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
    UNION
    SELECT r.id, r.name
    FROM public.roles r
    WHERE r.name = COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '')
  ),
  inherited_roles AS (
    SELECT id, name FROM direct_roles
    UNION
    SELECT parent.id, parent.name
    FROM inherited_roles child
    JOIN public.role_inheritance ri ON ri.role_id = child.id
    JOIN public.roles parent ON parent.id = ri.inherited_role_id
  )
  SELECT DISTINCT name FROM inherited_roles;
$$;

CREATE OR REPLACE FUNCTION private.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM private.current_user_role_names() role_name
    WHERE role_name = required_role
  );
$$;

CREATE OR REPLACE FUNCTION private.has_direct_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND r.name = required_role
  )
  OR COALESCE((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = required_role;
$$;

CREATE OR REPLACE FUNCTION private.has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    private.has_role('superadmin')
    OR EXISTS (
      SELECT 1
      FROM private.current_user_role_names() role_name
      JOIN public.roles r ON r.name = role_name
      JOIN public.role_permissions rp ON rp.role_id = r.id
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE p.resource || ':' || p.action = required_permission
         OR p.action = 'all'
    );
$$;

CREATE OR REPLACE FUNCTION private.user_has_area(target_area UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT target_area IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.user_area_assignments assignment
    WHERE assignment.user_id = (SELECT auth.uid())
      AND assignment.area_id = target_area
  );
$$;

CREATE OR REPLACE FUNCTION private.is_region_scoped_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM private.current_user_role_names() role_name
    WHERE role_name IN (
      'sales_executive', 'store_executive', 'sales_agent',
      'service_engineer', 'sales_manager', 'service_manager'
    )
  )
  AND NOT private.has_role('admin')
  AND NOT private.has_role('superadmin');
$$;

REVOKE ALL ON FUNCTION private.current_user_role_names() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_role(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_direct_role(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.has_permission(TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.user_has_area(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_region_scoped_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_user_role_names() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_direct_role(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_permission(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.user_has_area(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_region_scoped_staff() TO authenticated, service_role;

DROP POLICY IF EXISTS "Allow read access to authenticated users on roles" ON public.roles;
DROP POLICY IF EXISTS "Allow read access to authenticated users on permissions" ON public.permissions;
DROP POLICY IF EXISTS "Allow read access to authenticated users on role_permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Allow read access to authenticated users on user_roles" ON public.user_roles;

CREATE POLICY rbac_catalog_authenticated_read ON public.roles
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY permission_catalog_authenticated_read ON public.permissions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY role_permissions_authenticated_read ON public.role_permissions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY role_inheritance_authenticated_read ON public.role_inheritance
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY user_roles_self_or_superadmin_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT private.has_role('superadmin')));
CREATE POLICY user_roles_superadmin_manage ON public.user_roles
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));

CREATE POLICY areas_staff_read ON public.areas
  FOR SELECT TO authenticated
  USING (
    (SELECT private.has_role('admin'))
    OR (SELECT private.has_role('superadmin'))
    OR (SELECT private.user_has_area(id))
  );
CREATE POLICY areas_superadmin_manage ON public.areas
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));
CREATE POLICY user_area_self_or_management_read ON public.user_area_assignments
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT private.has_role('admin'))
    OR (SELECT private.has_role('superadmin'))
  );
CREATE POLICY user_area_superadmin_manage ON public.user_area_assignments
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));

-- Restrictive policies are ANDed with existing business policies. They ensure
-- every region-scoped staff query carries an area match, even when another
-- permissive policy would otherwise expose rows across regions.
DROP POLICY IF EXISTS orders_region_sandbox ON public.orders;
CREATE POLICY orders_region_sandbox ON public.orders
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  )
  WITH CHECK (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  );

DROP POLICY IF EXISTS service_tickets_region_sandbox ON public.service_tickets;
CREATE POLICY service_tickets_region_sandbox ON public.service_tickets
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  )
  WITH CHECK (
    NOT (SELECT private.is_region_scoped_staff())
    OR (SELECT private.user_has_area(area_id))
  );

-- Service engineers may only update tickets assigned to their engineer record.
DROP POLICY IF EXISTS service_engineer_own_ticket_update ON public.service_tickets;
CREATE POLICY service_engineer_own_ticket_update ON public.service_tickets
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    NOT (SELECT private.has_direct_role('service_engineer'))
    OR assigned_engineer_id IN (
      SELECT id FROM public.service_engineers
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    NOT (SELECT private.has_direct_role('service_engineer'))
    OR assigned_engineer_id IN (
      SELECT id FROM public.service_engineers
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- The existing audit mutation trigger remains the final immutable boundary.
-- This policy makes the intended read boundary explicit.
DROP POLICY IF EXISTS security_audit_log_superadmin_only ON public.security_audit_log;
CREATE POLICY security_audit_log_superadmin_only ON public.security_audit_log
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role('superadmin')));
