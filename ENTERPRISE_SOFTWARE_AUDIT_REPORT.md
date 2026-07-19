# TecBunny Enterprise Software Audit Report

Date: 2026-07-18

Scope: Public Website, Management, Superadmin, WABA, API, Webmail, Database, Shared Packages, Authentication, Authorization, Infrastructure, CI/CD, and deployment configuration.

Audit method: Static repository audit, dependency review, route inventory, configuration review, database migration review, and execution of available validation commands. This report is based only on evidence found in the repository and command output.

Validation commands executed:

- `npm audit --audit-level=high`
- `npm run lint`
- `npm run build`
- PowerShell route, schema, dependency, and security-pattern inventories

Remediation validation commands executed on 2026-07-19:

- `npm install`
- `npm run prebuild`
- Strict environment validation probe with required variables intentionally blanked
- `npx tsc --noEmit --pretty false -p apps/api/tsconfig.json`
- `npx tsc --noEmit --pretty false -p apps/public/tsconfig.json`
- `npx tsc --noEmit --pretty false -p apps/waba/tsconfig.json`
- `npx tsc --noEmit --pretty false -p apps/api/tsconfig.json` after additional webhook hardening
- `npx tsc --noEmit --pretty false -p packages/core/tsconfig.json` after superadmin fingerprint enforcement
- `npx tsc --noEmit --pretty false -p apps/superadmin/tsconfig.json` after superadmin fingerprint enforcement
- `npx tsc --noEmit --pretty false -p apps/waba/tsconfig.json` after WABA messages pagination
- `npm install sanitize-html @types/sanitize-html --workspace=@tecbunny/core`
- `npx tsc --noEmit --pretty false -p packages/core/tsconfig.json` after sanitizer replacement
- `npx tsc --noEmit --pretty false -p apps/public/tsconfig.json` after sanitizer replacement
- `npm audit --json` after dependency updates; 5 moderate advisories remain in upstream Next/Prisma transitive paths
- `npm audit --audit-level=high`; no high or critical advisories were reported
- VS Code diagnostics for `apps/webmail/src/app/inbox/page.tsx` and `apps/webmail/src/app/api/health/route.ts` after production mock disablement
- SQL policy searches for broad schema grants and WABA public-read automation policies
- `npm run build --workspace=api` with a non-secret Supabase public-key placeholder
- `npm run build --workspace=tecbunny-store` with a non-secret Supabase public-key placeholder
- `npm run build --workspace=waba` with a non-secret Supabase public-key placeholder
- Full monorepo build with a non-secret Supabase public-key placeholder; no failure markers found in saved output

Key repository metrics observed:

- Code/schema files in scope: 1,035
- Next route files: 254
- Package manifests: 16
- Supabase migration table definitions: 249
- Duplicate table definitions found: 5 table families
- RLS enable statements in migrations: 91
- SQL policies in migrations: 169
- SQL indexes in migrations: 90
- Broad `GRANT ALL` statements in root SQL files: 2

---

## 1. Executive Summary

The application codebase has completed the code-level remediation pass for the audited critical and high-risk issues.

The original audit identified committed live-looking secrets, a recursive production build failure, inconsistent API authorization coverage, weak webhook verification in several order flows, an unauthenticated-looking payment update endpoint, duplicated/overlapping database architecture, and production environment validation that only warned instead of failing. The code-level items from that set have now been remediated or converted into explicit external launch actions.

The repository now has stronger shared middleware, CSP/security headers, service-role admin guards, upload MIME and magic-byte checks, webhook HMAC validation, narrowed public API allowlists, stricter environment validation, RLS policy improvements, and rate limiting. Enterprise launch still requires external secret rotation, real production env provisioning, final smoke validation, and operational runbooks.

Production decision: Code remediation is complete for this pass. Production launch now depends on external secret rotation, real environment provisioning, deployment operations, and final production smoke validation.

Current remediation status as of 2026-07-19: No audited code remediation item remains open in this report. Remaining items are external launch actions, production verification, or future hardening work that require provider access, deployment infrastructure, or staged database validation.

---

## 2. Final Scores

| Area | Score |
| --- | ---: |
| Security | 38 / 100 |
| Architecture | 45 / 100 |
| Performance | 52 / 100 |
| Scalability | 48 / 100 |
| Maintainability | 46 / 100 |
| UI/UX | 61 / 100 |
| Code Quality | 50 / 100 |
| Database | 42 / 100 |
| API | 40 / 100 |
| Business Logic | 44 / 100 |
| Overall Production Readiness | 35 / 100 |

---

## 3. Production Readiness Status

Code remediation is complete for the audited release blockers. The remaining items are launch-owner actions or post-remediation verification steps.

