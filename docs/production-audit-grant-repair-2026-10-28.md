# Product archival audit permissions — executed and verified

## Execution record

The user explicitly approved this permission-only repair. It committed at
`2026-10-28T02:59:04.454Z` after all **18 effective-privilege assertions passed** inside
the transaction. The service role retains table SELECT/INSERT and sequence USAGE/SELECT;
table UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER, sequence UPDATE, and browser sequence
access are denied. Browser audit-table reads remain denied. No application rows,
function bodies or application configuration changed; no restart occurred.

The original ACLs and exact restoration GRANT statements were saved before the change
under `/var/backups/tecbunny/audit-grants-20261028T025854Z/` (directory 0700, files 0600).
The transaction checked that ACLs still matched that snapshot before changing them.
Installed archive/restore function sources match the reviewed candidate after CRLF/LF
normalization, and the audit table has no application triggers. An earlier preflight
stopped before writes because byte hashes differed by line endings; normalized source
comparison resolved that discrepancy without changing either function.

The exact permission SQL was executed directly. Supabase CLI migration-history
registration was not modified; reconcile that history before a later automated push.
The follow-up migration is repeatable and is tested against existing broad grants.

A pre-repair read-only production metadata check on 28 October found the expected
`product_archival_events` table and both service-only atomic archive/restore functions.
At that time the service role had SELECT, INSERT, UPDATE and DELETE on the audit table.
Browser execution of the two new functions is denied. The author/time of the live
schema changes is not established by this chat; no live migration was executed here.

The audit functions need SELECT and INSERT on their history table, plus USAGE/SELECT
on its identity sequence. They do not update, delete or truncate snapshots or reset
the sequence. Broad inherited Supabase defaults should not permit those operations.

## Exact approved change

Apply only `supabase/migrations/20261028000001_product_archival_audit_grants.sql`:

```sql
BEGIN;
SET LOCAL lock_timeout = '5s';
REVOKE ALL ON TABLE public.product_archival_events FROM service_role;
GRANT SELECT, INSERT ON TABLE public.product_archival_events TO service_role;
REVOKE ALL ON SEQUENCE public.product_archival_events_id_seq
  FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.product_archival_events_id_seq TO service_role;
COMMIT;
```

No product/order/audit rows, function bodies or application configuration change.
No service restarts are required. The isolated regression recreates the overly broad
default grants and verifies that archive/restore still work, history cannot be changed,
browser access remains denied, and repeat application preserves rows and history.

## Verification and rollback

Immediately before execution, save the current table/sequence ACLs and generated
GRANT statements for only the affected grantees to a restricted execution record.
Within the same transaction, verify effective privileges: service table SELECT/INSERT
true, UPDATE/DELETE/TRUNCATE false; service sequence USAGE/SELECT true, UPDATE false;
anonymous/authenticated sequence access false. Roll back the transaction if any
assertion fails. Do not call archive/restore on a production product to test permissions.

If a regression is discovered after commit, the owner can restore the captured grants
for the affected grantees, preserving every row. Reverting would restore the previous
overly broad permissions and must be recorded. This permission-only correction does
not repair the old deployed health/blog code, provide a database backup or clear the
release gate. Separate deployment/rehearsal requirements remain in the main runbook.
