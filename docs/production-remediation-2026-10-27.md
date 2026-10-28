# Remediation Report: TecBunny

**Starting verdict:** NO-GO

**Current verdict:** NO-GO

**Gate confidence:** High: production health is failing, remote CI cannot start, and
launch-critical authorization/recovery evidence remains unavailable. This does not
assert a confirmed tenant breach or failed recovery; those controls are unverified.
**Reviewed scope:** Working tree based on `30bb9024dc096db34b739e99011b04355aad0e60`,
including pre-existing API audit changes. Local Windows verification on 27–28 October
2026 (updated 28 October). The user explicitly approved a production connection repair:
the API was recreated with its existing image and a verified-TLS Supabase session
pooler connection. A separately approved, permission-only audit-history migration was
also executed and verified. No new application release, application-data writes,
provider sends or load tests were performed. The user subsequently authorized go-live;
reviewed changes are committed on `codex/production-release-20261028`. Traffic assumption:
100 concurrent users. Release authorization does not supply the missing runtime evidence.

## Findings and disposition

| Finding | Change / evidence | Disposition |
|---|---|---|
| BLOCKER: production authorization/isolation evidence | Local authorization and WABA isolation tests pass. Production role/tenant/ownership evidence remains pending/stale in `quality/runtime-readiness-evidence.json`. | Needs human / environment access |
| BLOCKER: recovery and migration evidence | Existing settlement/isolation SQL regressions and new archival-column regression pass in isolated PGlite. No production-like restore, migration or rollback drill was executed. | Needs human / environment access |
| HIGH: dependency advisories | Updated Next 16.4.3, Sharp 0.35.5, Nodemailer 10.2.1, sanitize-html 2.18.1, Storybook 10.6.5, Vitest 4.1.12, Vite 8.3.4 and affected transitive overrides. Audit reduced from 16 affected entries to one HIGH Zod entry. A pinned maintainer backport mitigates the constrained-collection flaw locally; fresh-install, both module formats and tamper regressions pass. The declared package remains 4.6.5 and the raw audit gate still fails. | Partially fixed; release acceptance outstanding |
| HIGH: deployment bypasses gates | Deployment calls reusable CI and strict readiness, checks out the image SHA, supplies the Compose environment file, and retains rollback images. GitHub checks cannot start: the account is locked for a billing issue. Main has no branch protection or rulesets. | Fixed in repository; billing/protection need owner action |
| HIGH: deployment configuration missing | Repository and Production environment initially had no Actions secrets. Configured eight verified public build settings without uploading service-role credentials. Registry pulls now use the job's short-lived read-only token and temporary credential storage. Production SSH credentials are not yet installed. | Partially fixed; protected deployment access outstanding |
| HIGH: API/schema failures | Health probes use service-only HEAD queries and redact errors. Root quote access uses a service client while ordinary admins retain RLS. Six regressions pass. Fresh metadata shows canonical archival columns and service SELECT on preferences/OTP are already present; their installation actor is unknown. Old deployed health code still uses the wrong client. Production returns health 503, blog 502 and services 200. | Partially fixed; code release/runtime checks outstanding |
| HIGH: production PostgreSQL connectivity | The direct endpoint failed with ENETUNREACH on the VPS. After explicit user approval, switched DATABASE_URL to the dashboard-confirmed IPv4 session pooler with the provider CA and verify-full TLS. The unchanged API image passes SELECT 1 with an encrypted, authorized TLS socket. Other services were not restarted. Private rollback backup is outside the checkout/build context. | Fixed and verified in production |
| HIGH: unsafe product archive/restore | Replaced API direct-update fallbacks with service-only atomic calls, verified actors, row locks, retries and original-status restoration. Isolated history/FK/rollback/default-grant tests pass. Matching atomic functions and the audit table were observed installed by an unidentified actor. The approved follow-up grant repair removes inherited service edit/delete/reset privileges; all 18 live permission checks pass. Legacy archives without history require reconciliation (409). | Audit grants fixed in production; API code release/runtime check outstanding |
| HIGH: clean-install reproducibility discovered during remediation | Declared core speakeasy/qrcode/Nodemailer, S3 presigner and telemetry peers plus API nanoid; added needed type dependencies. Updated Nodemailer type imports for bundled v10 exports. CI compile fixtures validate strictly without real credentials and exclude the recursive root build task. All six web apps build on Next 16.4.3. API upload tracing includes its explicitly externalized presigner. | Fixed locally; clean remote CI/container execution unverified |
| HIGH: blog schema mismatch | Replaced nonexistent author/image/content/SEO columns with canonical name, cover_image_url, body and metadata mappings. Canonical record_status uses active plus a nonfuture publication timestamp and excludes deleted rows. Anonymous zero-row query passes without new grants. Editor writes map the same fields, preserve metadata and use optimistic concurrency. Regression tests pass; production release and authenticated write verification remain outstanding. | Fixed locally; runtime release verification outstanding |
| HIGH: 100-user capacity | Prior evidence remains a 20-concurrent-request public-read probe; no suitable staging target or agreed traffic mix/SLOs was supplied. | Needs human / staging access |
| HIGH: business workflow and alert drills | Unit and SQL checks pass; provider delivery, interactive business flows, alert fire/acknowledgement remain unverified. | Needs human / sandbox and alert access |
| MEDIUM: mobile LCP | Prior evidence records 4.4–4.5 seconds against a 2.5-second budget. No fresh browser measurement captured. | Unresolved; remeasure current deployment |

