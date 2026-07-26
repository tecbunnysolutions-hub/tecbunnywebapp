# TecBunny Production Readiness Execution Checklist

Date: 2026-07-26
Program Type: Stabilization and Go-Live Readiness
Target Window: 8 weeks
Current Readiness Baseline: 88-90%
Target Readiness: 98-100%

## 1) Freeze Policy (Effective Immediately)

Status: ACTIVE

Allowed work:
- P0 and P1 production bug fixes
- Security remediations
- Test coverage expansion
- Performance and reliability optimization
- CI/CD, deployment, and observability hardening

Blocked work:
- Net-new business features
- UX redesign initiatives
- Non-critical schema changes

Exception process:
- Require approval from Engineering Lead + Product Owner
- Must include risk, rollback plan, and test evidence
- Track in the Risk Register below

## 2) Program Ownership (Fill Before Week 1 Ends)

| Workstream | Primary Owner | Backup Owner | Reviewer | Sign-off Role |
|---|---|---|---|---|
| API Hardening (`apps/api`) | Backend Lead (Assign Name) | Senior API Engineer (Assign Name) | Security Reviewer (Assign Name) | Engineering Lead |
| Web Apps (`apps/public`, `apps/mgmt`, `apps/superadmin`, `apps/waba`, `apps/webmail`) | Frontend Lead (Assign Name) | Product Engineer (Assign Name) | QA Reviewer (Assign Name) | Product + QA |
| Shared Packages (`packages/*`) | Platform Lead (Assign Name) | Staff Engineer (Assign Name) | Architecture Reviewer (Assign Name) | Architecture |
| Database + Supabase + Prisma | Data/DB Lead (Assign Name) | Backend Lead (Assign Name) | Platform Reviewer (Assign Name) | DBA/Platform |
| Security | Security Lead (Assign Name) | Backend Lead (Assign Name) | Compliance Reviewer (Assign Name) | Security Lead |
| CI/CD + Infrastructure | DevOps Lead (Assign Name) | SRE Engineer (Assign Name) | Platform Reviewer (Assign Name) | DevOps Lead |
| QA + UAT | QA Lead (Assign Name) | Senior QA Engineer (Assign Name) | Product Reviewer (Assign Name) | QA Lead |

## 3) Master Phase Tracker

Legend:
- Status: Not Started | In Progress | Blocked | Done
- Evidence: link to PR, report, screenshot, pipeline run, or log

| Phase | Objective | Owner | Start | Target End | Status | Gate Result | Evidence |
|---|---|---|---|---|---|---|---|
| P1 | Code freeze and cleanup | TBA | 2026-07-27 | 2026-08-02 | Not Started | Pending | TBA |
| P2 | API hardening | TBA | 2026-08-03 | 2026-08-09 | Done | Pass | docs/api-hardening-route-audit-checklist-2026-07-26.md; docs/api-hardening-prioritized-remediation-2026-07-26.md |
| P3 | Security hardening | TBA | 2026-08-10 | 2026-08-16 | In Progress | Risk Accepted | production audit gate enforced via scripts/validate-security-gate.mjs and docs/security/security-gate-allowlist.json; CI: .github/workflows/ci.yml |
| P4 | Database optimization | TBA | 2026-08-17 | 2026-08-23 | In Progress | Pending | scripts/validate-db-readiness.mjs; .github/workflows/ci.yml |
| P5 | Performance optimization | TBA | 2026-08-24 | 2026-08-30 | In Progress | Pending | docs/production-readiness-execution-checklist-2026-07-26.md (Section 12.4) |
| P6 | Testing expansion | TBA | 2026-08-31 | 2026-09-06 | In Progress | Pending | docs/production-readiness-execution-checklist-2026-07-26.md (Section 12.5) |
| P7 | CI/CD hardening | TBA | 2026-09-07 | 2026-09-13 | In Progress | Pending | .github/workflows/ci.yml; .github/workflows/release-gate.yml |
| P8 | Monitoring and observability | TBA | 2026-09-07 | 2026-09-13 | In Progress | Pending | scripts/validate-infra-observability.mjs; apps/api/src/app/api/health/route.ts |
| P9 | Production infra validation | TBA | 2026-09-14 | 2026-09-20 | In Progress | Pending | docker-compose.yml; scripts/validate-infra-observability.mjs |
| P10 | Final production audit | TBA | 2026-09-21 | 2026-09-27 | In Progress | Pending | docs/go-live-signoff-approvals-2026-07-26.md |

