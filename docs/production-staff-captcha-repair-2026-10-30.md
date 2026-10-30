# Staff login security-check repair — 30 October 2026

The management portal at `https://staff.tecbunny.com/auth/login` displayed a blocked
security check and could not complete the requested admin login. This is the regular
staff/admin portal; the separate `admin.tecbunny.com` hostname serves the root console.

## Evidence and cause

The actual production response contained a CSP whose `script-src` allowed only self,
inline scripts and Razorpay, and whose `frame-src` allowed only self and Razorpay.
Both omitted `https://challenges.cloudflare.com`. Browser logs reported the Turnstile
script load failure. The login page is excluded from the management proxy matcher,
so it receives the static Next config policy instead of the unified middleware policy
that already includes Cloudflare.

Cloudflare's official requirements are documented at
https://developers.cloudflare.com/turnstile/reference/content-security-policy/.

## Repair and acceptance

The change adds exactly `https://challenges.cloudflare.com` to the management
configuration's `script-src` and `frame-src`. Existing self/Razorpay sources and
object, framing, HSTS and other protections are retained. CAPTCHA verification is
not disabled, and no widget secret, site key, account password or database grant is
changed. The earlier request to defer secret rotation remains respected.

The regression executes the actual Next configuration and checks both complete
allowlists and retained `object-src 'none'`, `frame-ancestors 'none'` and
`X-Frame-Options: DENY`. It passed with:

`npx vitest run --config packages/core/vitest.config.ts apps/mgmt/next.config.test.ts`

`npm run typecheck --workspace=mgmt` also passed.

Source revision: `b1c0d5cdd16d9c872e5a9db6e3e92038853baf02`.
Vercel preview: `mgmt/5WrnXgjcFV5jJXQCMWm78iUc49Bh`.
Production deployment `mgmt/BWb8VFwnCvCwF7WUZZRXnpg3f7xL` reached Ready and was
assigned to `staff.tecbunny.com`. Its actual login response now includes Cloudflare
in both required directives, while retaining the other protections. The widget
initialized and the prior blocked-script error was no longer displayed. Targeted
ESLint checks also passed.

Acceptance requires a Ready production deployment, live headers allowing both vendor
resources, a loaded security widget without the CSP failure, and an actual observation
of the requested login result. Successful login alone does not establish the complete
role/tenant authorization matrix or change the broader readiness verdict.

## Account authorization and verified outcome

After the widget repair, the supplied credentials were accepted, but the management
portal correctly rejected the account as a customer. An exact read-only lookup
confirmed its profile role was `customer` and auth app metadata had no staff role.
No role guard was bypassed. The owner explicitly approved granting this one account
the regular Administrator role, separately from the earlier request to log in.

The approved update synchronized the profile and server-controlled auth metadata to
`admin`, preserving other metadata and the password. Before-state was saved under
an ignored local directory restricted to the current Windows user and SYSTEM. Both
role records were re-read and verified. Requested/applied security audit events were
recorded and read back using correlation ID
`d75897cf-054e-4d56-a213-6b2db29ded05`. No superadmin role was granted.

The initial audit intent failed before any role change because the legacy payload
used columns absent from the live table. Read-only schema inspection established
the canonical `risk_level` and `details` fields. The operator payload was corrected
and audited successfully before the approved role change. Existing role-management
handlers' legacy audit fields are a separate follow-up finding; no database schema
or grants were changed in this repair.

Normal browser sign-in then opened **Admin Dashboard** at
`https://staff.tecbunny.com/mgmt/admin`, with the Administrator workspace displayed.
This fixes the reported widget issue and verifies the requested regular admin login.
It supplies one actual customer-denial/Admin-allow observation, not a complete
authorization matrix. Account identity, password and session tokens are excluded
from published evidence. The sanitized receipt is
`docs/production-staff-login-verification-2026-10-30.json`.

The current production rollback target before this change is
`mgmt/AzhJbVWT9iAXitARAzVzkoftEWMe`. Retain it for availability rollback, while noting
that it reproduces the reported security-widget block. Other frontends and the API
are outside this deployment's replacement scope.
