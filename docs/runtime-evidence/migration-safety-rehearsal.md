# Migration Safety Rehearsal

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — static safety verified 2026-09-20; live shadow-DB rehearsal still requires database credentials

## Goal
Prove migrations apply cleanly with timing and rollback behavior.

## Static safety verification (executed 2026-09-20)

- Migration set: supabase/migrations/*.sql — **19 migrations** present
  (20260803…20260905).
- Destructive-pattern scan across all 19: **no `DROP SCHEMA public CASCADE`,
  no `TRUNCATE auth.*`, no unguarded `DROP TABLE`** found. Clean.
- Rehearsal tooling present: scripts/validate-db-readiness.mjs enforces the
  migration set + guards the destructive-pattern contract in CI.

## Stale reference cleanup (2026-09-20)
The manifest previously referenced `supabase/manual_split/baseline_part1-4.sql`
and `database.reset.sql` — neither exists in the repo (they predate the
current seed-based reset). The authoritative reset path is
`npm run reset-db` → packages/infra/db/seed.ts (wipes domain tables in
dependency order, re-seeds orgs/branches/users/customers/products/orders/
tickets). Manifest evidence references were updated to drop the phantom files
and point at scripts/validate-db-readiness.mjs + supabase/migrations/ +
packages/infra/db/seed.ts.

## Remaining
Live rehearsal on a fresh shadow database (procedure steps 1-2): apply all 19
migrations, record per-migration timing, and capture failure/rollback behavior.
Requires database credentials — human drill. Paste the rehearsal output here,
then set status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
4. Document failure-injection: interrupt one migration and verify recovery.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
