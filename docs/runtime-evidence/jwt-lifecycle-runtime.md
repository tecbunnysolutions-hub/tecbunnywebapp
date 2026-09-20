# JWT Lifecycle Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Runtime proof of token expiry, rejection, renewal.

## Procedure
1. Capture an expired Supabase JWT and call a protected endpoint — expect 401.
2. Tamper a JWT signature — expect 401.
3. Use the refresh flow to obtain a new access token — expect 200 with new expiry.
4. Record timestamps showing expiry enforcement.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
