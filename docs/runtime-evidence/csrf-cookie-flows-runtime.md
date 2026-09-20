# CSRF Cookie Flows Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove cookie-based mutations reject cross-site requests.

## Procedure
1. POST to a cookie-authenticated mutation with a cross-origin Origin header and no CSRF token — expect 403.
2. Confirm SameSite cookie attributes on session cookies (inspect Set-Cookie).
3. Repeat with valid same-origin flow — expect success.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
