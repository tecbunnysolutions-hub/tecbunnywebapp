# Security remediation — 27 September 2026

This change set fixes authorization, payment-state and database-exposure defects found in a repository-wide review after the [25 September remediation](high-priority-remediation-2026-09-25.md). It changes application code and adds migrations; no production migration, deployment or configuration change was performed.

## What changed

| Area | Change |
| --- | --- |
| Password reset | Codes are delivered only to contact details stored on the matched account and are bound to that account; staff recover by email only. |
| Staff MFA | MGMT and WABA use Supabase Auth MFA (TOTP). Verifying a factor raises the session to AAL2, which the gateway, `requireAdminContext`, `requireApiRole` and tRPC all require for admin/superadmin. |
| Root (superadmin) login | All root login endpoints share one verifier with per-client, per-identifier and global attempt limits; an authenticator code is required once `SUPERADMIN_TOTP_SECRET` is set. Session tokens are v2-only and signed with a purpose-derived key. |
| Gateway | Public routes match exactly (`*` = one segment, `/**` = subtree). MGMT, superadmin and WABA admit staff roles only. CORS admits localhost only outside production and only the configured Chrome extension. MGMT renders dynamically and uses the nonce-only CSP. |
| Orders and payments | Order history uses `customer_id` plus verified contact details only. Part payments are validated server-side; PayU charges the outstanding balance and settlement marks orders `Partially Paid` until the total is covered. Clients cannot set a paid state or fractional quantities. Agent orders are priced by the checkout engine and never rewrite existing profiles. |
| Admin mutations | tRPC coupon/offer/page-content mutations require an admin. Transactional email endpoints require staff or the internal key. Several staff-data endpoints now check roles. |
| Quotes | Reads require ownership, an admin, the signed customer link or a verified matching contact. Counter-offers use MGMT's `countered` status end to end. |
| Database | Server-only functions are revoked from `anon`/`authenticated`; eleven tables created without RLS are locked to the service role; a trigger keeps role, tenant, activation, 2FA and B2B-pricing profile columns service-role only. |

## Deployment order

1. Apply, in order, `supabase/migrations/20260927000000_settlement_partial_payments.sql` and `supabase/migrations/20260927000001_restrict_privileged_access.sql`. Both are idempotent and skip objects that do not exist. `npm run test:security-migrations` exercises them against in-memory PostgreSQL.
2. Before applying the second migration, confirm no browser or user-token client writes the protected `profiles` columns in your deployment (the repository's code does not).
3. Configure environment variables (below), then deploy all apps together: the gateway, MGMT login and API guards must agree on AAL2.

## Configuration

| Variable | Purpose |
| --- | --- |
| `INTERNAL_API_KEY` | Required by server-to-server callers (post-delivery upsell, notifications, abandoned-cart reminders, cron-to-email calls). |
| `SUPERADMIN_TOTP_SECRET` | Base32 TOTP secret. When set, every root login requires an authenticator code. Strongly recommended. |
| `CHROME_EXTENSION_ID` or `CHROME_EXTENSION_ALLOWED_ORIGINS` | The TecBunny extension allowed by API CORS in production. |
| `TRUST_PROXY_HEADERS=true` | Only when a trusted proxy sets `X-Forwarded-For`; otherwise per-client limits fall back to a shared bucket (Cloudflare's `CF-Connecting-IP` is always used when present). |
| `REDIS_URL` | Makes rate limits and code single-use checks hold across instances. |

## Operational changes

- **Staff administrators must enroll an authenticator once.** After signing in, admins without a Supabase MFA factor are sent to `/mfa-setup`. Existing TecBunny custom TOTP enrollments are not migrated.
- The browser extension's admin (non-root) sign-in now requires an AAL2 session; use root login in the extension, or complete MFA first.
- Existing superadmin sessions are invalidated once (new signing key); sign in again.
- Accounts created from the quote page before this change may share a default password; consider forcing a reset for accounts created through that form.
- Cashfree credentials are managed via environment variables only; the runtime settings endpoint is read-only.
- Seller onboarding endpoints return 501 until a real implementation exists.

## Verification

Typecheck (16 workspaces), lint (including the shared UI packages, now part of the lint gate), all workspace tests, the architecture/API-boundary/DB-readiness validators and the migration harness pass. MGMT and the storefront build; all MGMT routes render dynamically. No live gateway charge, email, WhatsApp message or database migration was run.

## Not changed here

- The production base schema and RLS for core tables (`profiles`, `orders`, `coupons`, …) are not in this repository and could not be reviewed; export and commit them.
- PayU merchant settings are still read from the `settings` table before environment variables.
- Role resolution is still spread across several helpers with different precedence; consolidating them is a separate refactor.
- `apps/waba` still installs `xlsx` from `cdn.sheetjs.com`, which some networks block.
