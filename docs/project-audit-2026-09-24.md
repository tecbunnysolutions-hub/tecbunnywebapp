# Project audit — 24 September 2026

Repository-wide automated checks and targeted source review across six apps and 17 workspaces. This is a list of findings established during this review, not a guarantee that every defect has been found. Production database state, real gateway transactions, authenticated multi-tenant browser workflows, and deployment infrastructure were not exercised.

No application fixes were made during the original audit. Subsequent fixes for the high-priority findings are documented in [the 25 September remediation report](high-priority-remediation-2026-09-25.md). Two temporary, mocked Cashfree reproduction tests both passed and were removed after the audit. They did not contact a gateway or write to a database.

## Validation results

| Check | Result |
| --- | --- |
| Existing test suites | 111 tests passed in 21 files; five workspace test tasks succeeded |
| Focused Cashfree reproductions | 2/2 demonstrated the defects described below |
| Lint, forced execution | Passed: 0 errors, 21 warnings across eight workspace tasks |
| Shared packages lint, run directly | Failed: 18 errors and 3 warnings, omitted by the normal workspace lint command |
| Tooling and extension lint | Passed: 25 files, no errors or warnings |
| Dependency audits | Both `npm audit --omit=dev` and full `npm audit`: 0 reported vulnerabilities |
| Independent repository validators | 15 passed; 3 failed (runtime readiness and evidence) |
| Type checking, forced execution | Passed: all 16 configured workspace tasks, no TypeScript errors |
| Production build | Passed for all six apps; final Turbo run completed 16/16 build/lint tasks |

The storefront test task contains no tests and succeeds with `--passWithNoTests`. It also reported a 10-second shutdown timeout. Management, superadmin, and webmail do not define test scripts. Passing tests therefore do not establish end-to-end correctness for those applications.

Build execution note: the initial parallel build exhausted available memory on this 8 GB machine and was stopped. The successful final command was `npm run build -- --continue --concurrency=1`. It reused tasks already completed during this audit, including webmail; the other five app builds ran to completion serially. No code changes were required to make compilation succeed.

## High-priority findings

### 1. Server routes use a browser Supabase client, losing request authentication

**Locations:** `packages/database/src/browser.ts:29`, `packages/database/src/index.ts:3`, `apps/api/src/app/api/auth/session/route.ts:11`, `apps/api/src/app/api/orders/route.ts:8`.

The package's `createClient` export is `getBrowserClient`, a module-level singleton created with `createBrowserClient` and no request cookie adapter. API routes import it as though it were a server client. The installed Supabase SSR implementation explicitly returns an empty cookie list for this configuration in Node. A valid browser session is consequently invisible to `getSession()` / cookie-based `getUser()` in these handlers; `/api/auth/session` reports no ordinary customer session, and cookie-authenticated order/payment operations fail or run as anonymous. Calls explicitly passing a bearer token are a different path.

**Fix:** use the request-scoped `createSupabaseClient` from `@tecbunny/database/server` in server handlers; keep browser singletons confined to client code. Audit the remaining server imports, rather than fixing only the session endpoint.

### 2. Cashfree verification does not bind payment to the local order

**Location:** `apps/api/src/app/api/payments/cashfree/verify/route.ts:54`.

The handler accepts `cf_order_id` and `order_id` independently. Any gateway response with `order_status === 'PAID'` triggers an update of the caller-selected local order. There is no stored transaction association, expected amount/currency comparison, or check that this gateway payment has already settled another order. The create-order handler does not persist such an association either.

**Reproduction:** mock Cashfree returning a paid INR 1 order named `cheap-order`; request verification with `order_id=unrelated-expensive-order`. The handler calls `.eq('id', 'unrelated-expensive-order')` and returns `is_paid: true`. This proves the handler defect; the extent of database mutation in production depends on its RLS policies and the client-authentication issue above.

**Fix:** persist the gateway/local-order association before checkout; verify authenticated ownership, expected amount/currency, and transaction identity; settle atomically and idempotently through a trusted server path.

### 3. Storefront middleware is not included in the build; its intended CSP also conflicts with Cashfree

**Locations:** `packages/core/src/auth/unified-middleware.ts:36`, `apps/public/src/app/payment/cashfree/[orderId]/CashfreePaymentPage.tsx:52`, `apps/public/middleware.ts:8`.

