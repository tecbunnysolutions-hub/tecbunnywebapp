# Dependency Security Risk Acceptance Package

Date: 2026-07-26
Prepared by: Engineering (Automation Evidence)
Scope: Monorepo dependency vulnerability residuals after remediation sprint
Related docs:
- `docs/production-readiness-execution-checklist-2026-07-26.md`
- `docs/go-live-signoff-approvals-2026-07-26.md`
- `docs/security/npm-audit-2026-07-26.json`

## 1) Executive Summary

Current status after remediation:
- Full dependency scan (`npm audit --audit-level=high`): 27 vulnerabilities (0 Critical, 21 High, 6 Moderate)
- Production-only scan (`npm audit --audit-level=high --omit=dev`): 3 High
- Critical severity vulnerabilities: 0

Primary residual risk clusters:
- Next.js chain (`next` -> `postcss`, `sharp`) in production dependencies
- Tooling chain (`brace-expansion`/`minimatch`, `fast-uri`) in primarily dev and lint/test dependency paths
- Prisma dev tool transitive chain (`@hono/node-server`, `valibot`) in development tooling

## 2) Remediation Work Completed

Executed actions:
- Corrected invalid/unpublished dependency version pins in workspace manifests.
- Updated security-oriented overrides for vulnerable transitive dependencies.
- Upgraded `packages/core` Vitest to `^4.1.10` to remove critical advisory path.
- Reinstalled dependencies and re-ran audits.
- Executed non-breaking remediation command attempts (`npm audit fix`) and validated blocker output.

Observed blocker:
- `npm audit fix` attempts can fail due to unavailable package target: `@typescript-eslint/typescript-estree@8.64.0` (ETARGET).
- Production chain blocker confirmed: `next@16.2.10` package dependencies include exact `postcss@8.4.31` and optional `sharp@^0.34.5` (resolved as `0.34.5` under `node_modules/next`), and npm registry has no newer stable Next version currently available.
- Override attempt result: root-level and scoped npm overrides were applied and reinstalled, but did not replace Next's internal resolved `postcss`/`sharp` nodes in the audited dependency path.

## 3) Residual High-Risk Mapping

### RISK-DEP-001: Next.js production vulnerability chain
Severity: High
Affected packages: `next`, `postcss`, `sharp`
Advisories include:
- GHSA-m99w-x7hq-7vfj
- GHSA-89xv-2m56-2m9x
- GHSA-68g3-v927-f742
- GHSA-4633-3j49-mh5q
- GHSA-4c39-4ccg-62r3
- GHSA-p9j2-gv94-2wf4
- GHSA-q8wf-6r8g-63ch
- GHSA-955p-x3mx-jcvp
- GHSA-qx2v-qp2m-jg93
- GHSA-6g55-p6wh-862q
- GHSA-r28c-9q8g-f849
- GHSA-f88m-g3jw-g9cj
Current evidence:
- Remaining production vulnerabilities are limited to this chain (3 High in omit-dev audit).
Compensating controls:
- API hardening static checks at 0 production blockers.
- Authentication and permissions static findings reduced to zero in API audit inventory.
- Local quality gates (lint/test/build) passing for current baseline.
Planned closure:
- Track Next.js and transitive release advisories weekly.
- Apply coordinated framework upgrade in controlled release branch when verified fixed versions are available.
- Re-run full regression plus `npm audit --audit-level=high --omit=dev` as exit criteria.
Target review date: 2026-08-05

### RISK-DEP-002: Dev tooling transitive chain (`brace-expansion`/`minimatch`)
Severity: High
Affected packages: `brace-expansion`, `minimatch`, `eslint` transitive tree
Advisories include:
- GHSA-3jxr-9vmj-r5cp
- GHSA-mh99-v99m-4gvg
Current evidence:
- Exposure appears through lint/test/build-time dependencies and not direct runtime API handling.
Compensating controls:
- CI quality gate execution is local-pass and controlled.
- No known direct production request path to this chain.
Planned closure:
- Evaluate controlled toolchain upgrade route (including `eslint-plugin-storybook`/`typescript-eslint` compatibility).
- Monitor upstream package resolution for non-breaking path.
Target review date: 2026-08-07

### RISK-DEP-003: Fast URI advisory in dependency graph
Severity: High
Affected package: `fast-uri` (transitive)
Advisory:
- GHSA-v2hh-gcrm-f6hx
Current evidence:
- Override configured to force patched `fast-uri` where resolvable.
- Audit still reports vulnerable nodes in current graph.
Compensating controls:
- No confirmed direct external attack surface mapped in application runtime path from current evidence.
Planned closure:
- Continue dependency tree trace and force-resolution validation with lockfile updates.
Target review date: 2026-08-07

## 4) Acceptance Conditions

This risk acceptance is valid only if all conditions remain true:
- No Critical vulnerabilities in `npm audit --audit-level=high`.
- Production-only vulnerability count does not exceed current baseline (3 High).
- API hardening audit remains at zero production blockers.
- No new exploitable path is identified in threat modeling review.

If any condition fails, acceptance is automatically invalidated and release returns to blocked.

## 5) Required Approvals

| Role | Approver | Decision | Date | Notes |
|---|---|---|---|---|
| Security Lead | TBA | Pending | TBA | TBA |
| Engineering Lead | TBA | Pending | TBA | TBA |
| Product/Business Owner | TBA | Pending | TBA | TBA |
| Operations/SRE Lead | TBA | Pending | TBA | TBA |

Approval completion rule:
- This package is considered approved only when all four rows above are marked `Approved` or `Approved with Conditions`.
- Any `Rejected` decision keeps release blocked.

Decision values:
- Approved
- Approved with Conditions
- Rejected

## 6) Expiration and Review

Acceptance expiration date: 2026-08-09
Mandatory review cadence: every 48 hours until vulnerabilities are remediated or acceptance is renewed.

Verification checkpoint:
- Re-validated on 2026-07-26: full audit remains 27 total vulnerabilities (0 Critical, 21 High, 6 Moderate).
- Re-validated on 2026-07-26: production-only audit remains 3 High.

## 7) Decision Handoff to Go-Live Sign-off

When approvals are complete:
- Update `docs/go-live-signoff-approvals-2026-07-26.md` check `Dependency risk acceptance approved (if residual highs remain)` to `Risk Accepted`.
- Update Final Decision to `Approved with Conditions` or `Rejected`.
- Record Decision Timestamp, Release Commander, and Incident Channel.
