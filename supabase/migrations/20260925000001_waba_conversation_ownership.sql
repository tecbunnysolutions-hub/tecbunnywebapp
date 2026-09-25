-- Service-only directory uses canonical profiles, not Prisma's model names.
CREATE OR REPLACE VIEW public.waba_staff_directory WITH (security_invoker = true) AS
SELECT p.id, p.email,
  coalesce(nullif(to_jsonb(p)->>'name', ''), nullif(to_jsonb(p)->>'full_name', ''), p.email::text) AS name,
  coalesce(nullif(to_jsonb(p)->>'phone_number', ''), nullif(to_jsonb(p)->>'phone', ''), nullif(to_jsonb(p)->>'mobile', '')) AS phone_number,
  nullif(to_jsonb(p)->>'company_id', '') AS organization_id,
  nullif(to_jsonb(p)->>'branch_id', '') AS branch_id,
  lower(to_jsonb(p)->>'role') AS role,
  to_jsonb(p)->'managed_pincodes' AS managed_pincodes
FROM public.profiles p;
REVOKE ALL ON public.waba_staff_directory FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.waba_staff_directory TO service_role;

ALTER TABLE public."Conversation" ADD COLUMN IF NOT EXISTS organization_id text;
ALTER TABLE public."Conversation" ADD COLUMN IF NOT EXISTS branch_id text;
UPDATE public."Conversation" c SET organization_id = u.organization_id, branch_id = u.branch_id
FROM public.waba_staff_directory u
WHERE c.assigned_to::text = u.id::text AND c.organization_id IS NULL AND u.organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS conversation_ownership_scope ON public."Conversation"(organization_id, branch_id);

CREATE OR REPLACE FUNCTION public.enforce_waba_conversation_owner()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_user record;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.organization_id IS NOT NULL AND (
    NEW.organization_id IS DISTINCT FROM OLD.organization_id OR NEW.branch_id IS DISTINCT FROM OLD.branch_id
  ) THEN RAISE EXCEPTION 'Conversation ownership is immutable'; END IF;
  IF NEW.assigned_to IS NOT NULL THEN
    SELECT * INTO v_user FROM public.waba_staff_directory WHERE id::text = NEW.assigned_to::text;
    IF NOT FOUND OR v_user.organization_id IS NULL THEN RAISE EXCEPTION 'Assignee has no organization'; END IF;
    IF NEW.organization_id IS NULL THEN
      NEW.organization_id := v_user.organization_id;
      NEW.branch_id := v_user.branch_id;
    ELSIF NEW.organization_id IS DISTINCT FROM v_user.organization_id
      OR (NEW.branch_id IS NOT NULL AND NEW.branch_id IS DISTINCT FROM v_user.branch_id) THEN
      RAISE EXCEPTION 'Assignee is outside conversation ownership';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_waba_conversation_owner ON public."Conversation";
CREATE TRIGGER enforce_waba_conversation_owner BEFORE INSERT OR UPDATE ON public."Conversation"
FOR EACH ROW EXECUTE FUNCTION public.enforce_waba_conversation_owner();
-- Existing unassigned conversations have no trustworthy tenant owner. They
-- remain visible only to global administrators until their first assignment.

-- Enforce the same boundary on browser/Realtime reads, even if older permissive
-- policies exist. All writes go through guarded server handlers.
CREATE OR REPLACE FUNCTION public.can_read_waba_owner(p_org text, p_branch text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (
      lower(to_jsonb(p)->>'role') IN ('admin', 'superadmin') OR (
        lower(to_jsonb(p)->>'role') IN ('manager', 'sales_manager', 'sales', 'sales-staff', 'sales-external', 'sales_executive', 'store_executive', 'sales_agent', 'marketing_executive', 'support', 'delivery', 'warehouse', 'hr', 'marketing_manager', 'service_manager', 'service_engineer', 'accounts')
        AND p_org IS NOT NULL AND p_org = nullif(to_jsonb(p)->>'company_id', '')
        AND (nullif(to_jsonb(p)->>'branch_id', '') IS NULL OR p_branch = to_jsonb(p)->>'branch_id')
      )
    )
  );
$$;
REVOKE ALL ON FUNCTION public.can_read_waba_owner(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_read_waba_owner(text, text) TO authenticated;
ALTER TABLE public."Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message" ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public."Conversation", public."Message" FROM anon, authenticated;
CREATE POLICY waba_owner_read ON public."Conversation" FOR SELECT TO authenticated
  USING (public.can_read_waba_owner(organization_id, branch_id));
CREATE POLICY waba_owner_read_boundary ON public."Conversation" AS RESTRICTIVE FOR SELECT TO authenticated
  USING (public.can_read_waba_owner(organization_id, branch_id));
CREATE POLICY waba_message_owner_read ON public."Message" FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public."Conversation" c WHERE c.sender_number = "Message".sender_number));
CREATE POLICY waba_message_owner_boundary ON public."Message" AS RESTRICTIVE FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public."Conversation" c WHERE c.sender_number = "Message".sender_number));
REVOKE SELECT ON public."Conversation", public."Message" FROM anon;
GRANT SELECT ON public."Conversation", public."Message" TO authenticated;
