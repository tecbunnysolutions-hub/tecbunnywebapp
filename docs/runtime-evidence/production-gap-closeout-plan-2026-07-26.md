# Production Gap Closeout Plan

Date: 2026-07-26
Owner Group: Engineering Release Governance
Source of truth: runtime-readiness-evidence.json

## Objective

Close all strict runtime-readiness blockers by generating replayable runtime evidence for each pending/failing check.

## Required Execution Evidence

Every unresolved check must produce all of the following:

- command trace
- timestamp and environment label
- pass/fail outcome
- artifact file committed in docs/runtime-evidence/

## Priority 1: API Security Runtime Verification

1) api-route-auth-coverage
- Artifact: docs/runtime-evidence/api-route-auth-coverage-runtime.md
- Required proof:
  - protected route without token returns 401/403
  - protected route with valid token returns 2xx/expected business status
- Command examples:
  - replay suite against protected endpoints using valid and invalid tokens

2) rbac-enforcement
- Artifact: docs/runtime-evidence/rbac-enforcement-runtime.md
- Required proof:
  - role-denied user gets 403 on privileged route
  - authorized role succeeds on same route

3) cross-tenant-cross-branch-isolation
- Artifact: docs/runtime-evidence/tenant-branch-isolation-runtime.md
- Required proof:
  - tenant A cannot read/write tenant B resources
  - branch A cannot mutate branch B resources

4) ownership-checks
- Artifact: docs/runtime-evidence/ownership-checks-runtime.md
- Required proof:
  - user cannot mutate resource owned by another user
  - owner can mutate own resource

## Priority 1: Runtime Security Verification

5) jwt-lifecycle
- Artifact: docs/runtime-evidence/jwt-lifecycle-runtime.md
- Required proof:
  - expired token rejected
  - valid token accepted
  - renewal path behavior captured

6) refresh-token-rotation
- Artifact: docs/runtime-evidence/refresh-token-rotation-runtime.md
- Required proof:
  - old refresh token invalid after rotation
  - new refresh token accepted

7) csrf-cookie-flows
- Artifact: docs/runtime-evidence/csrf-cookie-flows-runtime.md
- Required proof:
  - mutation without CSRF token rejected
  - mutation with valid token accepted

8) rate-limiting-runtime
- Artifact: docs/runtime-evidence/rate-limiting-runtime.md
- Required proof:
  - threshold reached returns 429
  - Retry-After or equivalent behavior documented

9) security-headers-runtime
- Artifact: docs/runtime-evidence/security-headers-runtime.md
- Required proof:
  - CSP/HSTS/X-Content-Type-Options/Referrer-Policy captured on key routes

10) secret-handling-runtime
- Artifact: docs/runtime-evidence/secret-handling-runtime.md
- Required proof:
  - secret sources documented (env/secrets manager)
  - no plaintext secret leakage in logs

11) owasp-top10-runtime
- Artifact: docs/runtime-evidence/owasp-top10-runtime.md
- Required proof:
  - DAST or penetration run summary
  - remediation status for findings

## Priority 2: Testing Evidence Completion

12) critical-workflow-coverage
- Artifact: docs/runtime-evidence/critical-workflow-coverage-runtime.md
- Required proof:
  - executable pass report for top critical workflows

13) coverage-targets
- Artifact: docs/runtime-evidence/coverage-targets-runtime.md
- Required proof:
  - coverage summary with threshold checks
  - target values and actual values included

## Priority 2: Performance Evidence Completion

14) build-size-report
- Artifact: docs/runtime-evidence/build-size-report-runtime.md
- Required proof:
  - measured production build artifact size by app

15) lighthouse-report
- Artifact: docs/runtime-evidence/lighthouse-runtime.md
- Required proof:
  - Lighthouse outputs for critical pages

16) core-web-vitals-report
- Artifact: docs/runtime-evidence/core-web-vitals-runtime.md
- Required proof:
  - LCP/INP/CLS measured values and capture context

17) api-latency-report
- Artifact: docs/runtime-evidence/api-latency-runtime.md
- Required proof:
  - p50/p95/p99 latency by critical endpoint class

18) database-query-performance-report
- Artifact: docs/runtime-evidence/database-query-performance-runtime.md
- Required proof:
  - top query timings and execution-plan snapshots

19) load-testing-report
- Artifact: docs/runtime-evidence/load-testing-runtime.md
- Required proof:
  - concurrency level, duration, throughput, error rate

## Priority 1: Deployment Evidence Completion

20) production-build-verification
- Artifact: docs/runtime-evidence/production-build-rehearsal.md
- Required proof:
  - full monorepo production-style build with exit code

21) migration-safety-rehearsal
- Artifact: docs/runtime-evidence/migration-safety-rehearsal.md
- Required proof:
  - migration run output and elapsed time
  - failure behavior documented

22) rollback-rehearsal
- Artifact: docs/runtime-evidence/rollback-rehearsal.md
- Required proof:
  - rollback command trace and successful state restoration

23) backup-restore-rehearsal
- Artifact: docs/runtime-evidence/backup-restore-rehearsal.md
- Required proof:
  - restore rehearsal, RTO, and RPO captured

24) health-check-runtime
- Artifact: docs/runtime-evidence/health-check-runtime.md
- Required proof:
  - probe output and SLO trend evidence

25) monitoring-alerting-runtime
- Artifact: docs/runtime-evidence/monitoring-alerting-runtime.md
- Required proof:
  - alert trigger test and acknowledgement trace

## Gate Commands

- npm run validate:runtime-evidence-artifacts
- npm run validate:runtime-readiness

Expected sequence:

1. Produce runtime artifact files for unresolved checks.
2. Update runtime-readiness-evidence.json statuses and timestamps.
3. Run runtime evidence artifact gate.
4. Run strict runtime readiness gate.
5. Approve go-live only after both pass.

## Manifest Pass-Flip Checklist

Use this checklist for each check before changing `runtime-readiness-evidence.json` status to `pass`:

1. The check-specific runtime runbook was executed in target environment.
2. Result fields in the corresponding artifact file are filled with actual outputs.
3. Evidence attachment links are replaced with real report paths/URLs.
4. Pass criteria are explicitly satisfied in the artifact.
5. Reviewer is identified in notes (owner or approver name/role).

Safe update command template (PowerShell):

```powershell
# Replace CHECK_ID and NOTE_TEXT before running.
$checkId = 'CHECK_ID'
$noteText = 'Validated in staging with attached runtime evidence.'
$verifiedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')

node -e "const fs=require('fs'); const p='runtime-readiness-evidence.json'; const j=JSON.parse(fs.readFileSync(p,'utf8')); for (const c of Object.values(j.categories||{})) { for (const chk of (c.checks||[])) { if (chk.id==='${checkId}') { chk.status='pass'; chk.lastVerifiedAt='${verifiedAt}'; chk.notes='${noteText}'.replace(/\\n/g,' '); } } } fs.writeFileSync(p, JSON.stringify(j,null,2)+'\\n'); console.log('updated', '${checkId}');"
```

Post-update validation commands:

```powershell
npm run validate:runtime-evidence-artifacts
npm run validate:runtime-readiness
```

Only commit when both validators return expected results.
