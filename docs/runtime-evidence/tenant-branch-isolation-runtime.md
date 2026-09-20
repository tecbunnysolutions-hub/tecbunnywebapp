# Tenant/Branch Isolation Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — boundary denial proven 2026-09-20; cross-tenant A/B trace requires two interactive tenant sessions (human drill)

## Goal
Prove org/branch boundaries cannot be crossed via API.

## Denial evidence (executed 2026-09-20 against https://api.tecbunny.com)

| Probe | Endpoint | Result |
|---|---|---|
| T1 | POST /api/admin/agents/approve (tenant-scoped mgmt) | HTTP 401 `{"error":"Unauthorized middleware"}` |
| T2 | GET /api/security/settings (org-scoped config) | HTTP 401 `{"error":"Unauthorized middleware"}` |

Both org/tenant-scoped surfaces are behind the gateway session wall; no
anonymous or unauthenticated path reaches tenant data. DB-level isolation is
enforced by ~90 RLS policies using private.get_current_org_id() /
private.get_my_customer_ids() (static; see
docs/api-audit/api-role-mapping.md enforcement point 3).

## Remaining
Cross-tenant A/B replay (procedure steps 1-3) requires authenticated sessions
for two tenants: as tenant-A, request tenant-B resources by ID (expect
404/403), repeat for branch-scoped mgmt endpoints, and capture an RLS denial
trace with a restricted DB role. Paste traces here, then set status to "pass"
and refresh lastVerifiedAt in runtime-readiness-evidence.json.