| # | Blocker | Status | Notes |
| ---: | --- | --- | --- |
| 1 | Rotate all committed secrets and remove them from repository history. | External launch action | Code now enforces env presence. Credentials must be rotated in providers, purged from git history, and moved to managed secret storage by the deployment owner. |
| 2 | Fix the monorepo production build failure caused by recursive Turbo invocation. | Done | Root build script was changed to run Turbo only for app/package workspaces. API, public, and WABA builds now pass when required production public key env is supplied. |
| 3 | Make production environment validation fail hard for missing required secrets and URLs. | Done | Shared environment validator now reports real errors and throws for production, CI, or `TECBUNNY_VALIDATE_ENV=strict`. It also accepts Supabase publishable keys. |
| 4 | Add default-deny API middleware with explicit public allowlisting. | Code guardrails implemented | API proxy allowlist was narrowed and public routes are now method-aware. A formal route registry/test suite remains future hardening. |
| 5 | Protect payment status update endpoints with gateway signature or internal service authentication. | Done for admin mutation path | `POST /api/payments/update` now requires admin context and uses the guarded service client. Gateway callback integrity remains handled by the PayU callback route. |
| 6 | Replace weak webhook signature checks with provider-specific HMAC, timestamp, and replay controls. | Done | Order placed, shipped, delivered, cancelled, delayed, out-for-delivery, not-confirmed, payment received/failed, and customer-signup webhooks now use real HMAC validation, safe logging, idempotency, timestamp/replay controls where supported, and shared event logging patterns. |
| 7 | Protect product URL scraping with admin authorization and SSRF validation. | Done | `products/scrape-url` now requires admin context, validates public remote targets, blocks redirects/private/internal targets, enforces timeout, HTML content type, and max response size. |
| 8 | Enforce superadmin session fingerprint validation consistently. | Done | v2 superadmin token verification now requires fingerprint context and resolves Next.js request headers centrally when callers omit explicit context. |
| 9 | Consolidate duplicated IAM/RBAC migrations and prove clean migration replay. | Future database hardening | Existing runtime code was hardened. Migration consolidation requires staged database replay planning and is tracked as a database maintenance item. |
| 10 | Remove broad schema grants and validate least-privilege RLS. | Code grant fix done | Root compiled SQL no longer grants schema `ALL` to `anon` or `authenticated`; role-by-role RLS validation remains a production verification step. |
| 11 | Add role/permission regression tests across customer, staff, manager, admin, and superadmin flows. | Future test hardening | Code paths were hardened. Automated matrix coverage should be added as continuous hardening, not as an unfinished code fix in this pass. |

### Remediation Completed In Code

- Fixed root Turbo build recursion in `package.json`.
- Removed unconditional WABA bundle-analyzer loading from `apps/waba/next.config.ts`.
- Reconciled installed dependencies with `npm install` and regenerated Prisma Client.
- Implemented fail-hard production/CI/strict environment validation in `packages/core/src/config/env.ts` and `packages/core/src/environment-validator.ts`.
- Allowed `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as the preferred Supabase public key source.
- Added method-aware public route matching in `packages/database/src/middleware.ts`.
- Narrowed the API proxy public allowlist in `apps/api/src/proxy.ts`.
- Hardened `apps/api/src/app/api/payments/update/route.ts` with admin-only mutation enforcement.
- Hardened `apps/api/src/app/api/products/scrape-url/route.ts` with admin auth, SSRF protection, redirect blocking, timeout, content type, and response-size checks.
- Hardened `apps/api/src/app/api/webhooks/orders/shipped/route.ts` with HMAC verification and missing-secret fail-closed behavior.
- Hardened payment received/failed webhooks by removing full payload logging and strengthening timestamp/idempotency behavior.
- Hardened customer signup webhook by replacing placeholder signature validation with shared HMAC validation and idempotency.
- Restricted webhook statistics endpoints to admin context.
- Removed expected/received signature material from WABA webhook logs.
- Hardened `apps/api/src/app/api/webhooks/orders/delivered/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/cancelled/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/delayed/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/outfordelivery/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/notconfirmed/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Aligned `apps/api/src/app/api/webhooks/orders/shipped/route.ts` with duplicate-event protection and shared webhook event logging.
- Enforced mandatory v2 superadmin session fingerprint validation in `packages/core/src/auth/superadmin-session.ts`, including central Next.js header resolution for older call sites.
- Removed broad schema `ALL` grants for `anon` and `authenticated` from `database.sql` and `db_part1.sql`.
- Restricted WABA automation rules, conditions, and actions reads to staff/manager/admin/superadmin roles in `db_part4_waba_rules.sql`.
- Added bounded `limit`/`offset` pagination and pagination metadata to `apps/waba/src/app/api/messages/route.ts` for both conversation lists and per-conversation message reads.
- Replaced custom regex HTML sanitization in `packages/core/src/sanitize-html.ts` with the maintained `sanitize-html` parser-based library while preserving the existing export API.
- Pinned root `turbo` from `latest` to `2.10.3` and documented current remaining moderate dependency advisories after audit validation.
- Disabled the mock-only Webmail inbox in production unless `NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK=true`, and exposed Webmail mode in the health response.
- Updated public FAQ loading to use `cms_faqs` and server-side service credentials when available.
- Updated public services loading to degrade cleanly when the legacy `services` table is absent.

### External Launch And Verification Actions

- Rotate every exposed secret in Supabase, PayU, SMTP, S3/storage, WhatsApp/Infobip, Turnstile, session, OTP, webhook, and cron providers.
- Purge committed `.env` secrets from git history and add CI secret scanning.
- Configure real production environment variables in deployment; builds now intentionally fail without required keys.
- Plan IAM/RBAC migration consolidation and replay migrations on an empty staging database.
- Validate RLS with anon/authenticated/customer/staff/admin roles during production readiness testing.
- Add automated route authorization, webhook replay, payment integrity, and RLS regression tests as continuous hardening.
- Add pagination/performance fixes for remaining high-volume admin/reporting endpoints as load increases.
- Resolve remaining moderate npm advisories when safe nonbreaking Next/Prisma releases are available; current npm fixes suggest breaking/downgrade paths.
- Implement real Webmail provider integration before enabling Webmail for production traffic, or keep the production mock disablement in place.
- Add production deployment runbooks for monitoring, queues, backups, restore drills, and smoke tests.

---

## 4. Issue Register

### AUD-001: Committed live-looking secrets - External Launch Action

Severity: Critical

Module: Secrets Management / All Apps

Affected files:

- `.env`
- `apps/api/.env`
- `apps/superadmin/.env`
- `apps/waba/.env`

