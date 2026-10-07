# Architecture

`apps/api` is the single backend. Every other app is UI-only and reads or writes data through the API.

## Layout

| Path | Purpose |
|------|---------|
| `apps/api` | Backend: `/api/v1/*` routes, services, webhooks |
| `apps/public`, `apps/mgmt`, `apps/superadmin`, `apps/waba` | UI apps (migrating off direct DB access) |
| `apps/extension` | Browser extension (build/lint/typecheck via `scripts/verify.mjs`) |
| `packages/contracts` | zod schemas and inferred types for every request/response (single source of truth) |
| `packages/api-client` | Typed fetch wrapper: base URL from `NEXT_PUBLIC_API_URL`, Bearer token, timeouts, error normalization, GET-only retry |
| `packages/db` | Prisma schema and client (`@tecbunny/db`), used by apps/api and WABA workers |
| `packages/database` | Supabase client factories (`createPublicClient` for cacheable public reads) |
| `packages/types`, `core`, `infra`, `ui`, `config`, `rpc` | Shared types, helpers, infra, UI, config |
| `quality/` | Launch/QA evidence, budgets, baselines and the DB-boundary baseline |

## Request flow

```
frontend -> @tecbunny/api-client -> /api/v1/* (route handler)
         -> apps/api/src/services/* (plain functions, no framework types)
         -> Supabase / Prisma
```

Route handlers stay thin: validate input with a `@tecbunny/contracts` schema, call a service, return the envelope via `finishV1` (`apps/api/src/lib/v1.ts`), which adds `x-request-id` and `Cache-Control`.

## Schema source of truth

Supabase migrations in `supabase/migrations` own the database schema. The Prisma schema in `packages/db/prisma` is a partial mapping (leads/WABA models) and must be introspected or updated from the migrations, never the other way around. Assumption: confirm this before changing either.

## Auth model

The API verifies the Supabase access token in `apps/api/src/proxy.ts`. Routes in `publicRoutes` (exact or prefix match) are anonymous. Roles are customer, staff and superadmin. Public cacheable reads use `createPublicClient()`, which never touches cookies, so responses can be cached at the CDN and via Next fetch `revalidate`/tags.

## Adding an endpoint

1. Add request/response schemas in `packages/contracts/src` and export them.
2. Add a service in `apps/api/src/services/<feature>.service.ts` plus a unit test with a fake query builder.
3. Add `apps/api/src/app/api/v1/<feature>/route.ts`. Validate, call the service, respond with `finishV1`. Add the route to `publicRoutes` in `proxy.ts` only if it is anonymous.
4. Add a method in `packages/api-client/src`, with `next: { revalidate, tags }` for cacheable reads.
5. Switch the UI to the client, delete its direct DB code, and run `node scripts/validate-api-boundary.mjs --update-baseline` so the baseline shrinks.

## Boundary enforcement

`scripts/validate-api-boundary.mjs` fails if any file outside `apps/api` gains a direct import of `@supabase/supabase-js`, `@prisma/client`, `@tecbunny/db` or `@tecbunny/database`. Existing offenders are listed in `quality/db-boundary-baseline.json` and shrink as features migrate. The target is an empty baseline.

## Migration status

Migrated: blog (list, detail, RSS, sitemap) and the product list (/products page, catalog.xml, sitemap products; product detail page via /v1/products/:id), home content, FAQs and services (/v1/content/*, /v1/services) and blueprints (/v1/blueprints). Authenticated: /v1/me/overview (profile page). Authenticated routes use `requireCaller(request, 'customer'|'staff'|'superadmin')` from `apps/api/src/lib/v1-auth.ts` (Bearer token or session cookie), respond `private, no-store`, and consumers build a client with `createAuthedApi` (sends the Supabase access token).
Remaining direct-DB files (see the baseline): public 11, mgmt 59, superadmin 20, waba 7.
