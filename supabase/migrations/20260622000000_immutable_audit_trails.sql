-- Make security audit logs immutable
-- Migration: 20260622000000_immutable_audit_trails.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.lock_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_log_mutation ON public.security_audit_log;
CREATE TRIGGER prevent_audit_log_mutation
BEFORE UPDATE OR DELETE ON public.security_audit_log
FOR EACH ROW EXECUTE FUNCTION public.lock_audit_logs();

COMMIT;
