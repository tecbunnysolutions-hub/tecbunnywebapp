# Secret Handling Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove secrets come from the secret store and rotation works.

## Procedure
1. Show deployment env config sources (Vercel env / Supabase vault) without printing values.
2. Rotate one non-critical secret (e.g. webhook verify token) and verify old value rejected, new value accepted.
3. Confirm no secrets in build logs or client bundles (grep .next output for known prefixes).

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
