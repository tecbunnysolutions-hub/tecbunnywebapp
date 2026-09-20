# RBAC Enforcement Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — role-denial proven 2026-09-20; role-allow trace still requires an interactive superadmin session (human drill)

## Goal
Prove role-denial and role-allow at runtime for staff/admin/superadmin boundaries.

## Role-denial evidence (executed 2026-09-20 against https://api.tecbunny.com)

Probe set per docs/api-audit/api-role-mapping.md enforcement points 1-2
(gateway middleware + tRPC protectedProcedure).

### P1: anonymous GET /api/security/audit-logs
```
GET https://api.tecbunny.com/api/security/audit-logs   (no session cookie, no bearer token)
HTTP 401
{"error":"Unauthorized middleware"}
```

### P2: forged bearer token
```
GET https://api.tecbunny.com/api/security/audit-logs
Authorization: Bearer invalid.forged.token
HTTP 401
{"error":"Unauthorized middleware"}
```

### P3: forged superadmin-session cookie
```
GET https://api.tecbunny.com/api/security/audit-logs
Cookie: superadmin-session=forged.token.value
HTTP 401
{"error":"Unauthorized middleware"}
```

### P4: anonymous superadmin-only tRPC mutation (projects.create)
Per packages/rpc/src/routers/projects.ts, projects.create requires
ctx.role === 'superadmin'; anonymous callers are rejected by protectedProcedure.
```
POST https://api.tecbunny.com/api/trpc/projects.create
Content-Type: application/json
{"json":{"name":"rbac-probe","explanation":"x","target_amount":1,"motive":"x","detailed_information":"x"}}
HTTP 401
{"error":{"json":{"message":"UNAUTHORIZED","code":-32001,"data":{"code":"UNAUTHORIZED","httpStatus":401,"path":"projects.create"}}}}
```

Result: 4/4 denial probes rejected (gateway 401 for forged/absent credentials;
tRPC UNAUTHORIZED for superadmin-only mutation without a role session).

## Remaining: role-allow trace
Steps 1-3 of the original procedure require a valid staff session and a valid
superadmin session. These credentials are interactive-only and were not
available to the automated drill. A human operator must:
1. Log in as superadmin, GET /api/security/audit-logs — expect HTTP 200.
2. Call projects.create with the superadmin session — expect success.
3. Paste the transcripts here, then set the check status to "pass" and refresh
   lastVerifiedAt in runtime-readiness-evidence.json.
