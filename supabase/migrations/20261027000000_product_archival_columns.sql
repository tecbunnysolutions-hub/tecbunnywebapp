-- Forward-only compatibility repair for the archival route's existing fields.
-- Do not fabricate historical archive dates or replace existing RPCs/audit logs.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid,
  ADD COLUMN IF NOT EXISTS archive_reason text;
COMMIT;