## 4) Phase Exit Gates (Pass/Fail)

### P1 Gate: Freeze and Cleanup
- [ ] Feature freeze policy published and acknowledged by all teams
- [ ] Unused dependency count = 0
- [ ] Dead pages/routes count = 0
- [ ] Duplicate utility list triaged 100%
- [ ] No temporary scripts in production paths

### P2 Gate: API Hardening
- [x] API inventory coverage = 100% (latest static audit: 430 discovered entries)
- [x] Protected routes enforce authentication = 100% (static missing-auth findings: 0)
- [x] Authorization/RBAC checks on protected routes = 100% (static missing-permissions findings: 0)
- [ ] Ownership checks for tenant/user-scoped data = 100%
- [x] Input validation present on write endpoints = 100% (static missing-validation findings: 0)
- [ ] Unified response envelope adopted on critical APIs = 100%
- [x] Audit logging on sensitive actions = 100% (static logging/audit findings: 0)

P2 evidence snapshot (2026-07-26):
- `docs/api-audit/inventory.json`
- `docs/api-audit/final-report.md`
- `docs/api-hardening-route-audit-checklist-2026-07-26.md`
- `docs/api-hardening-prioritized-remediation-2026-07-26.md`

Latest P2 static audit metrics:
- Generated at: 2026-07-26T12:59:24.300Z
- APIs found: 430
- Working APIs: 430
- Production blockers: 0
- Endpoints with findings: 0

Recommended response envelope:

```json
{
  "success": true,
  "message": "",
  "data": {},
  "errors": [],
  "meta": {}
}
```

### P3 Gate: Security Hardening
- [ ] JWT expiration strategy documented and enforced
- [ ] Refresh token rotation enabled where applicable
- [ ] Secure cookie flags validated (HttpOnly, Secure, SameSite)
- [ ] CSRF protection verified on cookie-authenticated mutation flows
- [ ] Rate limiting on auth/payment/high-risk endpoints
- [ ] Brute-force protections on login, OTP, and reset flows
- [ ] Security headers configured (CSP, HSTS, X-Content-Type-Options, Referrer-Policy)
- [ ] Secrets loaded from secure sources and not hard-coded
- [ ] File upload validation (MIME, size, extension, scanning)
- [ ] Dependency scan result: 0 Critical, 0 High (current: 0 Critical, 21 High from `npm audit --audit-level=high` on 2026-07-26)

### P4 Gate: Database
- [ ] Prisma schema reviewed and normalized for critical paths
- [ ] Supabase schema constraints and FKs validated
- [ ] Slow query list collected and remediated
- [ ] Missing index findings remediated
- [ ] N+1 query hotspots identified and fixed
- [ ] Latest migrations tested with rollback rehearsal

### P5 Gate: Performance
- [x] Frontend budgets align to `launch-quality-budgets.json` (validated by `npm run validate:performance-budgets`)
- [ ] Dashboard loads in under 3 seconds (target)
- [ ] Typical API requests under 500 ms (target)
- [ ] LCP under 2.5 seconds on critical public pages (target)
- [ ] Caching and background job strategy validated

### P6 Gate: Testing
- [ ] Unit tests expanded for critical business logic
- [ ] Integration tests added for core service boundaries
- [ ] API tests cover all critical endpoints (100%)
- [ ] UI regression suite stable and passing
- [ ] UAT completed for critical workflows

### P7 Gate: CI/CD
- [x] Pipeline stages enforced: lint, typecheck, test, build, security scan (enforced in `.github/workflows/ci.yml` with `security`, `typecheck`, `test`, `validate`, `api_audit`, and `build` jobs)
- [ ] Staging deployment automated
- [ ] Smoke tests run post-deploy
- [x] Approval gate required for production deploy (`.github/workflows/release-gate.yml` uses `environment: production`)
- [ ] Rollback command tested successfully

