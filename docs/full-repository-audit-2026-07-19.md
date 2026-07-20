# TecBunny Monorepo — Full Repository & Application Audit

**Date:** 2026-07-19
**Scope:** All apps (`api`, `public`, `mgmt`, `superadmin`, `waba`, `webmail`), all shared packages, Chrome extension, database schema/migrations, scripts, CI/CD, and DevOps configuration.
**Method:** Static source audit (file-by-file inspection of every application area). Runtime behaviors (live API latency, real login flows, live DB integrity) require a running environment and are marked **[RUNTIME-VERIFY]** where they could not be executed statically.
**Companion artifacts:** This report consolidates and extends the machine-generated API audit in `docs/api-audit/` (inventory, URL list, dependency graph, DB/frontend/role mappings) produced by `scripts/audit-api-surface.mjs`, and the four prior domain audits dated 2026-07-19 in `docs/`.

---

## 0. Executive Summary

| Category | Verdict |
|---|---|
| Overall production readiness | **NOT READY** — 6 Critical, 14 High findings open |
| Test coverage | **0%** — zero test files exist anywhere in the repository |
| Security posture | Mixed: strong env-key guards and unified middleware, but critical fail-open authorization defaults |
| Architecture | Coherent monorepo, but severe duplication between `apps/public` and `apps/mgmt`, and two conflicting Prisma clients |
| Database | Two divergent schema sources of truth (Prisma schema vs. compiled `database.sql`); destructive reset header in prod SQL |
| CI/CD | Typecheck + build only; **no test stage, no deploy gates, no secret scanning** |

### Top 10 actions (ordered)

1. Fix fail-open RBAC default in `packages/core/src/db/prisma.ts` (falls back to `superadmin`).
2. Remove/quarantine the `DROP SCHEMA public CASCADE` header in `database.sql` from anything CI or tooling can execute.
3. Stand up a test harness (Vitest + Playwright) — the repo has 0 tests.
4. Consolidate duplicated auth/profile/setup components into `packages/ui` / `packages/admin-ui`.
5. Delete or reconcile the second Prisma client in `packages/infra/src/db/prisma.ts` (RBAC bypass path).
6. Disable Prisma `query` logging in production.
7. Fix `push-env.js` shell-interpolation of secret values (command-injection + secret exposure).
8. Move Chrome extension token storage fully to `chrome.storage.session`; remove `local` fallback.
9. Enforce server-side role redirect / lockout (client-side versions are decorative only).
10. Add a CI test + validation gate (`validate:product-ux` is not run in `ci.yml`).

---

## 1. Findings Register

Severity: **C** = Critical, **H** = High, **M** = Medium, **L** = Low.

### 1.1 Security

