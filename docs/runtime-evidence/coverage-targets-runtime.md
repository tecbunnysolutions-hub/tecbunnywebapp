# Coverage Targets Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Validate current code coverage against release thresholds.

## Prerequisites

- Coverage thresholds defined in test tooling or release policy.

## Command Runbook (PowerShell)

```powershell
# Generic Vitest coverage run (adjust if workspace scripts differ)
npx vitest run --coverage

# Optional: package-targeted coverage
# npx turbo run test --filter=@tecbunny/core -- --coverage
```

Pass criteria:
- Coverage thresholds are met for required scopes.
- Coverage report is attached with timestamp and commit.

## Execution Log

- Environment: TBA
- Command(s): coverage report generation (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Thresholds configured: TBA
- Achieved coverage values: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Coverage summary output: TBA
- Per-package or per-app breakdown: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `coverage-targets`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include threshold vs actual coverage summary