The storefront puts `middleware.ts` at the app root while its App Router lives under `src/app`. The installed Next build implementation discovers middleware in the parent of the App Router, which is `src` here. The generated `apps/public/.next/server/middleware-manifest.json` has empty middleware and sortedMiddleware entries, confirming the file was not compiled. Its intended session gate and per-request CSP therefore do not execute for checkout, payment, profile and orders pages. Route-level/data-layer protections must be assessed separately; this finding alone does not establish access to another user's data.

There is a second, latent integration defect: once this middleware is placed correctly, its CSP will block Cashfree's installed loader. That loader injects `https://sdk.cashfree.com/js/v3/cashfree.js` without a nonce; this domain is absent from `script-src`, and the policy lacks `strict-dynamic`. Required Cashfree frame origins are also missing. The installed SDK's README documents its required script/frame sources. This is not claimed as an active CSP block in the current storefront build, because that build omits the middleware.

**Fix:** register the middleware/proxy under `src` and repair the Cashfree CSP integration together. Verify the generated manifest, unauthenticated protected-page requests and checkout behavior in a browser.

### 4. Payment persistence errors still lead to success or checkout

**Locations:** `apps/api/src/app/api/payments/cashfree/verify/route.ts:68`, `apps/api/src/app/api/payment/payu/callback/route.ts:255`, `packages/core/src/services/payment.service.ts:194`.

Cashfree logs an order-update error but returns HTTP 200 with `is_paid: true`. A second reproduction test confirmed this using a mocked database failure. PayU likewise logs failure of `complete_payment_transaction` and continues to the success redirect. PayU initiation also continues to the gateway when recording the pending transaction fails, even though its callback rejects unknown transactions. These paths can charge a customer while leaving the local order unpaid or unverifiable.

**Fix:** require durable transaction creation before checkout; on settlement failure return a retryable/pending outcome and retain a reliable reconciliation mechanism. Do not claim local order completion before the write succeeds.

### 5. WABA queries a user relation absent from the committed schema

**Locations:** `apps/waba/src/lib/authorization-scope.ts:54`, `apps/waba/src/app/api/users/route.ts:23`, `apps/waba/src/agents/AssignmentOrchestrator.ts:95`.

Several new Supabase queries use `.from('User')`. Prisma maps `User` to `sys_users_prisma` (`packages/types/prisma/schema.prisma:127`), and the compatibility migration creates that view from `profiles`, not a relation named `User`. Under the committed schema, scoped staff receive authorization failures, user listing errors, and assignments cannot find managers. Merely changing the relation name is insufficient for queries selecting/filtering `role`: the compatibility view exposes `role_id`, not a `role` string.

**Fix:** consistently query the canonical profile/role schema or use Prisma's mapped model with the appropriate role relation. Verify actual deployed relations before migration.

### 6. Unassigned WABA conversations bypass organization and branch isolation

**Locations:** `apps/waba/src/lib/authorization-scope.ts:112` and `:155`.

Every organization-scoped actor is allowed to access any unassigned conversation. Listing adds `assigned_to.is.null` without an organization predicate, and direct access returns true immediately for a null assignee. The client prefers a service credential, so application checks are material. Once the user lookup works, one organization's staff can read or reply to another organization's unassigned traffic. Assigning/unassigning a conversation also changes its effective access boundary.

**Fix:** give conversations an immutable organization/branch ownership boundary independent of their current assignee, and apply that boundary to reads, replies, media, and assignment.

### 7. API login middleware blocks signed external webhooks

**Location:** `apps/api/src/proxy.ts:30` (public-route list).

Only the shipped-order webhook and PayU callback are admitted there. `/api/webhooks/payment/received`, `/api/webhooks/payment/failed`, most order/customer webhooks, and `/api/webhook/whatsapp` are missing. External providers do not hold a Supabase browser session, so the middleware returns 401 before route-level signature verification. The separate WABA app correctly allows its own WhatsApp route; that does not fix these API-app paths.

**Fix:** explicitly allow the intended signed webhook routes and methods at the session gate, preserving their own signature/replay checks. Test requests through the gateway, not only direct handler calls.

### 8. Session refresh can discard cookie chunks

**Location:** `packages/database/src/middleware.ts:146`.