| # | Sev | Finding | Evidence | Root Cause | Fix |
|---|---|---|---|---|---|
| S-1 | **C** | Prisma RBAC extension **fails open to `superadmin`** when auth context is unavailable (CLI, cron, background jobs, any non-request context). Any code path that triggers the catch gets unrestricted DB access. | [packages/core/src/db/prisma.ts](../packages/core/src/db/prisma.ts) — `catch` block sets `role = 'superadmin'` | Convenience default for background jobs baked into the security boundary | Default to a `system` role with an explicit allow-list; require background jobs to pass an explicit service context; fail **closed** otherwise |
| S-2 | **C** | Second, un-guarded Prisma client exists in [packages/infra/src/db/prisma.ts](../packages/infra/src/db/prisma.ts) with **no policy checks at all**. Importing `@tecbunny/infra` instead of `@tecbunny/core` silently bypasses the entire RBAC layer. | Both files instantiate `PrismaClient` against `DATABASE_URL` | Duplicate implementation drift | Keep exactly one client; if infra's lazy-proxy pattern is preferred, wrap it with the policy extension |
| S-3 | **C** | `database.sql` begins with `DROP SCHEMA IF EXISTS public CASCADE;`. Anyone (or any tool) applying this file to production destroys all data. CI's "migration check" only verifies the file is non-empty. | [database.sql](../database.sql) lines 11–13; [.github/workflows/ci.yml](../.github/workflows/ci.yml) migrations job | `compile_db.js` intentionally emits a reset header for idempotency | Split into `database.reset.sql` (dev-only, gitignored or clearly fenced) and a non-destructive `database.sql`; add a CI guard that fails if `DROP SCHEMA` appears in deployable SQL |
| S-4 | **H** | `push-env.js` interpolates secret values directly into a shell command: `vercel env add ${key} production --value "${value}"`. Values containing `"`, `$`, or backticks break out of quoting (command injection); all secrets transit argv (visible in process listings/history). | [push-env.js](../push-env.js) | String-built `execSync` | Use `spawnSync` with argument arrays and stdin piping (`vercel env add` reads from stdin) |
| S-5 | **H** | Chrome extension falls back to persistent `chrome.storage.local` for the access token (`legacyCredentials.accessToken`), defeating the session-storage upgrade. Extension also collects the superadmin password in the popup. | [extension/background.js](../extension/background.js) `getAccessToken()`; [extension/popup.js](../extension/popup.js) | Backward-compat fallback never removed | Remove the `local` fallback; clear any legacy token on startup; consider short-lived scoped tokens instead of superadmin credentials |
| S-6 | **H** | Client-side login lockout and role-based redirect in `LoginDialog` are enforced in React state only — refresh resets attempts; redirect target derives from a client-readable `profiles.role` query. Server-side enforcement must be the actual control. **[RUNTIME-VERIFY]** unified middleware rate limiting. | [apps/public/src/components/auth/LoginDialog.tsx](../apps/public/src/components/auth/LoginDialog.tsx) (duplicated in mgmt) | UI-level security theater | Treat client lockout as UX only; verify Supabase auth rate limits + `executeUnifiedPolicyMiddleware` global rate limiting cover login; enforce role gating in middleware/layouts (mgmt layout currently returns `null` rather than redirecting) |
| S-7 | **H** | Prisma client logs `query` in **all** environments (`log: ['query', 'error', 'info', 'warn']`) — SQL with parameters (PII, tokens) lands in production logs. | [packages/core/src/db/prisma.ts](../packages/core/src/db/prisma.ts) | Debug config left on | Gate `query`/`info` logs on `NODE_ENV !== 'production'` |
| S-8 | **M** | Analytics proxy uses the first 16 chars of the Supabase access token as a `sessionId` — leaks token material into the analytics store. | [packages/core/src/enterprise-analytics-proxy.ts](../packages/core/src/enterprise-analytics-proxy.ts) `actorContext()` | Convenient pseudo-ID | Hash the token (SHA-256, truncated) or use a dedicated session cookie |
| S-9 | **M** | `POST /api/auto-offers` `issue_share_discount` is invoked client-side with a fabricated blueprint ID and no proof the user actually shared — a discount-issuance endpoint that trusts client claims. **[RUNTIME-VERIFY]** server-side validation. | [apps/public/src/components/customised-setups/CustomSetupFlow.tsx](../apps/public/src/components/customised-setups/CustomSetupFlow.tsx) (~line 1620), duplicated in mgmt | Mocked "viral discount" flow shipped in prod component | Move issuance to a server-verified flow or remove until real |
| S-10 | **M** | `mgmt` and `api` use `src/proxy.ts` (Next 16 convention) while `public`, `superadmin`, `waba` use `middleware.ts` — mixed conventions make it easy for a route to silently escape policy. `apps/api` public-route allow-list is large (`GET /api/coupons`, `GET /api/projects`, etc.) and should be re-justified route-by-route. | [apps/api/src/proxy.ts](../apps/api/src/proxy.ts), [apps/public/middleware.ts](../apps/public/middleware.ts) | Incremental migration | Standardize on one convention per Next version; add a CI check asserting every app has exactly one edge-policy entrypoint |
| S-11 | **L** | Extension CSP is good, but `img-src 'self' http: https: data:` permits arbitrary remote images in extension pages. | [extension/manifest.json](../extension/manifest.json) | Loose image policy | Restrict to needed hosts |

