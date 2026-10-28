-- Restore the server health probe's intended read permission only.
-- Preserve RLS, view security semantics and all browser-role privileges.
BEGIN;
SET LOCAL lock_timeout = '5s';
GRANT SELECT ON public.user_communication_preferences TO service_role;
COMMIT;
