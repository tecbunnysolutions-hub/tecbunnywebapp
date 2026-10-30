# Live API function audit

Authenticated superadmin login succeeded. No credential, session cookie or customer response payload is stored in this report.

## Coverage

The source catalogue contains 396 endpoint/method combinations across 287 route patterns. Checked 106 static read-only GET endpoints on https://api.tecbunny.com using the verified session. The other 290 combinations require dynamic fixtures or perform actions and were not executed against production. See endpoint-coverage.json for every catalogue entry.

| Result | Count | Interpretation |
|---|---:|---|
| HTTP 200 | 53 | Responded successfully; response failure flags were absent. This does not prove every business workflow. |
| HTTP 500/502/503 | 22 | Confirmed live server or upstream failures. |
| HTTP 400 | 16 | Missing request parameters; not automatically broken. |
| HTTP 401 | 10 | Customer/staff authentication or an inconsistent superadmin guard is required. |
| HTTP 404 | 4 | Three health subroutes intentionally require the internal API key; follow-up tasks reported no user record. |
| HTTP 410 | 1 | Intentionally retired endpoint. |

## Confirmed causes and repair priorities

1. Database connectivity: /api/permissions attempts PostgreSQL over IPv6 and returns ENETUNREACH. The failed Prisma request attempted an unreachable IPv6 database address. Check the production DATABASE_URL and use the project’s actual supported IPv4/pooler connection, then verify all Prisma-backed routes. No credentials or guessed pooler URL were substituted.
2. Missing schema: products.archived_at is absent, reproduced using a service-role zero-row column probe. Reconcile the archival migration with the production schema, including associated RPCs and audit records. Do not hide the error or remove history.
3. Database permissions: the communication-preferences view returns permission denied even to the service role. OTP exists and is readable by service role, while anonymous access is denied. The health handler uses a public/session client for these checks, so its OTP failure is not evidence that the OTP table is missing. Keep OTP private and use an appropriate server-side health probe.
4. Inconsistent server clients: quotes accepts the root session in requireAdmin but queries using the anonymous/session database client; the live response is permission denied. Resolve the verified role before choosing a privileged client. Do not globally disable RLS or grant anonymous access to private records.
5. Public data/schema contracts: FAQ and service tables deny anonymous reads. Blog base-table access works, so its failure requires investigation of selected columns and profile joins. Public policies must expose only published data and approved author fields.
6. Authentication contexts: pricing, redemptions and sales-agents use Supabase authentication independently of the root cookie; customer/agent endpoints additionally require real user records. A root cookie is not a customer fixture. Do not label all 401s backend outages or weaken route checks.
7. Internal-key protection: /api/health/email, /api/health/orders and /api/health/summary intentionally return 404 without an internal key. /api/users-admin GET deliberately returns 410; its displayed POST method was commented-out code, now excluded by the catalogue generator.

## Server failures

| Route | HTTP | Response summary |
|---|---:|---|
| `/api/admin/marketing/source-analytics` | 500 | Failed to fetch data |
| `/api/admin/orders` | 500 | Failed to load orders |
| `/api/admin/products/archive` | 500 | column products.archived_at does not exist |
| `/api/admin/profile` | 500 | Failed to load profile settings |
| `/api/admin/quotes` | 500 | permission denied for table quotes |
| `/api/admin/sales/funnel-analytics` | 500 | Failed to fetch funnel analytics |
| `/api/analytics/reports` | 500 | Internal server error |
| `/api/blog` | 500 | Failed to fetch posts |
| `/api/discounts` | 500 | Failed to fetch discounts |
| `/api/faqs` | 500 | Failed to fetch FAQs |
| `/api/health` | 503 | Overall health check reports unhealthy |
| `/api/permissions` | 500 |  Invalid `prisma.permission.findMany()` invocation:   connect ENETUNREACH 2406:da12:557:f800:ab55:ff88:5af8:8550:5432 - Local (:::0) |
| `/api/products/image-diagnostics` | 500 | Failed to fetch products |
| `/api/security/settings` | 500 | Failed to fetch security settings |
| `/api/services` | 500 | Internal server error |
| `/api/shipping` | 500 | Internal server error |
| `/api/superadmin/areas` | 500 | Failed to load area configuration |
| `/api/v1/blog` | 502 | Failed to load blog posts. |
| `/api/v1/admin/amc-contracts` | 502 | Failed to load AMC contracts. |
| `/api/v1/blueprints` | 502 | Failed to load blueprints. |
| `/api/v1/me/overview` | 500 | Failed to load profile. |
| `/api/v1/me/profile` | 500 | Failed to load profile. |

## Limits

No code, production environment, database grants or schema was changed during this audit. Payments, email/WhatsApp sending, uploads, cron jobs, deployments and mutations were not executed. Dynamic endpoints need valid test records and write workflows need isolated test fixtures. Full workflow functionality remains unverified for those entries.

## Follow-up full catalogue audit

See all-396-report.md for source and isolated request coverage of all 396 original entries, parameterized live checks, and local fixes. This initial live report remains a historical snapshot.
