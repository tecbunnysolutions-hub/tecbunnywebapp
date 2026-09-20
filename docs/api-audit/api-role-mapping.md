# API Role Mapping

Generated: 2026-09-20 (runtime evidence regeneration)


Derived from docs/api-audit/inventory.json on 2026-09-20.

## Role model
| Role | Source of truth | Typical surfaces |
|---|---|---|
| anon | no session | public pages, public tRPC procedures, webhooks |
| authenticated | Supabase Auth JWT | customer account/orders endpoints |
| staff/admin | Supabase role claims | apps/mgmt admin endpoints |
| superadmin | superadmin session cookie + is_superadmin() | apps/superadmin, /api/security/* |

## Enforcement points
1. Gateway middleware (apps/api/src/proxy.ts): Supabase session wall for /api/*
   except explicit publicRoutes.
2. tRPC protectedProcedure (packages/rpc/src/trpc.ts): per-procedure auth,
   ctx.role === 'superadmin' checks for destructive mutations.
3. Postgres RLS: ~90 policies using private.is_superadmin(),
   private.get_current_org_id(), private.get_my_customer_ids() (context helpers
   relocated to the non-PostgREST-exposed private schema 2026-07-23).

## Runtime spot check (2026-09-20)
Anonymous probe: GET https://api.tecbunny.com/api/security/audit-logs
Result: HTTP 401 (no session cookie, no bearer token) — gateway auth wall confirmed.