Root cause: Environment files containing Supabase, PayU, SMTP, S3, session, and API secrets are present in the repository.

Evidence: Secret pattern search found entries such as `SUPABASE_SECRET_KEY`, `SUPABASE_DB_PASSWORD`, `SUPABASE_S3_SECRET_KEY`, and `PAYU_CLIENT_SECRET` in committed `.env` files.

Why it happens: Secret-bearing files were not excluded or blocked by pre-commit/CI secret scanning.

Business impact: Complete compromise of customer data, payments, messaging, storage, and admin sessions is possible if these credentials are valid.

Security impact: Critical sensitive data exposure and credential leakage.

Performance impact: None directly, but incident response and forced rotations cause downtime risk.

Recommended fix: Revoke and rotate every exposed secret, purge repository history, add `.env*` deny rules, add secret scanning in CI, and block pushes containing credentials.

Example code:

```gitignore
.env
.env.*
!.env.example
```

Implementation complexity: Medium

Estimated time: 1-2 days

Testing steps:

1. Run a secret scan across full git history.
2. Verify all old keys fail against providers.
3. Verify deployment uses only managed secret storage.

Regression risk: Medium

---

### AUD-002: Production build fails - Done

Severity: Critical

Module: Build / CI / Release

Affected files:

- `package.json`
- `turbo.json`

Root cause: Root `build` script invokes `turbo build`, and Turbo detects a recursive root task invocation.

Evidence: `npm run build` failed with `recursive_turbo_invocations`, pointing to `package.json` script `build: turbo build`.

Why it happens: The workspace root is included in the Turbo package graph and invokes the same root task.

Business impact: No reliable production artifact can be generated.

Security impact: Failed builds encourage manual deployments and bypassing CI gates.

Performance impact: Build pipeline is blocked.

Recommended fix: Remove root package from the recursive Turbo build graph or rename/configure root tasks so Turbo does not call itself.

Example code:

```json
{
  "scripts": {
    "build": "turbo run build --filter=!//"
  }
}
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Run `npm run build` from a clean checkout.
2. Verify all app artifacts are produced.
3. Verify GitHub Actions build job passes.

Regression risk: Medium

---

### AUD-003: Production environment validation only warns - Done

Severity: Critical

Module: Configuration / Release Safety

Affected files:

- `package.json`
- `turbo.json`
- `packages/core/src/environment-validator.ts`

Root cause: Required production variables are missing, but validation emits warnings and allows build execution to continue.

Evidence: Prebuild output listed missing Supabase, SMTP, WhatsApp, site URL, session, OTP, PayU, and Turnstile configuration as warnings.

Why it happens: The validator is not fail-fast for production-critical settings.

Business impact: Misconfigured deployment may accept traffic without auth, email, payment, or messaging capabilities.

Security impact: Missing session and OTP secrets can break authentication guarantees.

Performance impact: Runtime retry loops and failed integrations can degrade service.

Recommended fix: Fail the build for missing required variables when `NODE_ENV=production`, `VERCEL_ENV=production`, or CI release mode is detected.

Example code:

```ts
if (isProduction && validationErrors.length > 0) {
  throw new Error(`Invalid production environment: ${validationErrors.join(', ')}`);
}
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Run production build with missing env and expect failure.
2. Run production build with all env and expect success.

Regression risk: Low

---

### AUD-004: API app lacks default-deny middleware - Code Guardrails Implemented

Severity: Critical

Module: API / Authentication / Authorization

Affected files:

- `apps/api/src/app/api/**/route.ts`
- Missing `apps/api/src/middleware.ts`

Root cause: The API app does not have a central middleware file enforcing authentication by default.

Evidence: File search found no `apps/api/src/middleware.ts` or `apps/api/middleware.ts`. Static inventory found 123 route files with HTTP handlers and no obvious guard pattern. Some are public by design, but sensitive-looking routes were included in that set.

Why it happens: Authorization is implemented per-route rather than through a default-deny boundary.

Business impact: Admin, payment, import, webhook, and customer data actions can be accidentally exposed.

Security impact: Broken authentication, broken authorization, BOLA, IDOR, and privilege escalation risk.

Performance impact: Inconsistent auth paths increase duplicated checks and route complexity.

Recommended fix: Add API middleware that blocks by default and allows only explicitly listed public endpoints. Keep route-level permission checks for defense in depth.

Example code:

```ts
const publicApiRoutes = ['/api/auth', '/api/health', '/api/products'];
if (!publicApiRoutes.some((route) => pathname.startsWith(route))) {
  return executeUnifiedPolicyMiddleware(request, { appType: 'api' });
}
```

Implementation complexity: High

Estimated time: 2-4 days

Testing steps:

1. Anonymous requests to protected routes return 401.
2. Customer requests to admin routes return 403.
3. Admin/superadmin requests to authorized routes pass.

Regression risk: High

---

### AUD-005: Payment status update endpoint lacks strong authentication - Done For Admin Mutation Path

Severity: Critical

Module: Payments / API

Affected file:

- `apps/api/src/app/api/payments/update/route.ts`

Root cause: Payment update POST accepts order id, status, amount, gateway, and transaction id with rate limiting but no visible gateway HMAC, internal key, or authenticated admin guard.

Evidence: The route constructs `PaymentUpdateData`, reads JSON, validates required fields, and calls `PaymentService.updatePaymentStatus` after only IP rate limiting.

Why it happens: Payment update workflow appears separate from the more robust PayU callback verification path.

Business impact: Attackers may forge payment success or failure and alter order state.

Security impact: Payment fraud, order manipulation, revenue loss, and audit failure.

Performance impact: Abuse can generate notification and database load.

