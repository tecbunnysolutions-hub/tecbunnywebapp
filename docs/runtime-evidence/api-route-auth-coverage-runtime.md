# Runtime Evidence: API Route Auth Coverage

Generated: 2026-09-20 (runtime evidence regeneration)


## Result: PASS (verified 2026-09-20)

### Anonymous denial probe
Anonymous probe: GET https://api.tecbunny.com/api/security/audit-logs
Result: HTTP 401 (no session cookie, no bearer token) — gateway auth wall confirmed.

### Static inventory
- Endpoint inventory: docs/api-audit/inventory.json (378 endpoints)
- Endpoints with auth signal: 267; public/anon-intended: 111
- Role mapping: docs/api-audit/api-role-mapping.md
- tRPC gateway note: /api/trpc is intentionally gateway-public; per-procedure auth is
  enforced by tRPC protectedProcedure middleware (packages/rpc/src/trpc.ts), which
  independently verifies Supabase bearer tokens / superadmin cookie in createContext.
