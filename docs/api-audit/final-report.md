# API Audit — Final Report

Generated: 2026-09-20 (runtime evidence regeneration)


Source: docs/api-audit/inventory.json (378 endpoints scanned).

## Summary
- Total endpoints inventoried: 378
- Auth required (static signal): 267
- Public/anonymous-intended: 111
- Unmatched frontend calls: 0

## Endpoints by module
| Module | Endpoints |
|---|---|
| api | 256 |
| mgmt | 56 |
| superadmin | 25 |
| rpc | 19 |
| waba | 18 |
| public | 3 |
| webmail | 1 |

## Runtime confirmation (2026-09-20)
Anonymous probe: GET https://api.tecbunny.com/api/security/audit-logs
Result: HTTP 401 (no session cookie, no bearer token) — gateway auth wall confirmed.

## Known intentional public surfaces
- /api/trpc (multiplexed; per-procedure auth inside tRPC context)
- Public tRPC procedures: featureFlags.getAll, coupons.getAll/getByCode/getById,
  offers.getAll, projects.getAll, pageContent.get, contactMessages.submit
- WhatsApp webhook (HMAC / URL-token authenticated, not session authenticated)