Each cookie `set`/`remove` callback replaces `response` with a fresh `NextResponse` and then sets only the current cookie. When Supabase refreshes a chunked session, earlier Set-Cookie headers are lost. In addition, `forwardedHeaders` can be a snapshot taken before the request cookie mutations, so downstream handlers do not necessarily receive the refreshed token in the same request.

**Fix:** use a batched cookie adapter that applies all mutations to one response and forwards the updated request cookies. Test multi-chunk refresh and removal.

## Additional functional and release findings

### 9. Required PayU database function has no committed definition

**Location:** `apps/api/src/app/api/payment/payu/callback/route.ts:246`.

The callback calls `complete_payment_transaction`, but a repository search found no function definition in migrations, the reset SQL, or infrastructure code. A manual linter script mentions the name but does not create it. A fresh deployment cannot reproduce this payment dependency from the repository. Existing production installation was not inspected.

**Fix:** commit the function and its permissions in a migration, including transaction locking and idempotency. The current database-readiness validator checks presence of migration files, not that this function exists.

### 10. Cashfree settings updates do not update loaded payment handlers

**Locations:** `apps/api/src/app/api/payments/cashfree/config/route.ts:97`, `apps/api/src/app/api/payments/cashfree/create-order/route.ts:6`, `apps/api/src/app/api/payments/cashfree/verify/route.ts:6`.

The settings route writes `.env.cashfree` and mutates its process environment. Payment handlers capture environment and credentials in module-level constants, so already-loaded handlers retain old values even in the same process. Separate deployment instances do not share that mutation, and the payment handlers never read `.env.cashfree` themselves. A settings response can claim the new configuration while checkout continues using old credentials.

**Fix:** store settings in a shared server-side configuration store and resolve them consistently per request or through an explicitly invalidated cache.

### 11. Cashfree client and server default to different environments

**Locations:** `apps/public/src/app/payment/cashfree/[orderId]/CashfreePaymentPage.tsx:54`, `apps/api/src/app/api/payments/cashfree/create-order/route.ts:6`.

Without explicit variables, the API creates a sandbox payment session while the browser initializes the production SDK. The browser also uses a separate public variable, independent of the admin settings endpoint, allowing mismatch after a configuration change.

**Fix:** return the authoritative payment environment with the session and initialize checkout using it.

### 12. Unicode UTM values crash shared middleware

**Location:** `packages/core/src/auth/unified-middleware.ts:245`.

`btoa(JSON.stringify({ source: utmSource }))` throws for characters outside Latin-1. A request such as API `/api/products?utm_source=हिंदी` reaches an uncaught exception when middleware otherwise succeeds. A local Node reproduction returned `InvalidCharacterError: Invalid character`. This applies to apps that actually register the shared middleware; the storefront registration defect is described separately above.

**Fix:** encode UTF-8 bytes before Base64, or use a cookie-safe URI encoding; bound the input size as well.

### 13. WABA latest-message and scope queries are silently truncated

**Locations:** `apps/waba/src/app/api/messages/route.ts:119`, `apps/waba/src/lib/authorization-scope.ts:116`, `supabase/config.toml:14`.

The latest-message query selects every message for the displayed senders, sorts globally by timestamp, then keeps the first message per sender in JavaScript. Supabase caps results at 1,000 rows in the committed configuration. A busy sender can consume that entire result, causing other conversations to show no latest message despite having history. The accessible-senders helper likewise has no pagination, so large scoped inboxes lose conversations before the actual paginated query.

**Fix:** fetch one latest message per sender in SQL and apply scope predicates in the database, avoiding capped intermediate ID lists.

### 14. Cross-origin PATCH preflight is rejected

**Location:** `packages/core/src/auth/unified-middleware.ts:103` and `:238`.

Both CORS method lists omit PATCH, although the API implements PATCH endpoints for profile, product, blog, contact-message and Cashfree settings changes. A browser calling these directly across app origins cannot pass preflight. Same-origin rewrites are unaffected.

**Fix:** include the supported mutation methods and verify preflight against the actual cross-origin client configuration.

### 15. Runtime readiness evidence is incomplete and partly stale

**Location:** `runtime-readiness-evidence.json`.

Three validators fail:

