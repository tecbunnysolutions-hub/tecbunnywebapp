-- Correct older installations where Supabase default privileges granted service writes.
BEGIN;
SET LOCAL lock_timeout = '5s';
REVOKE ALL ON TABLE public.product_archival_events FROM service_role;
GRANT SELECT, INSERT ON TABLE public.product_archival_events TO service_role;
REVOKE ALL ON SEQUENCE public.product_archival_events_id_seq FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.product_archival_events_id_seq TO service_role;
COMMIT;
