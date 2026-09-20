# JWT Lifecycle Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — rejection paths proven 2026-09-20; renewal path requires an interactive session (human drill)

## Goal
Runtime proof of token expiry, rejection, renewal.

## Rejection evidence (executed 2026-09-20 against https://api.tecbunny.com)

### J1: well-formed JWT, invalid signature
```
GET /api/security/audit-logs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6OTk5OTk5OTk5OX0.forgedsignature
HTTP 401  {"error":"Unauthorized middleware"}
```

### J2: expired-claim JWT (exp=1000000000, 2001-09-09)
```
GET /api/security/audit-logs
HTTP 401  {"error":"Unauthorized middleware"}
```
Note: signature verification precedes exp evaluation, so this probe proves
rejection of a non-authentic token carrying an expired claim. True
cryptographically-valid-but-expired token rejection requires a real
Supabase-issued token captured after expiry (human drill step 1).

### J3: malformed garbage token on user-owned endpoint
```
GET /api/user/gdpr/export
Authorization: Bearer not-a-jwt-at-all
HTTP 401  {"error":"Unauthorized middleware"}
```

Result: 3/3 rejection probes denied at the gateway (401), no information
leakage in error bodies.

## Remaining: renewal path
Refresh-token renewal (step 3) requires an interactive Supabase session.
A human operator must capture: pre-expiry access token, POST to the auth
refresh flow, new token with later exp, and acceptance of the new token on a
protected endpoint. Paste transcripts here, then set status to "pass" and
refresh lastVerifiedAt in runtime-readiness-evidence.json.
