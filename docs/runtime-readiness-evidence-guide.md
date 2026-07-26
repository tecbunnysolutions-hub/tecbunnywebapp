# Runtime Readiness Evidence Guide

This guide defines how to update `runtime-readiness-evidence.json` so production release gating can verify non-static requirements.

## Purpose

Static analysis can prove route existence and many implementation signals, but it cannot prove runtime behavior under real credentials, data, load, and infrastructure.

The strict validator (`npm run validate:runtime-readiness`) blocks release when runtime evidence is:

- missing,
- stale (older than `policy.maxEvidenceAgeDays`),
- marked `pending` or `fail`.

## How to provide valid evidence

For each check in `runtime-readiness-evidence.json`:

1. Run the corresponding runtime validation in staging or pre-production.
2. Save evidence artifacts into repository-controlled docs or reports.
3. Set `status` to `pass` only when criteria are met.
4. Update `lastVerifiedAt` using UTC ISO format.
5. Add one or more `evidence` entries that point to existing files in this repository, or approved immutable external report URLs.

## Suggested artifact patterns

- Authentication/Authorization:
  - API replay logs showing `401/403` negative cases and successful role-allowed cases.
  - Tenant/branch boundary tests proving cross-scope access denial.
- Security:
  - JWT expiry/refresh replay traces.
  - CSRF mutation protection traces.
  - Security header captures for key routes.
  - OWASP/DAST scan report.
- Testing:
  - CI run summary with commit SHA.
  - Coverage summary artifacts with threshold assertions.
  - Critical workflow test reports.
- Performance:
  - Build bundle reports.
  - Lighthouse reports for critical pages.
  - Core Web Vitals traces.
  - API latency percentile report.
  - DB query performance report.
  - Load test summary.
- Deployment:
  - Production build logs.
  - Migration rehearsal logs.
  - Rollback and restore drill reports.
  - Health-check probes and alerting drill output.

## CI behavior

- CI pipeline runs `npm run validate:runtime-readiness:advisory` to continuously expose gaps.
- Release gate runs `npm run validate:runtime-readiness` in strict mode and blocks production when unresolved.
