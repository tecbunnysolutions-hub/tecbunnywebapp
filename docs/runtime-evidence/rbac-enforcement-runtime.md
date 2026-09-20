# RBAC Enforcement Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove role-denial and role-allow at runtime for staff/admin/superadmin boundaries.

## Procedure
1. Create a non-superadmin staff session and attempt GET https://api.tecbunny.com/api/security/audit-logs — expect 403.
2. Attempt a superadmin-only tRPC mutation (e.g. featureFlags.toggle) with a staff token — expect UNAUTHORIZED.
3. Repeat with a valid superadmin session — expect 200.
4. Record request IDs and responses here.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