- `validate-runtime-evidence-artifacts`: 26 missing evidence-file references for pending/failing checks.
- `validate-runtime-evidence-completeness`: 18 missing evidence-file references for checks recorded as passing.
- `validate-runtime-readiness`: 14 pending checks, plus stale evidence dates for database-query performance, rollback, and backup/restore.

The missing references include authentication/authorization reports, ownership and tenant-isolation exercises, JWT and refresh lifecycle, security checks, critical workflow coverage, load/query performance, deployment rehearsal, health checks and monitoring. These counts are references, not distinct files.

**Fix:** perform the outstanding exercises and restore their actual evidence; do not mark checks passing or refresh dates merely to silence the validators.

### 16. Normal lint omits shared packages and hides 18 lint errors

**Locations:** `packages/ui/package.json`, `packages/admin-ui/package.json`, root `package.json` lint script.

The successful Turbo lint command only runs workspaces that define lint scripts. Shared UI and admin UI are omitted, while config and RPC scripts merely print "No lint". Running `npx eslint packages` directly found 18 errors and three warnings. Sixteen errors are Storybook stories importing the renderer package instead of a framework package. The other two are accessibility-rule violations at `packages/ui/src/app/QuoteCTA.tsx:87` (label association) and `packages/ui/src/components/ui/alert.tsx:39` (heading content). The latter is a reusable wrapper and should be checked for correct children forwarding before deciding whether it needs a code or lint-configuration change.

**Fix:** include shared packages in the normal lint gate, correct the story imports, and resolve or narrowly configure the accessibility findings after verifying their rendered behavior.

### 17. The API gateway ignores ordinary Supabase bearer tokens

**Location:** `packages/database/src/middleware.ts:222`.

Middleware parses Authorization only to recognize custom `v1`/`v2` superadmin tokens. Its Supabase client is configured with cookies only, and the later `auth.getUser()` receives no bearer argument. Thus a client supplying a valid Supabase bearer token without cookies is rejected before protected route handlers can run, even where those handlers explicitly support bearer authentication (for example, orders). Public routes and the explicitly admitted tRPC path follow a different path.

**Fix:** validate ordinary bearer tokens at the gateway and carry the verified session/assurance context into role and MFA checks, while preserving cookie authentication. Exercise bearer-only requests through the middleware in tests.

## Warnings and coverage limits

- Storefront lint: eight warnings, including seven accessibility warnings across OTP verification, projects, carousel, and shop UI, plus an unused ESLint directive.
- WABA lint: five warnings (navigation, state update in an effect, and duplicate use-before-definition warnings).
- Management lint: six navigation warnings; superadmin lint: two navigation warnings.
- Vitest reports CommonJS/ESM configuration compatibility warnings in core, API and WABA.
- Root prebuild environment validation reported missing settings but continued. It executes directly via `tsx` before Next loads app `.env` files, so this output alone does not prove deployed credentials are absent.
- Build output includes deprecated middleware-convention warnings and an Edge-runtime `process.cwd` import warning in WABA and superadmin. These are warnings, not confirmed build failures. Storefront also warns about custom Cache-Control headers on Next's static/image paths.
- No production database reset, live charge, email, WhatsApp message, or live configuration change was performed.

Recommended order: repair server-side authentication and payment association/settlement first; then storefront middleware/CSP, WABA schema/isolation, webhook admission and session refresh; then remaining functional issues and release evidence.

## Workspace lint warning locations

