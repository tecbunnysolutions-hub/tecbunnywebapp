# Critical Workflow Coverage Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Critical business workflows must have executable test evidence with pass/fail outputs.

## Prerequisites

- Critical workflow list finalized (auth, checkout, payment, order status, admin approval, user profile).
- Test suites mapped to workflow list.

## Command Runbook (PowerShell)

```powershell
# 1) Run full test suite
npm run test

# 2) Optional workflow-tagged tests if available
# npx vitest run --reporter=verbose --grep "workflow|checkout|payment|auth"
```

Pass criteria:
- All critical workflow tests execute and pass.
- Any skipped or missing workflow has explicit risk acceptance.

## Execution Log

- Environment: TBA
- Command(s): full test run and workflow-focused subset (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Workflow pass list: TBA
- Workflow gaps: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Test reports: TBA
- QA execution artifacts: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `critical-workflow-coverage`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include workflow coverage matrix summary
