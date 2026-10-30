# Production frontend release — 29 October 2026

The user authorized production deployment and asked to retain the current Turnstile
configuration. Vercel email verification was completed through the owner's signed-in
Gmail and the existing Vercel deployment challenge. No verification code is retained
in this document or release artifacts.

All four releases rebuild the tested revision
`80173d881c5f774c4b94910f24bbb1b4f279bb0c` with their existing **Production**
environment variables and configured domains. This revision has the same application
tree as the repaired API application revision `91e5a86367313d4941658d98c6bace2f1ca6f075`.
This was an explicitly authorized manual operational rollout; it does not establish
that the strict readiness gate or blocked GitHub Actions jobs passed.

## Deployment inventory

| Project | New production deployment | Previous production rollback target | Status |
|---|---|---|---|
| superadmin | `HqSy33X6ew6gqUQyHigk7aXi6pBB` | `HCuT69yP14fLxENe33LeBA3jE9fN` | Ready; admin hostname assigned |
| mgmt | `AzhJbVWT9iAXitARAzVzkoftEWMe` | `72tux34fSTomeimQJeU32hvH3SHZ` | Ready; staff hostname assigned |
| tecbunny | `Dro25mv44oB9wgrroKKyHYZqGHi1` | `5tX8DPXV1eS7f9doXVP1szNqWU8x` | Ready; storefront hostname assigned |
| waba | `AN5gF6bNyYx6wuiBE6D6qDFypkWn` | `FqVJDcWrfxYXhpJrExrcmJchgh7x` | Ready; WABA hostname assigned |

Deployment dashboard URLs use
`https://vercel.com/shubhams-projects-01ac439e/<project>/<deployment>`.
The preceding production targets were observed in the team dashboard before promotion.
Existing deployments are retained for rollback; no production deployment was deleted.

## Verification boundaries

All four deployments reached Ready with Production environment and their configured
domains. At 09:56:33 IST, ten external checks passed: storefront and apex redirect,
sitemap XML, both admin login hostnames, staff login, WABA, API health and blog, and
anonymous admin denial. Public health remained redacted and no-store. These establish availability
and anonymous denial only; they do not establish authenticated role or tenant
isolation, provider delivery, recovery, or 100-user capacity.

The storefront build also logged a nonfatal blueprint sitemap fetch error. A separate
eleventh HTTP check confirmed `/api/v1/blueprints` still returns 502. A read-only
Supabase probe showed that the requested columns exist and the server client can
select them, but the browser role receives PostgreSQL `42501` permission denied.
The list handler incorrectly used that browser client. This is recorded as a failed
check, not hidden by the Ready deployment status. The separately tested API repair
was subsequently deployed: blueprints now return 200 with only IDs/timestamps, and
all 11 external checks passed at 10:14:23 IST. See
`docs/production-blueprint-repair-2026-10-29.md`; no database grants were widened.

The API repair remains recorded in
`docs/production-local-release-2026-10-29.md` and
`docs/production-api-live-2026-10-29.json`. No additional API replacement, database
migration, customer write, provider send, DNS change or credential rotation was part
of this frontend promotion.

## Rollback and remaining gate

If a new frontend fails its public smoke checks, select the project's recorded
preceding production deployment in Vercel and use its production rollback action,
then repeat the affected domain checks. Retain the repaired API unless its own
checks regress; its separate immutable-image rollback procedure remains in the API
release report.

Formal readiness remains **NO-GO** for the unresolved current authorization,
recovery, provider/alert and capacity evidence, exposed credential rotation and
existing audit/governance conditions. Deferring Turnstile rotation does not mark
that security finding fixed or establish acceptance of the other risks. GitHub
Actions remains blocked by its account billing lock.