| File | Line(s) | Warning(s) |
| --- | --- | --- |
| apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx | 507 | Keyboard listener and interactive semantics (2) |
| apps/public/src/app/projects/page.tsx | 255 | Keyboard listener and interactive semantics (2) |
| apps/public/src/components/HeroCarousel.tsx | 153 | Interactive semantics (1) |
| apps/public/src/components/products/ShopPageContent.tsx | 780 | Keyboard listener and interactive semantics (2) |
| apps/public/src/instrumentation.ts | 14 | Unused eslint-disable directive (1) |
| apps/waba/src/app/login/page.tsx | 29, 61 | Internal navigation using window.location (2) |
| apps/waba/src/components/waba/Customer360Panel.tsx | 83 | Synchronous state update inside effect (1) |
| apps/waba/src/lib/authorization-scope.ts | 165 | Both JS and TS use-before-definition rules (2) |
| apps/superadmin/src/app/superadmin/login/page.tsx | 74 | Internal navigation using window.location (1) |
| apps/superadmin/src/app/superadmin/mfa-setup/page.tsx | 59 | Internal navigation using window.location (1) |
| apps/mgmt/src/app/auth/login/page.tsx | 365 | Internal navigation using window.location (1) |
| apps/mgmt/src/components/manager/ManagerSidebar.tsx | 52 | Internal navigation using window.location (1) |
| apps/mgmt/src/components/mgmt/UnifiedPanelShell.tsx | 83 | Internal navigation using window.location (1) |
| apps/mgmt/src/components/sales-external/SalesExternalSidebar.tsx | 38 | Internal navigation using window.location (1) |
| apps/mgmt/src/components/sales-staff/SalesStaffSidebar.tsx | 40 | Internal navigation using window.location (1) |
| apps/mgmt/src/components/sales/SalesSidebar.tsx | 57 | Internal navigation using window.location (1) |

## Missing evidence files (32 distinct paths)

- docs/api-audit/final-report.md
- docs/runtime-evidence/api-route-auth-coverage-runtime.md
- docs/api-audit/api-role-mapping.md
- docs/runtime-evidence/rbac-enforcement-runtime.md
- docs/production-readiness-execution-checklist-2026-07-26.md
- docs/runtime-evidence/tenant-branch-isolation-runtime.md
- docs/runtime-evidence/ownership-checks-runtime.md
- docs/security/dependency-risk-acceptance-2026-07-26.md
- docs/runtime-evidence/jwt-lifecycle-runtime.md
- docs/runtime-evidence/refresh-token-rotation-runtime.md
- docs/runtime-evidence/csrf-cookie-flows-runtime.md
- docs/runtime-evidence/rate-limiting-runtime.md
- docs/runtime-evidence/security-headers-runtime.md
- docs/go-live-signoff-approvals-2026-07-26.md
- docs/runtime-evidence/secret-handling-runtime.md
- docs/runtime-evidence/owasp-top10-runtime.md
- docs/runtime-evidence/runtime-validation-2026-07-26.md
- docs/runtime-evidence/critical-workflow-coverage-runtime.md
- docs/runtime-evidence/coverage-targets-runtime.md
- docs/runtime-evidence/build-size-report-runtime.md
- docs/runtime-evidence/lighthouse-runtime.md
- docs/runtime-evidence/core-web-vitals-runtime.md
- docs/api-audit/api-test-report.md
- docs/runtime-evidence/api-latency-runtime.md
- docs/runtime-evidence/database-query-performance-runtime.md
- docs/runtime-evidence/load-testing-runtime.md
- docs/runtime-evidence/production-build-rehearsal.md
- docs/runtime-evidence/migration-safety-rehearsal.md
- docs/runtime-evidence/rollback-rehearsal.md
- docs/runtime-evidence/backup-restore-rehearsal.md
- docs/runtime-evidence/health-check-runtime.md
- docs/runtime-evidence/monitoring-alerting-runtime.md

## Shared-package lint findings

- packages/admin-ui/src/components/GlobalShell.tsx:88 — WARNING tecbunny-jsx-a11y/click-events-have-key-events
- packages/admin-ui/src/components/GlobalShell.tsx:88 — WARNING tecbunny-jsx-a11y/no-static-element-interactions
- packages/ui/src/app/QuoteCTA.tsx:87 — ERROR tecbunny-jsx-a11y/label-has-associated-control
- packages/ui/src/components/ui/accordion.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/alert-dialog.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/alert.tsx:39 — ERROR tecbunny-jsx-a11y/heading-has-content
- packages/ui/src/components/ui/avatar.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/badge.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/button.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/card.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/checkbox.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/dialog.stories.tsx:2 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/dropdown-menu.stories.tsx:2 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/input.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/logo.tsx:81 — WARNING tecbunny-jsx-a11y/no-noninteractive-element-interactions
- packages/ui/src/components/ui/radio-group.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/select.stories.tsx:2 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/switch.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/table.stories.tsx:2 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/tabs.stories.tsx:1 — ERROR storybook/no-renderer-packages
- packages/ui/src/components/ui/textarea.stories.tsx:1 — ERROR storybook/no-renderer-packages