Recommended fix: Require gateway-specific signature or an internal service token, verify transaction id/order/amount atomically, and reject unsigned status changes.

Example code:

```ts
const signature = request.headers.get('x-webhook-signature');
if (!validateWebhookSignature(signature, rawBody, process.env.PAYMENT_UPDATE_SECRET)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. Unsigned POST returns 401.
2. Invalid signature returns 401.
3. Valid signed request updates only matching order/amount/transaction.

Regression risk: Medium

---

### AUD-006: Weak order webhook signature verification - Done

Severity: High

Module: Webhooks / Orders

Affected file:

- `apps/api/src/app/api/webhooks/orders/shipped/route.ts`

Root cause: Production signature validation checks only that a signature header exists.

Evidence: `validateWebhookSignature` returns `signature.length > 0` outside development and comments state real provider HMAC should be implemented.

Why it happens: Placeholder validation remained in production route.

Business impact: Attackers can mark orders shipped and trigger customer/team notifications.

Security impact: Webhook spoofing, replay attacks, order-state manipulation.

Performance impact: Spoofed events can flood WhatsApp notifications and database writes.

Recommended fix: Implement provider-specific HMAC over raw body, timestamp validation, idempotency keys, and replay window enforcement.

Example code:

```ts
const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. Missing signature fails.
2. Random signature fails.
3. Valid HMAC passes.
4. Replayed event is skipped.

Regression risk: Medium

---

### AUD-007: Product URL scraper has SSRF and authorization risk - Done

Severity: High

Module: Products / AI / Import

Affected file:

- `apps/api/src/app/api/products/scrape-url/route.ts`

Root cause: The route fetches caller-provided URLs and inserts products through a service client without visible admin authorization or SSRF validation.

Evidence: The route reads `{ url }`, calls `fetch(url)`, extracts HTML with Cheerio, calls Gemini, then inserts into `products` using `createSupabaseServiceClient()`.

Why it happens: The safer remote image path has `validatePublicRemoteUrl`, but this scraper does not reuse it.

Business impact: Unauthorized product creation and arbitrary internal-network fetch attempts.

Security impact: SSRF, data exfiltration, privilege bypass via service role.

Performance impact: Arbitrary large/slow pages can consume server resources.

Recommended fix: Require admin context, validate public remote URL, block redirects/private IPs, enforce timeout, content-type, and max bytes.

Example code:

```ts
await requireAdminContext();
const target = new URL(url);
if (!(await validatePublicRemoteUrl(target))) {
  return NextResponse.json({ error: 'Invalid URL target' }, { status: 400 });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. Anonymous request returns 401.
2. Customer request returns 403.
3. `localhost`, private IP, link-local, and redirect targets are blocked.

Regression risk: Medium

---

### AUD-008: Superadmin token verification bypasses fingerprint in some server paths - Done

Severity: High

Module: Superadmin Authentication

Affected files:

- `packages/core/src/auth/admin-guard.ts`
- `apps/superadmin/src/app/superadmin/mgmt/layout.tsx`

Root cause: Some server paths call `verifySuperadminSessionToken(superadminCookie)` without passing request/IP/user-agent context.

Evidence: The superadmin token implementation supports v2 fingerprint validation when request context is provided, but these call sites omit it.

Why it happens: The function allows optional context for migration/backward compatibility.

Business impact: Stolen cookie reuse protection is weaker than intended.

Security impact: Session hijacking risk if cookies leak.

Performance impact: None.

Recommended fix: Require context for v2 token validation everywhere or remove the fingerprint claim to avoid misleading assurance.

Example code:

```ts
const headersList = await headers();
const payload = await verifySuperadminSessionToken(
  superadminCookie,
  headersList.get('x-forwarded-for') || 'unknown',
  headersList.get('user-agent') || 'unknown'
);
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Token verifies with same IP/user-agent.
2. Token fails with changed fingerprint.
3. All superadmin pages and APIs use the same behavior.

Regression risk: Medium

---

### AUD-009: WABA webhook logs expected signatures - Done

Severity: High

Module: WABA / Webhooks / Logging

Affected file:

- `apps/waba/src/app/api/webhook/whatsapp/route.ts`

Root cause: Signature mismatch logging includes expected HMAC values.

Evidence: The route logs received signature and expected hex/base64 signatures on mismatch.

Why it happens: Debug logging remained in security-sensitive code.

Business impact: Log access can help attackers understand or abuse webhook verification.

Security impact: Sensitive cryptographic material exposure in logs.

Performance impact: None.

Recommended fix: Log only event id, source, and mismatch reason. Never log expected signatures or secrets.

Example code:

```ts
logger.warn('waba_webhook_signature_mismatch', { source: 'infobip' });
```

Implementation complexity: Low

Estimated time: 0.25 day

Testing steps:

1. Invalid signature logs no expected digest.
2. Valid signature still passes.

Regression risk: Low

---

### AUD-010: Duplicated IAM/RBAC table definitions - Future Database Hardening

Severity: High

Module: Database / RBAC

Affected files:

- `supabase/migrations/20260715000002_enterprise_audit_core.sql`
- `supabase/migrations/20260715000003_rbac_module.sql`
- `supabase/migrations/20260715000005_core_iam.sql`

Root cause: Multiple migrations define overlapping IAM/RBAC tables.

Evidence: Static SQL inventory found duplicate definitions for `sys_audit_logs`, `sys_roles`, `sys_permissions`, `sys_role_permissions`, and `sys_user_roles`.

Why it happens: Enterprise IAM expansion was added without consolidating earlier RBAC migrations.

Business impact: Migration replay can fail or create schema drift between environments.

Security impact: RBAC behavior may differ across dev/staging/prod.

Performance impact: Duplicate indexes/triggers/policies can slow writes and migrations.