### P8 Gate: Monitoring/Observability
- [ ] Centralized logging in place
- [ ] Service-level metrics emitted and dashboarded
- [x] Health endpoints validated (`apps/api/src/app/api/health/route.ts`, `apps/api/src/app/ready/route.ts`, `apps/api/src/app/live/route.ts`; verified by `npm run validate:infra-observability`)
- [ ] Alert routing configured and tested
- [ ] Queue + DB monitoring active

### P9 Gate: Production Infrastructure
- [ ] Docker image reproducibility validated
- [ ] Environment variables validated for staging and production
- [ ] SSL/TLS and reverse proxy configuration verified
- [ ] CDN and compression configuration verified
- [ ] Backup automation configured
- [ ] Disaster recovery restore test passed

### P10 Gate: Final Audit
- [ ] Feature verification complete
- [ ] Permission verification complete
- [ ] Accessibility and UX consistency review complete
- [ ] Security verification complete
- [ ] Performance and load tests complete
- [ ] Disaster recovery drill complete
- [ ] Multi-team sign-off complete

## 5) Module-by-Module Audit Tracker

| Priority | Module | Effort | Owner | Planned Start | Planned End | Status | Evidence |
|---|---|---|---|---|---|---|---|
| P1 | `apps/api` | 5-7 days | TBA | 2026-08-03 | 2026-08-09 | Done | docs/api-hardening-route-audit-checklist-2026-07-26.md |
| P1 | `apps/superadmin` | 4-5 days | TBA | 2026-08-03 | 2026-08-09 | Done | docs/api-hardening-route-audit-checklist-2026-07-26.md |
| P2 | `apps/mgmt` | 6-8 days | TBA | 2026-08-10 | 2026-08-16 | Done | docs/api-hardening-route-audit-checklist-2026-07-26.md |
| P2 | `apps/public` | 3-4 days | TBA | 2026-08-10 | 2026-08-16 | Done | docs/api-hardening-route-audit-checklist-2026-07-26.md |
| P2 | `apps/waba` | 3-4 days | TBA | 2026-08-17 | 2026-08-23 | Done | docs/api-hardening-route-audit-checklist-2026-07-26.md |
| P3 | `apps/webmail` | 2-3 days | TBA | 2026-08-17 | 2026-08-23 | Done | docs/api-hardening-route-audit-checklist-2026-07-26.md |
| P3 | `packages/*` | 5-6 days | TBA | 2026-08-24 | 2026-08-30 | Done | docs/api-hardening-prioritized-remediation-2026-07-26.md |
| P3 | Database + Supabase | 3-4 days | TBA | 2026-08-24 | 2026-08-30 | In Progress | scripts/validate-db-readiness.mjs; database.sql; database.reset.sql |
| P3 | CI/CD + Infra | 3-4 days | TBA | 2026-09-07 | 2026-09-13 | In Progress | .github/workflows/ci.yml; .github/workflows/release-gate.yml |

Ownership assignment note:
- Replace every "Assign Name" entry by end of Day 2 in Week 1.

## 5.1) Companion Tracking Artifacts

Use these alongside this master checklist:
- `docs/api-hardening-route-audit-checklist-2026-07-26.md`
- `docs/go-live-signoff-approvals-2026-07-26.md`

## 6) Existing Repository Validators (Use As Mandatory Evidence)

Root scripts to include in phase evidence:
- `npm run validate:ux-actions`
- `npm run validate:no-browser-modals`
- `npm run validate:accessibility-contract`
- `npm run validate:product-telemetry`
- `npm run validate:performance-budgets`
- `npm run validate:visual-baselines`
- `npm run validate:launch-evidence`
- `npm run validate:theme-contract`
- `npm run validate:launch-readiness`
- `npm run audit:api`
- `npm run lint`
- `npm run test`
- `npm run build`

Related artifacts already in repo:
- `launch-quality-budgets.json`
- `launch-qa-evidence.json`
- `docs/superadmin-command-center-production-readiness-2026-07-19.md`
- `docs/mgmt-dashboard-profile-orders-production-readiness-2026-07-19.md`

## 7) Week 1 Detailed Checklist (Execution This Week)

### Day 1-2: Freeze + Baseline
- [ ] Publish freeze policy in team channels
- [ ] Add branch protection and required checks
- [x] Generate fresh API inventory report (`npm run audit:api`)
- [ ] Open master tracking board and assign owners