## Verification

- `npm test -- --concurrency=2`: **all seven workspace tasks passed with no cached tasks** after the blog, archival and Zod backport changes; API **241 tests in 36 files**, core 121 tests. A subsequent focused archival regression also checks canonical handling of uppercase UUIDs.
- Focused final health/quotes run: six tests passed.
- `npm run typecheck -- --concurrency=2`: 20 tasks passed (nine cached).
- `npm run lint -- --concurrency=2`: nine tasks passed with existing warnings.
- Core coverage: 121 tests passed; statements 31.48%, branches 26.96%, functions
  49.54%, lines 31.47%; configured thresholds passed.
- `npm run test:security-migrations`: settlement/tenant, archival-column, preference-grant and atomic archival fixtures passed in isolated PGlite.
- Final focused archival tests: **20 passed**. API typecheck and targeted lint pass;
  the final forced API build passes **six tasks with zero cache**, including Next
  16.4.3 compilation, TypeScript and static page generation. This is a fixture build,
  not a Docker image build; standalone output is enabled only by DOCKER_BUILD=true.
- The Zod backport installation hook and Prisma generation pass. A separate fixture
  extracts the registry tarball, checks its lockfile integrity, applies the pinned
  patch from original sources, repeats the install and runs ESM/CommonJS regressions.
  Modified source/runtime bytes and unknown package versions fail closed. CI and all
  five Docker dependency stages include the backport; raw audit is not suppressed.
- The communication-preferences grant test passes for both table and view fixtures:
  service SELECT is allowed, browser SELECT and new write grants are not added.
- Fresh sanitized observations are in
  `docs/production-remediation-runtime-observations-2026-10-27.json`. The configured
  database was initially unmatched. On 28 October its project ID was independently
  matched to the running API. The original direct endpoint failed on the VPS with
  ENETUNREACH; the approved session-pooler repair now passes with verified TLS.
- Public production GETs repeated on 28 October still return health **503**, blog
  **502** and services **200**. The local blog/schema fixes have not been deployed.
- Architecture, API boundary, static launch-readiness, infrastructure/observability
  and runtime evidence artifact/completeness checks passed. These are static checks.
- `npm run validate:runtime-readiness`: failed for stale and pending production evidence.
- Local test-suite/coverage evidence records actual runs with local-only limitations.
  Production health evidence is now explicitly **fail**, using the observed HTTP 503;
  it was not refreshed as a passing check. CI, recovery, authorization and other
  unexecuted drills retain their previous state.
- `npm run validate:product-ux`: all 16 configured steps passed after dependency/type fixes.
- `npm ci --dry-run --ignore-scripts`: passed; lockfile/install consistency checked.
- Compile-fixture builds: **all six web apps passed on Next 16.4.3 across targeted runs**:
  API, storefront, Webmail, WABA, management and superadmin. Final API build returned
  six successful tasks (four cached); final management/superadmin run returned eight
  successful tasks (six cached). App build traces confirm the upgraded version.
  API upload output tracing includes the S3 presigner package. Previously inspected
  management/superadmin logs belonged to 16.3.4; both apps were then rebuilt on 16.4.3.
  Earlier full runs failed on missing dependencies. This is cumulative local build
  verification, not a passing remote CI run or a deployed container test. Fixture
  builds do not prove provider delivery or valid production content; expected SMTP
  connection failures refer to the deliberately unreachable local fixture endpoint.