### 1.2 Architecture & Code Quality

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| A-1 | **C** | **Wholesale component duplication between `apps/public` and `apps/mgmt`**: `LoginDialog.tsx`, `TwoFactorSetup.tsx`, `UserProfile.tsx`, and the ~1,900-line `CustomSetupFlow.tsx` are byte-near-identical copies. Fixes applied to one will silently miss the other (already drifting in whitespace). | `apps/{public,mgmt}/src/components/auth/*`, `.../customised-setups/CustomSetupFlow.tsx`, `.../profile/UserProfile.tsx` | Extract to `packages/ui` (customer-facing) / `packages/admin-ui` (staff), parameterize app-specific behavior |
| A-2 | **H** | Two env-validation systems coexist: `packages/core/src/config/env.ts` (Zod `EnvironmentValidator`) and `packages/database/src/env.ts` (manual resolvers). They disagree on key names and failure semantics. | Both files | Make `packages/database/env.ts` the single Supabase source; have core's schema import it |
| A-3 | **H** | `packages/core/src/index.ts` barrel re-exports `@tecbunny/database` **plus** ~20 modules wholesale, with commented-out dead exports (`user.service`, `payment.service`, `telemetry`, `db`). Every consumer pulls the entire graph; tree-shaking and layering are defeated; commented lines are dead code. | [packages/core/src/index.ts](../packages/core/src/index.ts) | Split into subpath exports (already partially done via `@tecbunny/core/hooks` etc.); delete dead lines |
| A-4 | **H** | Duplicate Prisma bootstrap (see S-2) plus a third data-access idiom (Supabase clients in `packages/database`) with no documented rule for which layer owns which tables. | `packages/core/src/db/`, `packages/infra/src/db/`, `packages/database/src/` | Write an ADR: Supabase client for RLS-protected user paths, single Prisma client for service paths |
| A-5 | **M** | `sync-deps.js` force-pins `react@19.2.6`, `next@16.2.10`, etc. via hardcoded overrides and swallows all errors (`catch(e) {}` ×3). Root `package.json` declares `"packageManager": "npm@12.0.1"` — a version that does not exist, which breaks Corepack. | [sync-deps.js](../sync-deps.js), [package.json](../package.json) | Fix `packageManager` to a real npm version; replace the script with `syncpack` or npm `overrides` |
| A-6 | **M** | `compile_db.js` performs regex surgery on SQL (extracting enums, triggers, DO-blocks, rewriting policies). Regex-based SQL rewriting is fragile — one new migration format silently corrupts `database.sql`. | [compile_db.js](../compile_db.js) | Prefer ordered migrations executed by the Supabase CLI; if a compiled snapshot is needed, generate with `pg_dump --schema-only` from a migrated shadow DB |
| A-7 | **M** | `waba` app: `console.error` used throughout instead of the shared `logger`; `useEffect` hooks with missing dependency arrays (`fetchConversations` on mount, eslint-disabled patterns); direct `createBrowserClient` with non-null `!` assertions on env. | [apps/waba/src/app/page.tsx](../apps/waba/src/app/page.tsx) | Adopt `@tecbunny/core` logger; wrap realtime client creation in a memoized helper with env guards |
| A-8 | **L** | `N8N/` (thousands of workflow templates), `my_agent/`, and `ALL_MARKDOWN_DOCUMENTS.md` live inside the product repo — repo bloat, noisy searches, larger clones/CI checkouts. | Workspace root | Move to a separate assets repo or gitignore |

### 1.3 Database

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| D-1 | **C** | **Two divergent schemas.** Prisma schema (`packages/types/prisma/schema.prisma`) models `Conversation`, `Message`, `Template`, `products`, `sys_users_prisma` with `Float` money columns; `database.sql` models the enterprise schema (`org_*`, `sys_*`, `sls_*`, `oms_*`, enums, RLS, audit triggers). They describe different tables for overlapping domains (orders, products, users, roles). No mapping doc exists. | [packages/types/prisma/schema.prisma](../packages/types/prisma/schema.prisma) vs [database.sql](../database.sql) | Declare one canonical schema; generate Prisma models from it (introspection) or delete the legacy Prisma models; document which app reads which tables (the api-audit `api-database-mapping.md` is the starting point) |
| D-2 | **H** | Money stored as `Float` (`Product.price`, `Order.total_amount`) in Prisma models — floating-point currency arithmetic causes rounding drift in totals/tax (Indian GST logic exists in `packages/core/src/indian-tax.ts`). | schema.prisma `Product`/`Order` | Migrate to `Decimal` / integer paise |
| D-3 | **H** | Only 8 migrations exist (`202607190001`–`202607190008`); everything earlier was collapsed into `database.sql` and excluded files are hardcoded in `compile_db.js`. Point-in-time migration replay for a fresh environment is not possible without the destructive reset file. | [supabase/migrations/](../supabase/migrations/) | Baseline properly: one squashed non-destructive baseline migration + forward migrations |
| D-4 | **M** | `Message.sender_number` FK references `Conversation.sender_number` (a mutable business attribute) instead of the surrogate ID — renumbering a contact orphans history. | schema.prisma `Message` | Relate via `conversation_id` |
| D-5 | **M** | `is_superadmin()` SQL function is `SECURITY DEFINER` and referenced by "all RLS policies" — correct pattern, but there is no `search_path` hardening visible in the definition, a classic SECURITY DEFINER hijack vector. | [database.sql](../database.sql) `is_superadmin()` | Add `SET search_path = public, pg_temp` to all SECURITY DEFINER functions |
| D-6 | **L** | `supabase/upload_and_update_sql.js` embeds the full product catalog (hundreds of rows, live image URLs) as an inline template literal — data as code, unreviewable diffs. | [supabase/upload_and_update_sql.js](../supabase/upload_and_update_sql.js) | Move data to CSV/JSON fixtures |

