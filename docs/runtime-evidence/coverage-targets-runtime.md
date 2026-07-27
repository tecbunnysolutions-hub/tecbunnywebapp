# Coverage Targets Runtime Evidence

Date: 2026-07-26
Status: Completed (measurement captured, threshold gate pending)

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

- Environment: local workspace runtime validation
- Command(s): `npx vitest run --coverage`
- Commit SHA: c1b9506ea121ec7a1c62886b9cd2a580d1c45769
- Executed At (UTC): 2026-07-26T23:36:48Z

## Results

- Thresholds configured: no explicit strict release thresholds found in repository policy files for this gate.
- Achieved coverage values:
	- Statements: 25% (162/648)
	- Branches: 16.88% (102/604)
	- Functions: 61.53% (64/104)
	- Lines: 26.04% (156/599)
- Pass/Fail: Not yet pass (threshold policy must be finalized and then re-evaluated)

## Evidence Attachments

- Coverage summary output: terminal execution output from `npx vitest run --coverage` (2026-07-26T23:36:48Z)
- Per-package or per-app breakdown: included in V8 coverage table for `core/src`, `core/dist`, and subpaths

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `coverage-targets`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include threshold vs actual coverage summary
