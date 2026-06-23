-- Add contact message storage used by the admin/superadmin inbox.
-- This migration is additive and safe for existing deployments.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT,
  handled_by TEXT,
  handled_by_name TEXT,
  ip_address TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_messages_status_check CHECK (status IN ('New', 'In Progress', 'Resolved'))
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON public.contact_messages(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email
  ON public.contact_messages(email);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contact_messages_service_role_all ON public.contact_messages;
CREATE POLICY contact_messages_service_role_all
  ON public.contact_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_messages_staff_select ON public.contact_messages;
CREATE POLICY contact_messages_staff_select
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_staff_member());

DROP POLICY IF EXISTS contact_messages_staff_update ON public.contact_messages;
CREATE POLICY contact_messages_staff_update
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_staff_member())
  WITH CHECK (public.is_staff_member());

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
