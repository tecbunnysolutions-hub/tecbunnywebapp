-- Extend the existing contact inbox into the Superadmin inquiry pipeline.
-- Existing users and roles remain the source of truth for assignment eligibility.

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS inquiry_category TEXT NOT NULL DEFAULT 'Sales',
  ADD COLUMN IF NOT EXISTS origin_key TEXT NOT NULL DEFAULT 'general_contact',
  ADD COLUMN IF NOT EXISTS origin_path TEXT,
  ADD COLUMN IF NOT EXISTS form_identifier TEXT,
  ADD COLUMN IF NOT EXISTS referrer_url TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS origin_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Normal',
  ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_by_label TEXT,
  ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.contact_messages
SET inquiry_category = CASE
      WHEN LOWER(COALESCE(subject, '')) LIKE '%support%'
        OR LOWER(COALESCE(subject, '')) LIKE '%service%'
        OR LOWER(COALESCE(subject, '')) LIKE '%infrastructure%'
      THEN 'Services'
      ELSE 'Sales'
    END,
    origin_key = CASE
      WHEN LOWER(COALESCE(subject, '')) LIKE '%web development%' THEN 'web_development'
      WHEN LOWER(COALESCE(subject, '')) LIKE '%infrastructure%' THEN 'smart_infrastructure'
      WHEN LOWER(COALESCE(subject, '')) LIKE '%service%' THEN 'services_core_desk'
      ELSE 'general_contact'
    END
WHERE origin_key = 'general_contact';

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_status_check,
  ADD CONSTRAINT contact_messages_status_check
    CHECK (status IN ('New', 'Assigned', 'Contacted', 'In Progress', 'Resolved', 'Closed', 'Rejected')),
  DROP CONSTRAINT IF EXISTS contact_messages_inquiry_category_check,
  ADD CONSTRAINT contact_messages_inquiry_category_check
    CHECK (inquiry_category IN ('Sales', 'Services')),
  DROP CONSTRAINT IF EXISTS contact_messages_priority_check,
  ADD CONSTRAINT contact_messages_priority_check
    CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent'));

CREATE INDEX IF NOT EXISTS idx_contact_messages_pipeline
  ON public.contact_messages(inquiry_category, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assignee
  ON public.contact_messages(assigned_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_origin
  ON public.contact_messages(origin_key, created_at DESC);

CREATE TABLE IF NOT EXISTS public.inquiry_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  previous_assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT,
  resulting_status TEXT NOT NULL,
  assigned_by_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_assignment_history_inquiry
  ON public.inquiry_assignment_history(inquiry_id, created_at DESC);

ALTER TABLE public.inquiry_assignment_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inquiry_assignment_history FROM anon, authenticated;
GRANT SELECT, INSERT ON public.inquiry_assignment_history TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO service_role;

CREATE OR REPLACE FUNCTION public.superadmin_assign_inquiry(
  p_inquiry_id UUID,
  p_assigned_user_id UUID,
  p_assigned_by_label TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_inquiry public.contact_messages%ROWTYPE;
  v_assignee_role TEXT;
  v_assignee_name TEXT;
  v_assignee_email TEXT;
  v_resulting_status TEXT;
  v_changed BOOLEAN;
  v_previous_assigned_user_id UUID;
  v_previous_status TEXT;
BEGIN
  SELECT *
  INTO v_inquiry
  FROM public.contact_messages
  WHERE id = p_inquiry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inquiry not found';
  END IF;

  SELECT
    role,
    COALESCE(NULLIF(TRIM(full_name), ''), NULLIF(TRIM(name), ''), email),
    email
  INTO v_assignee_role, v_assignee_name, v_assignee_email
  FROM public.profiles
  WHERE id = p_assigned_user_id
    AND is_active = TRUE;

  IF v_assignee_role IS NULL THEN
    RAISE EXCEPTION 'Selected assignee is not an active staff user';
  END IF;

  IF v_inquiry.inquiry_category = 'Sales'
    AND v_assignee_role NOT IN ('sales_manager', 'sales_executive', 'store_executive', 'sales_agent') THEN
    RAISE EXCEPTION 'Sales inquiries can only be assigned to Sales Team users';
  END IF;

  IF v_inquiry.inquiry_category = 'Services'
    AND v_assignee_role <> 'service_manager' THEN
    RAISE EXCEPTION 'Services inquiries can only be assigned to Service Manager users';
  END IF;

  v_changed := v_inquiry.assigned_user_id IS DISTINCT FROM p_assigned_user_id;
  v_previous_assigned_user_id := v_inquiry.assigned_user_id;
  v_previous_status := v_inquiry.status;
  v_resulting_status := CASE
    WHEN v_inquiry.status = 'New' THEN 'Assigned'
    ELSE v_inquiry.status
  END;

  UPDATE public.contact_messages
  SET assigned_user_id = p_assigned_user_id,
      assigned_at = CASE WHEN v_changed THEN NOW() ELSE assigned_at END,
      assigned_by_label = NULLIF(TRIM(p_assigned_by_label), ''),
      handled_by = p_assigned_user_id::TEXT,
      handled_by_name = v_assignee_name,
      status = v_resulting_status,
      last_activity_at = NOW()
  WHERE id = p_inquiry_id
  RETURNING * INTO v_inquiry;

  IF v_changed THEN
    INSERT INTO public.inquiry_assignment_history (
      inquiry_id,
      previous_assigned_user_id,
      assigned_user_id,
      previous_status,
      resulting_status,
      assigned_by_label
    ) VALUES (
      p_inquiry_id,
      v_previous_assigned_user_id,
      p_assigned_user_id,
      v_previous_status,
      v_resulting_status,
      COALESCE(NULLIF(TRIM(p_assigned_by_label), ''), 'Superadmin')
    );
  END IF;

  RETURN jsonb_build_object(
    'changed', v_changed,
    'inquiry', to_jsonb(v_inquiry),
    'assignee', jsonb_build_object(
      'id', p_assigned_user_id,
      'name', v_assignee_name,
      'email', v_assignee_email,
      'role', v_assignee_role
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.superadmin_assign_inquiry(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.superadmin_assign_inquiry(UUID, UUID, TEXT)
  TO service_role;

NOTIFY pgrst, 'reload schema';
