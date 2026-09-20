# Ownership Checks Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — forbidden-path denial proven 2026-09-20; user-A-vs-user-B trace requires two interactive sessions (human drill)

## Goal
Prove users cannot access other users' owned resources.

## Forbidden-path evidence (executed 2026-09-20 against https://api.tecbunny.com)

| Probe | Endpoint | Result |
|---|---|---|
| O1 | GET /api/user/gdpr/export (user-owned read) — anonymous | HTTP 401 `{"error":"Unauthorized middleware"}` |
| O2 | POST /api/user/gdpr/delete (user-owned destructive mutation) — anonymous | HTTP 401 `{"error":"Unauthorized middleware"}` |
| O3 | GET /api/user/gdpr/export — forged bearer JWT | HTTP 401 `{"error":"Unauthorized middleware"}` |

Includes the required destructive-mutation attempt (O2). No anonymous or
forged-credential path reaches user-owned data; per-user isolation within the
authenticated boundary is enforced by RLS via private.get_my_customer_ids()
(static; docs/api-audit/api-role-mapping.md enforcement point 3).

## Remaining
Authenticated user-A vs user-B replay: with two real customer sessions,
attempt cross-user reads/mutations on orders, addresses, and cart by ID
(expect 403/404 in every case). Paste traces here, then set status to "pass"
and refresh lastVerifiedAt in runtime-readiness-evidence.json.