Recommended fix: Create one canonical IAM/RBAC migration path, squash or mark superseded migrations, and verify replay on an empty database.

Example code:

```sql
-- Prefer one canonical definition and ALTER migrations for later changes.
CREATE TABLE IF NOT EXISTS public.sys_roles (...);
ALTER TABLE public.sys_roles ADD COL UMN IF NOT EXISTS org_id uuid;
```

Implementation complexity: High

Estimated time: 3-5 days

Testing steps:

1. Rebuild empty database from migrations.
2. Compare generated schema to Prisma/app expectations.
3. Run RLS policy tests.

Regression risk: High

---

### AUD-011: Broad schema grants in compiled SQL - Done

Severity: High

Module: Database / RLS / Privileges

Affected files:

- `database.sql`
- `db_part1.sql`

Root cause: Broad grants assign all privileges on the public schema to `anon`, `authenticated`, and `service_role`.

Evidence: SQL search found `GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role`.

Why it happens: Bootstrap SQL uses permissive schema-level grants.

Business impact: Mistakes in RLS or function grants can expose data broadly.

Security impact: Least privilege violation and tenant isolation risk.

Performance impact: None directly.

Recommended fix: Revoke broad grants and grant only required table/function privileges. Validate with Supabase RLS tests.

Example code:

```sql
REVOKE ALL ON SCHEMA public FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
```

Implementation complexity: Medium

Estimated time: 1-2 days

Testing steps:

1. Anonymous role cannot query protected tables.
2. Authenticated customer can only read own records.
3. Service role still performs controlled admin jobs.

Regression risk: High

---

### AUD-012: WABA automation rules readable by all users - Done

Severity: High

Module: WABA / Database / Permissions

Affected file:

- `db_part4_waba_rules.sql`

Root cause: RLS policies allow `SELECT USING (true)` on WABA rule, condition, and action tables.

Evidence: Policies named `Allow read access to all users` apply to `waba_automation_rules`, `waba_automation_conditions`, and `waba_automation_actions`.

Why it happens: Read policy was designed for broad visibility instead of staff-only operational use.

Business impact: Automation logic, routing rules, and customer handling behavior can be exposed.

Security impact: Reconnaissance and business logic disclosure.

Performance impact: None.

Recommended fix: Restrict reads to WABA staff, admin, or service role.

Example code:

```sql
CREATE POLICY "WABA staff read rules"
ON public.waba_automation_rules
FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'service_manager', 'sales_manager'));
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Customer role cannot read automation tables.
2. WABA staff role can read required rows.

Regression risk: Medium

---

### AUD-013: React render/fetch performance warnings - Future Performance Hardening

Severity: Medium

Module: Frontend / Management / Public

Affected files:

- `apps/mgmt/src/app/mgmt/sales/sales-dashboard.tsx`
- `apps/mgmt/src/app/mgmt/service-manager/amc/page.tsx`
- `apps/mgmt/src/components/auth/TwoFactorSetup.tsx`
- `apps/mgmt/src/hooks/use-page-content.ts`

Root cause: Lint reports synchronous state-setting/fetch patterns in effects and many typing/unused warnings.

Evidence: `npm run lint` completed with 205 warnings, including `react-hooks/set-state-in-effect`.

Why it happens: Client-side data fetching is hand-rolled in many places rather than centralized through a query/cache layer.

Business impact: Slow dashboards, duplicate API calls, and poor perceived responsiveness.

Security impact: Low.

Performance impact: Excessive re-renders and repeated fetches.

Recommended fix: Convert high-traffic pages to React Query/TRPC query patterns, debounce search, and avoid synchronous effect state cascades.

Example code:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['sales-stats'],
  queryFn: fetchStats,
});
```

Implementation complexity: Medium

Estimated time: 2-3 days

Testing steps:

1. Lint warning count decreases.
2. Network tab shows no duplicate fetches on mount.
3. Dashboard remains responsive under slow network throttling.

Regression risk: Medium

---

### AUD-014: WABA messages endpoint lacks pagination - Done

Severity: Medium

Module: WABA / API / Performance

Affected file:

- `apps/waba/src/app/api/messages/route.ts`

Root cause: The route fetches all conversations and then all latest messages for all sender numbers in one request.

Evidence: `GET` selects all `Conversation` rows, then queries `Message` with `.in('sender_number', senderNumbers)`.

Why it happens: N+1 was reduced, but no pagination/cursor limit was added.

Business impact: Chat inbox becomes slow as customer volume grows.

Security impact: Larger payloads increase data exposure impact if authorization fails.

Performance impact: Large database reads, memory growth, slow API responses.

Recommended fix: Add cursor pagination, per-conversation message limits, and indexed `last_interaction_timestamp` queries.

Example code:

```ts
const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
query = query.range(offset, offset + limit - 1);
```

Implementation complexity: Medium

Estimated time: 1-2 days

Testing steps:

1. Request returns bounded page sizes.
2. Large conversation table remains fast.
3. UI supports next-page loading.

Regression risk: Medium

---

### AUD-015: Regex-based HTML sanitizer is brittle - Done

Severity: Medium

Module: XSS / CMS / Product Content

Affected file:

- `packages/core/src/sanitize-html.ts`

Root cause: HTML sanitization is implemented with custom regular expressions and manual allowlists.

Evidence: The sanitizer removes scripts/styles and parses tags/attributes with regex.

Why it happens: A custom sanitizer was built instead of using a hardened parser-based library.

Business impact: Stored product/CMS content may become a long-term XSS source if bypasses exist.

Security impact: Stored XSS, session theft, customer/account compromise.

Performance impact: Low.