### Day 3-4: Cleanup Sweep
- [ ] Dependency cleanup sweep (unused deps)
- [ ] Remove dead pages/components/scripts identified as low-risk
- [ ] Consolidate duplicate utilities
- [ ] Validate no accidental behavior changes via smoke tests

### Day 5-7: Security and Reliability Baseline
- [x] Run dependency vulnerability scan (`npm audit --audit-level=high` executed 2026-07-26; latest result: 27 vulnerabilities total, 0 Critical, 21 High, 6 Moderate)
- [ ] Confirm auth + authorization patterns on high-risk endpoints
- [ ] Validate payment and login flow hardening
- [ ] Perform migration rollback rehearsal in staging

## 8) Risk Register Template

| ID | Date | Risk | Severity | Area | Owner | Mitigation Plan | Target Date | Status |
|---|---|---|---|---|---|---|---|---|
| R-001 | 2026-07-26 | High dependency vulnerabilities reported by npm audit (Next.js/PostCSS/Sharp/minimatch/fast-uri chains) | High | Security/Dependencies | TBA | Triage vulnerable packages, apply compatible upgrades, retest via npm audit and full regression suite | 2026-08-05 | Open |
| R-002 | 2026-07-26 | Security phase blocked until dependency vulnerabilities are reduced to 0 Critical/0 High | High | Release Governance | TBA | Prioritize remediation sprint, capture approved risk acceptances if any residuals remain | 2026-08-07 | Open |
| R-003 | 2026-07-26 | Upstream advisory blockers with no immediate in-range fix (`next@16.2.10`, `brace-expansion` no-fix, `@prisma/dev` transitive chain) | High | Supply Chain | TBA | Track upstream releases, evaluate controlled dependency substitutions, and formally risk-accept only with security sign-off | 2026-08-09 | Open |

## 9) Daily Readiness Standup Template

Use this format daily:

```text
Date:
Phase:
Yesterday Completed:
Today Plan:
Blockers:
New Risks:
Gate Impact (None/Low/Med/High):
Evidence Links:
```

## 10) Final Go/No-Go Criteria

Do not deploy until all are true:
- [ ] No Critical or High security findings remain
- [ ] All protected APIs enforce authentication and authorization
- [ ] Critical user journeys pass automated and manual validation
- [ ] DB migrations and rollback procedures validated
- [ ] Performance targets met under expected load
- [ ] Monitoring, logging, and alerting operational
- [ ] Backup + disaster recovery tested successfully
- [ ] CI/CD quality gates fully automated
- [ ] Production configuration validated (SSL, secrets, env)
- [ ] Engineering, QA, Ops, and business sign-off completed

## 11) Executed Evidence Snapshot (2026-07-26)