- Earlier verification failures were diagnosed: pruned undeclared speakeasy/nanoid,
  obsolete Nodemailer namespace imports, missing telemetry peers, and recursive
  root-task selection in the first CI-build helper iteration. No tests, thresholds,
  linters or readiness criteria were relaxed.
- Automatic approval review rejected an attempt to remove the generated API webpack
  cache (reason: "blocked by policy"). No deletion occurred. Explicit server
  externalization resolved the presigner bundling issue and the API build passed.

## Needs human action

- [ ] Security/backend owner (unassigned): execute current role, ownership and
  company/branch allow/deny matrix against the deployed revision and database.
- [ ] Database/operations owner (unassigned): provide an isolated staging database,
  rehearse backup restore/migration/rollback and measure agreed RTO/RPO. Review the
  live schema and migration registry against the four prepared migrations. The audit
  grant follow-up was executed directly with approval; other matching schema/grant
  changes were observed, not executed here. Reconcile legacy archives before restore.
- [ ] Security owner (unassigned): resolve the Zod advisory. `npm view zod@4.6.6 version`
  returned E404; the available 4.6.5 remains affected by GHSA-mrhx-c7xc-m3w5. Do not
  suppress the audit or fabricate acceptance. Verify a published patched release or
  explicitly review/accept the tested pinned maintainer backport before release.
- [ ] Backend/operations owner (unassigned): retain the verified service-only grants,
  release the reviewed code after passing gates, and retest the 22 reported API failures.
- [ ] QA/operations owners (unassigned): complete sandbox business flows, 100-user
  staging capacity test, alert-delivery drill and fresh browser/performance checks.
- [ ] GitHub account owner (unassigned): resolve the billing lock so Actions jobs can
  start. Configure main protection/rulesets and production approvals; the repository
  currently has neither main branch protection nor rulesets. Run CI on the final commit.
  A fresh retry on 28 October (run 40495127755, attempt 2) was again rejected before
  job startup with the same billing-lock annotation.
- [ ] Operations/security owner (unassigned): rotate the root credential shared in
  chat using the owner's secure process. No credential values are retained in reports.

## Accepted risks

None evidenced. An unresolved item or a written runbook is not risk acceptance.

## Final release-gate scorecard

| Domain | Status | Current evidence and limitation |
|---|---|---|
| Code/build | Pass locally | Seven workspace test tasks, final API build/TypeScript/lint, isolated SQL and backport regressions pass; no reviewed Docker image release verified. |
| Authentication/authorization | Unverified for release | Local allow/deny tests pass; current real role/owner/company/branch matrix is still required. |
| Data integrity/recovery | Unverified | Atomic archival and live audit grants verified; backup restore, migration and rollback rehearsals with RTO/RPO remain absent. |
| Security | Warn | Dependency upgrades and pinned Zod mitigation tested locally; raw HIGH audit, deployed old code and owner credential rotation remain outstanding. |
| CI/CD | Fail | GitHub billing lock prevents jobs starting; main protection/rulesets absent. Repository gates alone do not enable remote enforcement. |
| Operations | Fail | Pooler/TLS repaired; public health 503 and blog 502 persist on the old image, while services returns 200. |
| Capacity/performance | Unverified | No isolated 100-concurrent-user soak; old mobile LCP evidence remains above budget and needs refresh. |
| Product/compliance | Unverified | Provider sandbox delivery, business workflows, alert acknowledgement, browser/accessibility and privacy/retention acceptance remain incomplete. |

## Go-live runbook

See [production-go-live-runbook.md](production-go-live-runbook.md) for the actual VPS
deployment commands, pre-deploy evidence, smoke checks, rollback trigger/steps and
24–72 hour watchlist. Unknown owners, thresholds and recovery commands are identified
there explicitly. The deployment workflow will remain blocked by the current strict
readiness and security failures. Reapply the companion readiness-review gate after
all evidence is available; the present launch-critical gaps require **NO-GO**.

The executed operational repair, private backup location, certificate pin, required
Compose override and rollback procedure are in
[production-connection-repair-2026-10-28.md](production-connection-repair-2026-10-28.md).
Production remains on image `tecbunny-api:189aab37`, behind the reviewed working tree;
the successful connection repair is not an application deployment or recovery drill.
The executed audit-grant repair and captured ACL rollback record are in
[production-audit-grant-repair-2026-10-28.md](production-audit-grant-repair-2026-10-28.md).
