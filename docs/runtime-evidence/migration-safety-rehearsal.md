# Migration Safety Rehearsal

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove migrations apply cleanly with timing and rollback behavior.

## Procedure
1. Apply supabase/migrations to a fresh shadow database (supabase db reset on a branch or local).
2. Record per-migration timing.
3. Verify idempotency by re-applying (all baseline statements are guarded — see repo memory notes).
4. Document failure-injection: interrupt one migration and verify recovery.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