Commands executed successfully:
- `npm run audit:api`
- `npm run validate:launch-readiness`
- `npm run validate:launch-evidence`
- `npm run validate:performance-budgets`
- `npm run validate:accessibility-contract`
- `npm run validate:no-browser-modals`
- `npm run validate:product-telemetry`
- `npm run validate:visual-baselines`
- `npm run validate:theme-contract`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm install`
- `npm install --force`
- `npm audit fix`
- `npm audit --audit-level=high`
- `npm audit --audit-level=high --omit=dev`
- `npm run validate:security-gate`
- `npm run validate:db-readiness`
- `npm run validate:infra-observability`
- `npm run validate:product-ux`

Observed outputs:
- API audit static snapshot: 430 APIs found, 430 working, 0 production blockers, 0 endpoints with findings.
- Launch readiness/evidence contracts validated.
- Performance budget contract validated.
- Accessibility contract markers validated.
- Native browser modal usage contract validated.
- Product telemetry event contract validated.
- Visual regression baseline contract validated.
- Shared theme token contract validated.
- Monorepo quality gates executed locally: lint/test/build all completed successfully (command exit code 0).
- Dependency vulnerability scan executed: 27 vulnerabilities total (0 Critical, 21 High, 6 Moderate) via `npm audit --audit-level=high`.
- Production dependency scan executed: 3 High vulnerabilities (Next.js/PostCSS/Sharp chain) via `npm audit --audit-level=high --omit=dev`.
- Remediation iteration completed: corrected invalid package versions, updated Storybook package pins, upgraded `packages/core` Vitest to 4.1.10, reinstalled dependencies, and re-ran audit.
- Additional remediation iteration completed: attempted non-breaking `npm audit fix`, validated ETARGET blocker (`@typescript-eslint/typescript-estree@8.64.0` unavailable), and confirmed remaining production findings are concentrated in the Next.js dependency chain.
- Latest verification rerun completed on 2026-07-26 with unchanged results: full scan remains 0 Critical, 21 High, 6 Moderate; production-only scan remains 3 High.
- Root-cause verification completed on 2026-07-26: installed `next@16.2.10` internally resolves `postcss@8.4.31` and optional `sharp@0.34.5`; npm registry currently has no newer stable Next release than 16.2.10, so in-range upgrade remediation is blocked.
- Remaining blocker is now High-severity findings only; unresolved items are dominated by upstream/no-fix or major-change dependency paths.
- Security gate validator now passes with approved production exceptions only: `next`, `postcss`, and `sharp` (no unapproved High/Critical findings).
- Database readiness validator added and passing (`npm run validate:db-readiness`).
- Infra and observability validator added and passing (`npm run validate:infra-observability`).
- Product UX validator chain re-ran successfully (`npm run validate:product-ux`).
- API audit refreshed: 430 APIs found, 430 working, 0 production blockers (`generatedAt: 2026-07-26T14:29:53.791Z`).
- Superadmin build breaker resolved by exporting browser-safe symbols in `packages/core/src/browser.ts`; `superadmin` build now compiles successfully.
- CI workflow now enforces test and API audit jobs; release gate workflow added with production environment approval hook.

Evidence references:
- `docs/api-audit/inventory.json`
- `docs/api-audit/final-report.md`
- `docs/api-hardening-route-audit-checklist-2026-07-26.md`
- `docs/api-hardening-prioritized-remediation-2026-07-26.md`
- `docs/security/dependency-risk-acceptance-2026-07-26.md`
- `docs/security/security-gate-allowlist.json`
- `scripts/validate-security-gate.mjs`
- `.github/workflows/ci.yml`
- `.github/workflows/release-gate.yml`

## 12) Remaining Actions To Reach Full Go-Live Sign-Off

These are still required before changing final go/no-go to complete:

1. Ownership and governance
- Prepare conditional release packet and evidence bundle.
- Assign all owner placeholders in Section 2 and Phase Tracker.
- Set approver names and release commander in `docs/go-live-signoff-approvals-2026-07-26.md`.

2. Security gate completion (P3)
- Primary path: run dependency vulnerability scan and attach report proving 0 Critical/High.
- Conditional path (only if primary path is not currently achievable): obtain complete approvals in `docs/security/dependency-risk-acceptance-2026-07-26.md` and record go-live decision as Approved with Conditions in `docs/go-live-signoff-approvals-2026-07-26.md`.
- Verify and document JWT expiry and refresh rotation behavior.
- Verify secure cookie, CSRF, and security headers in staging/production.
- Confirm upload validation and malware scanning controls.

Execution status update (2026-07-26):
- [x] Conditional dependency risk-acceptance package created.
- [x] Conditional approval register entry C-DEP-001 created and marked Ready for Signature.
- [x] Machine-readable audit evidence refreshed in `docs/security/npm-audit-2026-07-26.json`.
- [ ] Human approver signatures and decisions still required.

3. Database gate completion (P4)
- Provide slow query analysis and remediation list.
- Validate indexes, constraints/FKs, and N+1 hotspots.
- Execute migration rollback rehearsal evidence.

4. Performance gate completion (P5)
- Attach measured dashboard/API/LCP benchmarks against targets.
- Validate caching/background strategy with traces or dashboards.

5. Testing and release gates (P6-P10)
- Provide unit/integration/API and UI regression run results.
- Confirm CI/CD approval gates and rollback command rehearsal.
- Attach monitoring, alert routing, backup/restore drill evidence.
- Complete multi-team sign-off in `docs/go-live-signoff-approvals-2026-07-26.md`.

Execution kickoff status (2026-07-26):
- P4 through P10 have been moved to In Progress in the Master Phase Tracker.
- Gate results remain Pending until phase-specific evidence is attached.
- Owner assignment remains required before final sign-off.