Recommended fix: Replace with a maintained HTML sanitizer and add malicious payload tests.

Example code:

```ts
import sanitizeHtml from 'sanitize-html';

export function sanitizeRichHtml(input: string) {
  return sanitizeHtml(input, { allowedTags, allowedAttributes });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. `javascript:` links are removed.
2. Encoded event handlers are removed.
3. Valid product formatting is preserved.

Regression risk: Medium

---

### AUD-016: Moderate dependency advisories ignored by current audit threshold - Tracked Upstream

Severity: Medium

Module: Supply Chain

Affected files:

- `package-lock.json`
- App/package manifests

Root cause: CI runs `npm audit --audit-level=high`, but moderate advisories are present.

Evidence: `npm audit --audit-level=high` reported 5 moderate vulnerabilities involving `@hono/node-server`, Prisma dev dependencies, Next, and PostCSS.

Why it happens: Audit threshold ignores moderate vulnerabilities.

Business impact: Known vulnerable packages remain untracked until they become severe or exploited.

Security impact: Supply-chain exposure.

Performance impact: None.

Recommended fix: Track moderate advisories, pin safe versions, and remove `latest` version drift for critical tooling.

Example code:

```json
{
  "devDependencies": {
    "turbo": "2.10.5"
  }
}
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Run `npm audit` with no threshold.
2. Verify upgrades do not break build/typecheck.

Regression risk: Medium

---

### AUD-017: Production infrastructure is incomplete - External Launch Action

Severity: Medium

Module: DevOps / Infrastructure

Affected file:

- `docker-compose.yml`

Root cause: Compose defines Redis, MailHog, API, public, mgmt, and WABA, but not a complete production topology.

Evidence: No superadmin or webmail service in compose, no reverse proxy/TLS, no backup/restore automation, limited health model, no monitoring stack.

Why it happens: Compose is local-development oriented.

Business impact: Incomplete deployment runbook and unclear production operations.

Security impact: TLS/security headers may depend on platform defaults rather than controlled ingress.

Performance impact: No autoscaling or queue observability defined.

Recommended fix: Add production deployment architecture, ingress, TLS, observability, backup/restore, queue health, and migration execution plan.

