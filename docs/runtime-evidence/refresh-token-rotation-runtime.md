# Refresh Token Rotation Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — rotation mechanism verified in code + rejection proven 2026-09-20; live rotation replay requires an interactive session

## Goal
Prove refresh token rotation + reuse revocation.

## Mechanism evidence (static, 2026-09-20)
- packages/core/src/session-manager.ts refreshes the Supabase session on a
  30-minute interval (access tokens expire after 1 hour) via
  supabase.auth.refreshSession() (lines ~64-85) and exposes
  forceRefreshSession() (line ~118). Token refresh is delegated to Supabase
  Auth, which issues rotating refresh tokens.
- Related rejection paths proven today (jwt-lifecycle-runtime.md):
  invalid-signature, expired-claim, and malformed bearer tokens all => 401.

## Remaining
Live rotation replay (procedure steps 1-2) requires an interactive session:
perform a refresh, confirm a NEW refresh token is issued, then replay the OLD
refresh token and confirm Supabase rotation-reuse rejection. Requires a real
Supabase session — human drill. Paste the auth responses here, then set status
to "pass" and refresh lastVerifiedAt in runtime-readiness-evidence.json.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
