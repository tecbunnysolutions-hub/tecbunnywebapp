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

Migrated: blog (list, detail, RSS, sitemap) and the product list (/products page, catalog.xml, sitemap products; product detail page via /v1/products/:id), home content, FAQs and services (/v1/content/*, /v1/services) and blueprints (/v1/blueprints). Authenticated: /v1/me/overview, /v1/me/profile, /v1/me/orders/:id (profile, sign-in redirect, coupon popup, payment pages); anonymous by order id (legacy behaviour, flagged): /v1/invoices/:orderId. Authenticated routes use `requireCaller(request, 'customer'|'staff'|'superadmin')` from `apps/api/src/lib/v1-auth.ts` (Bearer token or session cookie), respond `private, no-store`, and consumers build a client with `createAuthedApi` (sends the Supabase access token).
Remaining direct-DB files (see the baseline): public 11, mgmt 59, superadmin 20, waba 7.

ESLint (`eslint.config.mjs`) also enforces the boundary: `no-restricted-imports` errors on `@prisma/client`, `@tecbunny/db`, `@supabase/supabase-js` (type imports allowed) and `@tecbunny/database/{admin,server}` in every app except `apps/api`. Files in the baseline are downgraded to warnings until migrated.

## Validation runner

`node scripts/validate/run.mjs <group>` (groups: `architecture`, `product-ux`, `runtime`, `launch`, `all`; `npm run validate`, `validate:product-ux`, `validate:runtime`, `validate:launch`). TypeScript checks loop over every `apps/*` with a tsconfig. Individual `validate:*` scripts remain because CI calls them by name.

## Moved into the API

All mgmt `/api/admin/**` handlers and the superadmin handlers (`/api/superadmin/**`, permissions, branches, organizations) now live in `apps/api/src/app/api/**`; mgmt and superadmin forward `/api/*` to the API via rewrites, so URLs are unchanged. New v1 routes: `/v1/superadmin/command-center` and `/v1/superadmin/lead-command-center`.

## Not yet done

- mgmt UI: 21 files still do direct browser table CRUD (billing/stock RPCs, products, purchases, expenses, leads, tasks, calendar, AMC, tickets). `/v1/admin/orders` (staff, `createStaffApi` in `apps/mgmt/src/lib/api.ts`) replaced the order reads in history, online orders, invoice lookup and staff reports; the rest each need their own endpoint.
- waba (7 files): the app is kept; its workers need a deployment decision. The API already hosts the WhatsApp and payment/order webhooks with signature verification (`/api/webhook/whatsapp`, `/api/webhooks/*`); waba keeps a duplicate WhatsApp webhook.
- superadmin `api/health`, `roles`, `users`, `auth/extension` shadow API routes with different implementations at the same URLs, and `inquiries` re-exports superadmin-local handlers; merging them would change behaviour, so they stay until reconciled.
- `packages/ui` (`LoginDialog`, `InstantIdentity`) uses the browser Supabase auth client. Auth-only by design; removing it means proxying sign-in through the API, which is an auth-flow change.
- `next build` before/after route tables were not captured.

## Cache revalidation

Public reads are cached with tags (`products`, `blog`, `services`, `content`, `blueprints`). Mutating API handlers for products, blog, services and page-content are wrapped with `withPublicRevalidation` (`apps/api/src/lib/revalidate-public.ts`), which POSTs the tags to `apps/public` `/api/revalidate` after a successful write. Set `PUBLIC_SITE_URL` and `REVALIDATE_SECRET` on the API project and `REVALIDATE_SECRET` on the public project; without them pages fall back to time-based revalidation (60-300s). Other admin handlers that change these tables (for example bulk imports under other routes) are not wrapped yet.

## Performance changes

- `apps/public` proxy matcher now covers only protected routes.
- `OrderProvider` moved from the root layout to the `checkout` and `orders` layouts.
- `prefetch={false}` on blog, search, policy, footer, service-location and header dropdown link lists.
- Floating assistant and runtime services were already lazy-loaded.
## Vercel env vars

`SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are required by the API. Likely removable from the public project (verify on a preview deploy). Keep on mgmt, superadmin and waba until the `@tecbunny/core` auth guards and remaining UI reads move. Manual steps: regions close to the database, firewall/rate-limit rules, CORS origins.
