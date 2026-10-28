-- Require an atomic, service-only archive/restore operation with preserved snapshots.
-- Apply after 20261027000000_product_archival_columns.sql. No products are backfilled or deleted.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.product_archival_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (action IN ('archive', 'restore')),
  actor_id text NOT NULL,
  reason text,
  before_state jsonb NOT NULL,
  after_state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS product_archival_events_product_history
  ON public.product_archival_events(product_id, id DESC);
ALTER TABLE public.product_archival_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_archival_events FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.product_archival_events TO service_role;
REVOKE ALL ON SEQUENCE public.product_archival_events_id_seq FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.product_archival_events_id_seq TO service_role;

CREATE OR REPLACE FUNCTION public.archive_product_atomic(p_product_id uuid, p_actor_id text, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  before_row public.products%ROWTYPE;
  after_row public.products%ROWTYPE;
  actor_uuid uuid;
BEGIN
  IF p_actor_id IS NULL OR length(trim(p_actor_id)) = 0 OR length(p_actor_id) > 200
    OR p_reason IS NULL OR length(p_reason) > 500 THEN
    RAISE EXCEPTION 'Invalid archival actor or reason' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO before_row FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product not found' USING ERRCODE = 'P0002'; END IF;
  IF coalesce(before_row.is_deleted, false) OR before_row.deleted_at IS NOT NULL
    OR before_row.status::text IN ('archived', 'deleted') THEN
    RETURN to_jsonb(before_row) || jsonb_build_object('changed', false);
  END IF;
  IF p_actor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    actor_uuid := p_actor_id::uuid;
  END IF;
  UPDATE public.products SET is_deleted = true, status = 'archived',
    deleted_at = now(), deleted_by = actor_uuid, archived_at = now(),
    archived_by = actor_uuid, archive_reason = p_reason, updated_at = now()
    WHERE id = p_product_id RETURNING * INTO after_row;
  INSERT INTO public.product_archival_events(product_id, action, actor_id, reason, before_state, after_state)
    VALUES (p_product_id, 'archive', p_actor_id, p_reason, to_jsonb(before_row), to_jsonb(after_row));
  RETURN to_jsonb(after_row) || jsonb_build_object('changed', true);
END $$;

CREATE OR REPLACE FUNCTION public.restore_product_atomic(p_product_id uuid, p_actor_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  before_row public.products%ROWTYPE;
  after_row public.products%ROWTYPE;
  last_event public.product_archival_events%ROWTYPE;
  previous_status public.products.status%TYPE;
BEGIN
  IF p_actor_id IS NULL OR length(trim(p_actor_id)) = 0 OR length(p_actor_id) > 200 THEN
    RAISE EXCEPTION 'Invalid archival actor' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO before_row FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product not found' USING ERRCODE = 'P0002'; END IF;
  IF NOT coalesce(before_row.is_deleted, false) AND before_row.deleted_at IS NULL
    AND before_row.status::text NOT IN ('archived', 'deleted') THEN
    RETURN to_jsonb(before_row) || jsonb_build_object('changed', false);
  END IF;
  SELECT * INTO last_event FROM public.product_archival_events
    WHERE product_id = p_product_id ORDER BY id DESC LIMIT 1;
  IF NOT FOUND OR last_event.action <> 'archive' THEN
    RAISE EXCEPTION 'Archive history unavailable; reconcile this legacy product before restoring'
      USING ERRCODE = '23514';
  END IF;
  SELECT (jsonb_populate_record(NULL::public.products,
    jsonb_build_object('status', last_event.before_state->>'status'))).status INTO previous_status;
  IF previous_status IS NULL OR previous_status::text IN ('archived', 'deleted') THEN
    RAISE EXCEPTION 'Invalid archive history' USING ERRCODE = '23514';
  END IF;
  UPDATE public.products SET is_deleted = false, status = previous_status,
    deleted_at = NULL, deleted_by = NULL, archived_at = NULL, archived_by = NULL,
    archive_reason = NULL, updated_at = now()
    WHERE id = p_product_id RETURNING * INTO after_row;
  INSERT INTO public.product_archival_events(product_id, action, actor_id, before_state, after_state)
    VALUES (p_product_id, 'restore', p_actor_id, to_jsonb(before_row), to_jsonb(after_row));
  RETURN to_jsonb(after_row) || jsonb_build_object('changed', true);
END $$;

REVOKE EXECUTE ON FUNCTION public.archive_product_atomic(uuid,text,text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_product_atomic(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.archive_product_atomic(uuid,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.restore_product_atomic(uuid,text) TO service_role;

-- Existing single-argument legacy helpers are server operations, not browser RPCs.
DO $$ DECLARE f record; BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('soft_delete_product', 'restore_product')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.signature);
  END LOOP;
END $$;
COMMIT;
