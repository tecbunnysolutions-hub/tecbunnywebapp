# Rollback Rehearsal

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove deployment rollback works end-to-end.

## Procedure
1. Deploy a known-bad (or marker) release to staging.
2. Execute the platform rollback (Vercel instant rollback / previous container tag).
3. Verify the previous version serves traffic; record total rollback time (RTO).
4. Include DB compatibility note: migrations are additive/idempotent so app rollback is safe.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
