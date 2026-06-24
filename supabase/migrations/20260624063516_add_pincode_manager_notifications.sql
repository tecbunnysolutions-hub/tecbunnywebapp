-- Exact pincode coverage for the existing regional RBAC model.
-- Notification routing is performed server-side with the service role.

CREATE TABLE IF NOT EXISTS public.area_pincodes (
  pincode TEXT PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT area_pincodes_valid_pincode CHECK (pincode ~ '^[1-9][0-9]{5}$')
);

CREATE INDEX IF NOT EXISTS idx_area_pincodes_area_active
  ON public.area_pincodes(area_id, is_active);

ALTER TABLE public.areas
  ADD COLUMN IF NOT EXISTS sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_areas_sales_manager ON public.areas(sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_areas_service_manager ON public.areas(service_manager_id);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_sales_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.service_tickets
  ADD COLUMN IF NOT EXISTS service_pincode TEXT,
  ADD COLUMN IF NOT EXISTS assigned_service_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_pincode ON public.orders(delivery_pincode);
CREATE INDEX IF NOT EXISTS idx_orders_sales_manager ON public.orders(assigned_sales_manager_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_manager ON public.orders(assigned_service_manager_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_service_pincode ON public.service_tickets(service_pincode);
CREATE INDEX IF NOT EXISTS idx_service_tickets_service_manager ON public.service_tickets(assigned_service_manager_id);

CREATE TABLE IF NOT EXISTS public.area_notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('order', 'service_ticket')),
  source_id UUID NOT NULL,
  notification_kind TEXT NOT NULL,
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pincode TEXT,
  routing_status TEXT NOT NULL CHECK (routing_status IN ('assigned', 'unassigned', 'failed')),
  recipients JSONB NOT NULL DEFAULT '[]'::JSONB,
  provider_message_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_type, source_id, notification_kind)
);

CREATE INDEX IF NOT EXISTS idx_area_notification_area_created
  ON public.area_notification_deliveries(area_id, created_at DESC);

ALTER TABLE public.area_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS area_pincodes_staff_read ON public.area_pincodes;
CREATE POLICY area_pincodes_staff_read ON public.area_pincodes
  FOR SELECT TO authenticated
  USING (
    (SELECT private.has_role('admin'))
    OR (SELECT private.has_role('superadmin'))
    OR (SELECT private.user_has_area(area_id))
  );

DROP POLICY IF EXISTS area_pincodes_superadmin_manage ON public.area_pincodes;
CREATE POLICY area_pincodes_superadmin_manage ON public.area_pincodes
  FOR ALL TO authenticated
  USING ((SELECT private.has_role('superadmin')))
  WITH CHECK ((SELECT private.has_role('superadmin')));

DROP POLICY IF EXISTS area_notification_superadmin_read ON public.area_notification_deliveries;
CREATE POLICY area_notification_superadmin_read ON public.area_notification_deliveries
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role('superadmin')));

-- New Supabase projects require explicit Data API grants.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_pincodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_notification_deliveries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.area_pincodes TO authenticated;
GRANT SELECT ON public.area_notification_deliveries TO authenticated;