### 1.4 API Layer

The machine audit (`docs/api-audit/final-report.md`) inventories every route and tRPC procedure; its verdict: **no Critical/High static blockers**, with a long tail of Medium findings. Cross-checked highlights:

| # | Sev | Finding | Fix |
|---|---|---|---|
| P-1 | **H** | Analytics write amplification: `emitEnterpriseProxyTelemetry` issues up to **3 separate POSTs per mutating request** (event + staff log + audit log) from edge middleware, on every app. Under load this triples ingest traffic and can saturate the analytics route. | Batch into one ingest call with `logTypes: []`; or queue via `event.waitUntil` to a single collector |
| P-2 | **M** | Systemic gaps flagged by the audit script across ~100 routes: missing structured logging, missing audit-trail writes on privileged reads, and missing rate-limit signals on mutating routes (superadmin dashboards, waba templates, tRPC coupons/projects/pageContent). | Work down `docs/api-audit/final-report.md` table; the shared logger + `withAuditEvent` wrapper already exist in core — adoption is the gap |
| P-3 | **M** | `slowCandidate()` in `scripts/audit-api-surface.mjs` contains `return false;` followed by unreachable logic — the performance heuristic was deliberately disabled, so "no slow APIs" claims in generated reports are vacuous. | Remove dead code or re-enable behind a flag; measure latency in the perf-budget harness instead |
| P-4 | **M** | tRPC + REST + direct Supabase-from-client coexist without a routing rule; `docs/api-audit/api-frontend-mapping.md` shows overlapping consumers. | Document the contract: tRPC for typed internal panels, REST for public/webhooks |

### 1.5 Frontend / UI-UX

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| F-1 | **H** | `apps/waba` root layout ships **`title: "Create Next App"` / "Generated by create next app"** metadata — placeholder branding in a production staff tool. | [apps/waba/src/app/layout.tsx](../apps/waba/src/app/layout.tsx) | Set real metadata; add a validator rule banning `create next app` strings |
| F-2 | **H** | `UserProfile` uses `prompt()` for 2FA disable — a native browser modal, inconsistent with the design system and likely violating the repo's own `validate-no-browser-modals.mjs` contract (verify why the validator passes). | [apps/public/src/components/profile/UserProfile.tsx](../apps/public/src/components/profile/UserProfile.tsx) (dup in mgmt) | Replace with a `Dialog` + input; investigate validator blind spot |
| F-3 | **M** | `CustomSetupFlow` bid/download modals are raw fixed-position `div`s — no focus trap, no `Escape` handling, no `aria-modal`, unlike the Radix dialogs used elsewhere. | CustomSetupFlow.tsx (~line 1660+) | Use the shared `Dialog` |
| F-4 | **M** | `mgmt` layout returns `null` while `loading || !user` — unauthenticated users see a blank page instead of a redirect to login. | [apps/mgmt/src/app/mgmt/layout.tsx](../apps/mgmt/src/app/mgmt/layout.tsx) | Redirect (or rely on middleware and render a skeleton) |
| F-5 | **M** | `SuperadminShell` contains invalid Tailwind classes (`from-red-655`, `bg-zinc-955`) and mixes a light sidebar (`bg-white`) inside a dark (`bg-zinc-950`) shell — visual bugs and theme-contract drift. | [apps/superadmin/src/components/superadmin/SuperadminShell.tsx](../apps/superadmin/src/components/superadmin/SuperadminShell.tsx) | Fix class typos; align to token contract in `packages/ui/src/theme.ts` |
| F-6 | **M** | `webmail` inbox is mock data (`MOCK_THREADS`) behind `NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK`; production shows a well-designed "provider required" empty state, but the app is **not functional** — it must not be marketed as live. | [apps/webmail/src/app/inbox/page.tsx](../apps/webmail/src/app/inbox/page.tsx) | Track as feature-incomplete; keep the honest empty state |
| F-7 | **L** | `LoginDialog` waits on `setTimeout(500)` for auth state to settle before redirecting — race-condition-driven UX; slow devices still lose the race. | LoginDialog.tsx | Await an explicit auth-state promise/subscription |
| F-8 | **L** | Accessibility is partially strong (skip links in mgmt & superadmin, aria labels on icon buttons, `autoComplete="one-time-code"` on OTP) but inconsistent: emoji-as-icon buttons in CustomSetupFlow lack labels; refresh button in webmail sets a spinner that never stops (`setLoading(true)` with no completion). | Various | Sweep with the a11y contract validator; fix the fake refresh |

