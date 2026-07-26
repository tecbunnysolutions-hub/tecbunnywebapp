# Go-Live Sign-off Approvals

Date: 2026-07-26
Release Window: TBA
Environment: Staging -> Production
Linked Master Checklist: `docs/production-readiness-execution-checklist-2026-07-26.md`

## 1) Required Approver Matrix

| Function | Approver Name | Role | Decision | Date | Notes |
|---|---|---|---|---|---|
| Engineering | Pending Assignment | Engineering Lead | Pending | TBA | Required for C-DEP-001 conditional release decision |
| QA | Pending Assignment | QA Lead | Pending | TBA | Required before final release decision execution |
| Operations | Pending Assignment | DevOps/SRE Lead | Pending | TBA | Required for C-DEP-001 conditional release decision |
| Security | Pending Assignment | Security Lead | Pending | TBA | Required for C-DEP-001 conditional release decision |
| Business | Pending Assignment | Product/Business Owner | Pending | TBA | Required for C-DEP-001 conditional release decision |

Decision values:
- Approved
- Approved with Conditions
- Rejected

## 2) Mandatory Go/No-Go Attestations

All items must be marked PASS, or explicitly marked Risk Accepted with required approvals, before final go-live approval.

| Check | Owner | Status | Evidence Link | Notes |
|---|---|---|---|---|
| No Critical vulnerabilities | Security | Pass | npm audit --audit-level=high (2026-07-26) | Latest scan reports 0 Critical vulnerabilities. |
| No High vulnerabilities | Security | Risk Accepted | npm audit --audit-level=high --omit=dev (2026-07-26); scripts/validate-security-gate.mjs; docs/security/security-gate-allowlist.json | Remaining production High findings are upstream constrained and explicitly allowlisted with expiration under security gate policy. |
| Dependency risk acceptance approved (if residual highs remain) | Security + Engineering + Business + Operations | Pending | docs/security/dependency-risk-acceptance-2026-07-26.md; docs/security/npm-audit-2026-07-26.json | Required if release proceeds with unresolved High vulnerabilities. |
| Protected APIs enforce auth + authorization | Engineering | Pass | docs/api-hardening-route-audit-checklist-2026-07-26.md; docs/api-audit/inventory.json | Static audit snapshot 2026-07-26T12:59:24.300Z shows missing-auth=0 and missing-permissions=0 across 430 discovered APIs. |
| Critical user journeys pass (auto + manual) | QA | Pending | TBA | TBA |
| DB migrations + rollback tested | Platform/DB | Pending | TBA | TBA |
| Performance targets met under expected load | Engineering | Pending | TBA | TBA |
| Monitoring + alerting operational | Operations | Pending | TBA | TBA |
| Backup + restore drill successful | Operations | Pending | TBA | TBA |
| CI/CD quality gates enforced | Engineering/Operations | Pass | .github/workflows/ci.yml; .github/workflows/release-gate.yml | Pipeline jobs enforce lint/typecheck/test/build/security plus production environment approval gate. |
| Production config (SSL, secrets, env) verified | Operations/Security | Pending | TBA | TBA |

## 2.1) Completed Evidence Snapshot

- API static hardening completion: 430 APIs found, 430 working, 0 production blockers.
- API finding backlog: 0 endpoints with findings and 0 total finding instances.
- Security scan snapshot: 0 Critical, 21 High, 6 Moderate vulnerabilities from `npm audit --audit-level=high`.
- Production-only scan snapshot: 3 High vulnerabilities (Next.js/PostCSS/Sharp chain) from `npm audit --audit-level=high --omit=dev`.
- Local quality gate runs completed: `npm run lint`, `npm run test`, `npm run build` (exit code 0).
- Remediation attempt executed: dependency version corrections, targeted overrides, reinstall, and re-audit; unresolved findings remain due upstream/no-fix advisories.
- Follow-up remediation attempt executed: non-breaking `npm audit fix` blocked by ETARGET (`@typescript-eslint/typescript-estree@8.64.0` unavailable); residual production findings remain in Next.js chain.
- Latest rerun verification (2026-07-26) confirms unchanged posture: full scan 0 Critical/21 High/6 Moderate and production-only scan 3 High.
- Root-cause verification (2026-07-26): installed `next@16.2.10` resolves vulnerable internal `postcss@8.4.31` and optional `sharp@0.34.5`; no newer stable Next release exists in npm at this time.
- Source docs:
	- `docs/api-hardening-route-audit-checklist-2026-07-26.md`
	- `docs/api-hardening-prioritized-remediation-2026-07-26.md`
	- `docs/api-audit/inventory.json`
	- `docs/production-readiness-execution-checklist-2026-07-26.md`
	- `docs/security/npm-audit-2026-07-26.json`

Status values:
- Pending
- Pass
- Fail
- Risk Accepted

## 3) Release Decision Record

| Item | Value |
|---|---|
| Final Decision | Pending Conditional Approval (C-DEP-001) |
| Decision Timestamp | TBA |
| Release Version/Tag | TBA |
| Rollback Version/Tag | TBA |
| Release Commander | TBA |
| Incident Channel | TBA |

Decision note:
- Current go-live status is blocked by unresolved High dependency vulnerabilities unless conditional approval is granted through the dependency risk acceptance package.
- Technical remediation to 0 High is currently constrained by upstream package availability, as documented in the dependency risk acceptance package.

## 4) Conditional Approval Register

Track anything approved with conditions.

| ID | Condition | Risk Level | Owner | Due Date | Status | Evidence |
|---|---|---|---|---|---|---|
| C-DEP-001 | Permit release with residual dependency High findings only if all approvals in dependency risk acceptance package are completed and expiration date is active | High | Security Lead | 2026-08-09 | Ready for Signature | docs/security/dependency-risk-acceptance-2026-07-26.md; docs/security/npm-audit-2026-07-26.json |

## 4.1) Conditional Approval Execution Checklist (C-DEP-001)

- [x] Risk acceptance package prepared.
- [x] Latest audit evidence artifact attached.
- [ ] Security approver decision recorded.
- [ ] Engineering approver decision recorded.
- [ ] Business approver decision recorded.
- [ ] Operations approver decision recorded.
- [ ] QA release-readiness decision recorded.
- [ ] Final Decision updated from Pending Conditional Approval to Approved with Conditions or Rejected.

## 5) Sign-off Statement

By marking Approved, each approver confirms:
- Required controls were validated for their domain.
- Evidence has been reviewed and is accurate.
- Remaining risks (if any) are explicitly documented and accepted.