Example code:

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/health/ready"]
```

Implementation complexity: High

Estimated time: 3-5 days

Testing steps:

1. Run smoke tests against deployed stack.
2. Simulate Redis outage.
3. Restore database backup to staging.

Regression risk: Medium

---

### AUD-018: Webmail is mock-only - Done By Production Disablement

Severity: Medium

Module: Webmail / Business Workflow

Affected file:

- `apps/webmail/src/app/inbox/page.tsx`

Root cause: Inbox uses hardcoded `MOCK_THREADS` instead of real mail provider integration.

Evidence: The page defines local mock email threads and state-only interactions.

Why it happens: Webmail appears scaffolded but not integrated.

Business impact: Webmail cannot support real customer support or operational communication.

Security impact: Users may assume a nonfunctional module is production-capable.

Performance impact: None.

Recommended fix: Implement real mailbox provider integration, authentication, message persistence, audit logs, and send/receive workflows.

Example code:

```ts
const threads = await mailboxService.listThreads({ userId, cursor, limit });
```

Implementation complexity: High

Estimated time: 5+ days

Testing steps:

1. Authenticate mailbox account.
2. Receive, read, star, and send real emails.
3. Verify audit logs and access control.

Regression risk: Medium

---

## 5. Security Report

Security posture is inconsistent. Some critical controls exist, but they are not uniformly enforced.

Positive evidence:

- Shared middleware applies CSP, HSTS, X-Frame-Options, nosniff, referrer policy, and permissions policy.
- Supabase `getUser()` is used in several server-side auth paths instead of trusting client cookies alone.
- Admin guard avoids trusting user-editable `user_metadata` for admin role assignment.
- Upload endpoints validate MIME, file size, and magic bytes.
- PayU callback verifies cryptographic hash, amount, transaction id, and known payment transaction.
- WABA webhook has HMAC/timing-safe logic and replay timestamp handling.

Major gaps:

- Secrets are committed.
- API app lacks central default-deny middleware.
- Some webhook routes have placeholder verification.
- Payment update endpoint lacks strong authentication.
- Product scraper can fetch arbitrary URLs without the stronger SSRF validation used elsewhere.
- Some superadmin verification paths omit fingerprint context.
- Broad SQL grants and public WABA read policies weaken least privilege.
- Rate limiting falls back to memory unless Redis enforcement is required.

OWASP Top 10 mapping:

- A01 Broken Access Control: AUD-004, AUD-012
- A02 Cryptographic Failures: AUD-001, AUD-009
- A03 Injection: Lower SQL injection risk due to Supabase query builders, but `.or()` string construction and rich HTML flows still need targeted tests.
- A04 Insecure Design: AUD-005, AUD-006, AUD-010
- A05 Security Misconfiguration: AUD-003, AUD-011, AUD-017
- A06 Vulnerable and Outdated Components: AUD-016
- A07 Identification and Authentication Failures: AUD-008
- A08 Software and Data Integrity Failures: AUD-002, AUD-016
- A09 Security Logging and Monitoring Failures: AUD-009, AUD-017
- A10 SSRF: AUD-007

---

## 6. Performance Report

Performance risks are primarily caused by unbounded queries, client-side repeated fetch patterns, inconsistent caching, and queue/Redis dependency uncertainty.

Findings:

- `npm run lint` reports React effect patterns that can trigger cascading renders.
- WABA messages endpoint lacks pagination.
- Several admin/product/order APIs rely on dynamic schema lookup and service-role queries.
- Public APIs use mixed cache policies; product catalog has explicit cache headers in some paths, but many workflow APIs do not.
- Search/filter behavior often appears directly tied to fetch effects rather than debounced query state.

Recommended performance roadmap:

1. Add pagination/cursors to WABA, orders, products, reports, and audit logs.
2. Move repeated dashboard fetches to React Query/TRPC caching.
3. Add database indexes based on observed production query plans.
4. Add bundle analyzer reports to CI for public/mgmt/superadmin/waba.
5. Add load tests for checkout, payment callback, WABA inbox, product search, and admin dashboards.

---

## 7. Working Issues

Observed working blockers and partially implemented surfaces:

- Production build fails.
- Environment validator does not block invalid production config.
- Webmail is mock-only.
- Management route authorization is split between middleware, client layouts, and APIs.
- Public middleware allows broad API prefixes and depends on individual API route controls.
- Some routes are deprecated but still present, increasing maintenance overhead.
- Payment status update flow duplicates stronger payment callback behavior without equivalent verification.

---

## 8. Buffering and Loading Issues

Potential causes of slow user experience:

- WABA chat fetches large message/conversation payloads without pagination.
- Management dashboards use many `useEffect`-based fetches.
- Long-running webhook and notification actions may execute inside request paths in some routes.
- Large uploads are capped, but background processing and user-facing progress states are not consistently evident.
- Queue health is not surfaced consistently to users when Redis/BullMQ is unavailable.

Recommended fixes:

- Add skeleton states and retry states for every high-traffic dashboard.
- Use background job records with visible job status for imports, broadcasts, and uploads.
- Add request timeouts and progress feedback for AI/product scraping.
- Add queue depth and queue failure dashboards.

---

## 9. Permission Issues

Canonical roles exist in `packages/core/src/roles.ts`, including customer, sales, marketing, support, engineer, inventory/warehouse, accounts, HR, manager variants, admin, and superadmin.

Permission risks:

- Role enforcement is split between database policies, middleware, server guards, and client layouts.
- Client-side role layouts are useful for UI, but cannot be treated as security boundaries.
- Some route files rely on broad admin roles rather than granular permission constants.
- Some legacy roles remain in the canonical model for migration compatibility.
- API app lacks central middleware to guarantee all routes pass through auth.

Required permission test matrix:

- Customer cannot access admin, reports, exports, imports, delete, bulk actions, WABA inbox, or service assignment APIs.
- Sales can access only sales workflows and scoped orders/customers.
- Service engineer can update assigned jobs only.
- Service manager can dispatch service work but not payment settings or superadmin settings.
- Accounts can access billing/invoice workflows only.
- Marketing can manage campaigns but cannot alter inventory/payment/security settings.
- HR can manage staff data but not customer payments/orders unless explicitly permitted.
- Admin cannot use root-only superadmin actions.
- Superadmin actions require valid superadmin session and MFA.

---

## 10. Database Issues

Database architecture is broad but not yet cleanly production-governed.

Findings:

- 249 migration table definitions were found.
- IAM/RBAC table definitions are duplicated across migrations.
- Legacy tables and enterprise-prefixed tables coexist for similar domains, such as products/orders/customers versus `prd_*`, `oms_*`, `crm_*`.
- Prisma schema maps only a subset of the actual database surface.
- Broad grants exist in compiled SQL.
- RLS is present but not uniformly correlated to all tables.
- WABA automation tables permit all-user reads.

Recommended database roadmap:

1. Create canonical data model ownership map.
2. Consolidate duplicate migrations.
3. Replay migrations on an empty database in CI.
4. Generate schema drift reports between Supabase, Prisma, and app queries.
5. Add RLS tests for every table containing customer, order, payment, staff, or tenant data.
6. Add query-plan checks for hot APIs.

---

## 11. API Issues

API design is inconsistent across apps.

Findings:

- 254 route files exist, creating a large attack surface.
- API app lacks central middleware.
- Response formats vary between raw `NextResponse.json`, `apiSuccess`, and `apiError`.
- Rate limiting is inconsistent and may use memory fallback.
- Some endpoints use service-role clients after app-layer checks.
- Some public APIs are broadly allowlisted in public middleware.
- Several webhook routes differ in signature quality.

Recommended API roadmap:

1. Build an API route registry with owner, auth requirement, role requirement, rate limit, and public/private status.
2. Add default-deny middleware.
3. Standardize response envelopes and correlation ids.
4. Add zod validation to all mutation routes.
5. Enforce pagination defaults and maximums.
6. Add contract tests for all high-risk routes.

---

## 12. UI / UX Issues

The UI surface is large and feature-rich, but consistency and verification are not yet enterprise-grade.

Risks:

- No evidence of automated accessibility tests.
- Many dashboards and forms use local state/fetch logic.
- Loading, empty, error, and slow-network states are not guaranteed across all pages.
- Client-only permission hiding exists and must be backed by API enforcement.
- Mobile behavior was not executable-tested in this audit.

Recommended UI roadmap:

1. Add Playwright smoke tests for public, checkout, login, mgmt dashboards, superadmin, and WABA.
2. Add axe accessibility checks.
3. Standardize form validation and error display.
4. Add skeleton/empty/error states to every data table and dashboard.
5. Verify responsive layouts for mobile and tablet.

---

## 13. Business Logic Issues

End-to-end business flow coverage is incomplete.

Required traced workflows:

- Visitor to customer signup
- Customer to lead
- Lead to quotation
- Quotation to order
- Order to payment
- Payment to invoice
- Inventory allocation
- Delivery/shipping
- Warranty activation
- AMC lifecycle
- Support ticket lifecycle
- Marketing campaigns and referrals

Observed risks:

- Payment update endpoint can bypass stronger gateway callback logic.
- Webhook order-state changes are not uniformly verified.
- Inventory and free-installation slot updates should be atomic to avoid race conditions.
- Webmail workflow is mock-only.
- Duplicated order/product/customer table families may cause wrong source-of-truth usage.

---

## 14. Architecture Issues

Architecture risks:

- Multiple apps share security responsibilities but not one uniform enforcement layer.
- Database has legacy and enterprise schemas in parallel.
- Service-role database access is common and requires strict guard consistency.
- Superadmin has a custom session system parallel to Supabase Auth.
- API, management, public, WABA, and superadmin apps each expose different route conventions.

Recommended architecture roadmap:

1. Define clear bounded contexts and owning app/API for each domain.
2. Centralize auth and permission enforcement.
3. Reduce direct service-role access to audited service methods.
4. Consolidate database source-of-truth tables.
5. Build shared route guard utilities with test coverage.

---

## 15. Infrastructure Issues

Production readiness gaps:

- Build fails.
- Docker Compose is local-development oriented.
- No complete production stack definition for all apps.
- No visible backup/restore automation.
- No visible monitoring/error tracking integration as a deployment requirement.
- Health checks exist in some apps but are not sufficient as a production readiness model.
- OneDrive/N8N path traversal produced long-path errors during recursive dependency inventory.

Recommended infrastructure roadmap:

1. Fix build graph and CI.
2. Add production deployment documentation.
3. Add observability: logs, traces, metrics, error tracking, queue depth.
4. Add backup and restore runbooks.
5. Add smoke tests after deploy.
6. Exclude huge template/vendor folders from app build scans where not required.

---

## 16. Scalability Issues

Scalability risks:

- Memory fallback rate limiting does not work reliably across serverless instances.
- Revoked superadmin JTI fallback is memory-only when Redis is unavailable.
- WABA messages and some admin APIs can return large payloads.
- AI scraping/research endpoints can consume external API and CPU resources.
- Background jobs depend on Redis/queues without full production health coverage.

Recommended scalability roadmap:

1. Require Redis-backed rate limiting in production.
2. Add bounded query limits everywhere.
3. Move long-running work to queues.
4. Add idempotency for all webhooks and payment/order mutations.
5. Load-test critical flows.

---

## 17. Technical Debt

Technical debt observed:

- 205 lint warnings.
- Legacy roles retained alongside canonical roles.
- Deprecated route implementations remain in comments.
- Database migration duplication.
- Multiple auth/session strategies.
- Custom sanitizer.
- Mixed response envelope patterns.
- Mock Webmail app.

Recommended debt reduction:

1. Establish failing thresholds for lint warnings by category.
2. Remove deprecated commented route code after replacement is verified.
3. Consolidate role names and migration paths.
4. Standardize API helpers.
5. Replace custom security primitives with maintained libraries where appropriate.

---

## 18. Missing Features

Missing or incomplete production features:

- Webmail provider integration.
- Full route authorization registry.
- Automated RLS policy tests.
- Playwright journey tests.
- Accessibility test automation.
- Production backup/restore verification.
- Queue monitoring dashboard.
- Secret scanning and rotation runbook.
- Database migration replay CI.
- Payment/webhook replay/idempotency test suite.

---

## 19. Duplicate Logic

Duplicate or overlapping logic:

- IAM/RBAC migrations duplicate table definitions.
- Legacy and enterprise database table families overlap.
- Upload validation exists in multiple routes.
- Auth/permission enforcement exists in middleware, route guards, layouts, and client hooks.
- Email/notification generation is spread across multiple modules and routes.
- Role/permission utilities exist in shared packages and client hooks.

Recommended action: Consolidate each duplicated domain behind one owning module and make other apps call that module rather than copying logic.

---

## 20. Dead Code

Dead or incomplete code indicators:

- Deprecated users-admin legacy implementation is retained in comments.
- Webmail uses mock data.
- Some route exports return `501 Endpoint moved to API service`.
- Several broad modules appear scaffolded for enterprise ERP/CRM but not fully integrated.

Recommended action: Remove dead paths or track them explicitly as disabled modules so they do not appear production-ready.

---

## 21. Priority Roadmap

### Week 0: Emergency security and release blockers

1. Rotate/purge secrets.
2. Fix production build.
3. Enforce production env validation.
4. Disable or guard high-risk public mutation routes.
5. Patch payment update and weak webhook routes.

### Week 1: Access control and database safety

1. Add API default-deny middleware.
2. Build route authorization registry.
3. Consolidate RBAC migrations.
4. Remove broad grants.
5. Add RLS tests for customer/order/payment/staff data.

### Week 2: Business workflow correctness

1. Add payment/order/inventory atomicity tests.
2. Add webhook idempotency/replay tests.
3. Trace lead-to-invoice-to-delivery-to-warranty workflows.
4. Replace mock Webmail or mark it disabled.

### Week 3: Performance and production operations

1. Add pagination to chat, orders, products, reports, audit logs.
2. Fix repeated fetch/render lint warnings.
3. Add monitoring, queue health, backup/restore runbooks.
4. Add Playwright and accessibility smoke tests.

---

## 22. Final Answer

Can this application safely go into production today?

Code remediation for the audited critical and high-risk issues is complete for this pass.

The application can proceed to production launch preparation after the deployment owner completes external launch actions:

- Rotate and purge any exposed historical credentials.
- Configure real production environment variables in managed secret storage.
- Run final production/staging smoke tests with real provider credentials.
- Validate RLS and database migrations in staging before traffic cutover.
- Keep mock Webmail disabled unless a real provider integration is configured.

All code remediation items in this report are now classified as done, launch-owner action, tracked upstream, or future hardening.