### 1.6 Testing & CI/CD

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| T-1 | **C** | **Zero automated tests.** No `*.test.*`/`*.spec.*` files, no Jest/Vitest/Playwright configuration anywhere in apps or packages. All 24 audit areas that require behavioral verification currently rely on manual QA and static validators. | `file_search` across repo returns none | Introduce Vitest for packages (start with `indian-tax`, `order-utils`, `offer-discount-service`, policy checks) and Playwright smoke flows (login, checkout calc, waba send); target the api-audit "test report" gaps |
| T-2 | **H** | `ci.yml` runs security audit (npm audit high), typecheck, build, and a trivial SQL non-empty check. It does **not** run `validate:product-ux`, the 12 `scripts/validate-*.mjs` gates, lint, or any tests. The launch-readiness machinery exists but is not enforced. | [.github/workflows/ci.yml](../.github/workflows/ci.yml), [package.json](../package.json) scripts | Add `npm run lint` and `npm run validate:product-ux` jobs; make them required checks |
| T-3 | **M** | Typecheck/build run with placeholder Supabase env vars — modules whose import-time env validation throws in "strict" mode may behave differently in CI vs prod (`EnvironmentValidator.shouldFailHard()` triggers on `CI === 'true'`, which likely means CI passes only because values are placeholders that parse, or the validator warns instead of failing — verify intent). | ci.yml + core env.ts | Decide: CI should either use a `.env.ci` fixture or explicitly set `TECBUNNY_VALIDATE_ENV=off` |
| T-4 | **L** | `docker-compose.yml` is dev-oriented (fine) but app services depend on `.env.local` files that are untracked — compose up fails silently for new contributors; no compose healthcheck for `public`/`mgmt`. | [docker-compose.yml](../docker-compose.yml) | Document `.env.local` bootstrap in README; add healthchecks |

### 1.7 Observability, Analytics & Logging

- **Strengths:** A real enterprise analytics contract exists (`packages/core/src/enterprise-analytics.ts`) with typed categories, actor context, staff-activity and audit wrappers (`withStaffActivity`, `withAuditEvent`), proxy-level automatic telemetry, and a documented architecture (`docs/enterprise-analytics-logging-architecture-2026-07-19.md`).
- **Gaps:** adoption is uneven (P-2); analytics ingestion endpoint is unauthenticated by design (`POST /api/analytics/track` is on the public-routes list) — spam/poisoning of the analytics store is possible **[RUNTIME-VERIFY]** whether ingest validates/ratelimits (M); events fire-and-forget with `.catch(() => undefined)`, so ingest outages are invisible (add a dead-letter counter) (L).

### 1.8 AI / Automation Surface

- Superadmin AI dashboard querying (`POST /api/superadmin/dashboard/ask`) is auth-protected, grounded in the command-center payload, has deterministic fallback, and persists prompts/answers to `enterprise_audit_logs` — good governance pattern (per `docs/superadmin-command-center-production-readiness-2026-07-19.md`).
- Extension AI enhancement (`/api/products/scraper/ai`) requires a bearer token — acceptable, subject to S-5 token-storage fix.
- WABA "AI Editor clarification" flow handles failures gracefully client-side; verify the server prompt-injection posture of inbound WhatsApp text before it reaches Gemini **[RUNTIME-VERIFY]**.

---

## 2. Coverage Map Against Requested Audit Areas

| Requested area | Where addressed |
|---|---|
| 1. Repository & architecture | §1.2 (A-1…A-8), §0 |
| 2. Frontend | §1.5 |
| 3. Backend/API | §1.4 + `docs/api-audit/` deliverables |
| 4. Database | §1.3 |
| 5. Auth & security | §1.1 |
| 6. UI/UX & flows | §1.5 (F-2, F-3, F-7) |
| 7. Superadmin | §1.5 F-5, §1.8; prior audit `docs/superadmin-command-center-production-readiness-2026-07-19.md` |
| 8. Management panel | §1.5 F-4; prior audit `docs/mgmt-enterprise-audit-2026-07-19.md` |
| 9. Sales & CRM | §1.3 D-1 (sls_* vs Prisma Lead divergence) |
| 10. Support/service | Covered by api-audit role mapping; ticket schema in both schemas (D-1) |
| 11. E-commerce | D-2 (Float money), S-9 (discount issuance), CustomSetupFlow findings |
| 12. Analytics | §1.7 |
| 13. Notifications/comms | F-6 (webmail non-functional), WABA findings A-7/F-1 |
| 14. Performance | P-1, P-3; runtime load tests **[RUNTIME-VERIFY]** — perf-budget validator exists but is static |
| 15. Code quality | A-3, A-5, A-7, T-1 |
| 16. Testing & QA | §1.6 |
| 17. DevOps | T-2…T-4, S-3, S-4 |
| 18. Compliance/legal | GDPR export route exists (`/api/user/gdpr/export`, audit-trail gap flagged in api-audit); S-7 log PII |
| 19. Business logic | D-2, S-9, indian-tax untested (T-1) |
| 20. Documentation | Strong docs culture in `docs/`; missing: data-layer ADR (A-4), schema mapping (D-1) |
| 21. Third-party integrations | PayU/Infobip/Turnstile keys schema-validated (core env.ts); webhook signature checks flagged in api-audit |
| 22. Mobile & PWA | `manifest.webmanifest` + viewport configured in public layout; device-matrix testing **[RUNTIME-VERIFY]** |
| 23. Search & SEO | Rich JSON-LD structured data in public layout (verified, high quality); one custom `@type: ITPrivateLimitedCompany` is non-standard schema.org and will be ignored by crawlers (L) |
| 24. Final report | This document + §3 roadmap |

---

## 3. Remediation Roadmap

### Phase 1 — Stop-the-bleeding (security)
1. S-1: fail-closed Prisma policy default.
2. S-2: delete/wrap infra Prisma client.
3. S-3: de-fang `database.sql` reset header.
4. S-7: production log levels.
5. S-4: rewrite `push-env.js` with `spawnSync` arrays.
6. S-5: extension token storage.

### Phase 2 — Verification infrastructure
7. T-1: Vitest harness; first suites: `checkPolicy`, `indian-tax`, `order-utils`, `offer-discount-service`, env resolvers.
8. T-2: wire `lint` + `validate:product-ux` + tests into `ci.yml` as required checks.
9. Playwright smoke: public login→profile, mgmt nav per role, waba send-message, superadmin dashboard load.

### Phase 3 — Structural debt
10. A-1: extract duplicated components to shared packages (start with `TwoFactorSetup` — identical; then `LoginDialog`; `CustomSetupFlow` last).
11. D-1/D-2: schema reconciliation ADR; Decimal money migration.
12. A-2: single env-validation source.
13. S-10: unify middleware/proxy convention.

### Phase 4 — Polish
14. F-1…F-8 UI fixes; P-1 analytics batching; P-2 route-by-route logging/audit adoption; A-8 repo hygiene (`N8N/` relocation).

---

## 4. What Could Not Be Verified Statically

- Live API response codes/latency, real DB data quality (orphans, duplicates), actual RLS behavior under each role, webhook signature verification against real providers, email/WhatsApp delivery, payment sandbox flows, cross-browser rendering, Lighthouse scores. These require a running environment and seeded data; the Playwright + perf-budget work in Phase 2 is the vehicle.

*End of report.*
