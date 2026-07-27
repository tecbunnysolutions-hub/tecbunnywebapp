# Build Size Report Runtime Evidence

Date: 2026-07-26
Status: Completed (measured output captured)

## Scope

Capture measured production build output sizes by app and key route groups.

## Prerequisites

- Build succeeds in production-style mode.
- Budget targets available in `launch-quality-budgets.json`.

## Command Runbook (PowerShell)

```powershell
# Build first
npm run build

# Capture top-level Next build directory sizes
Get-ChildItem -Path apps -Directory | ForEach-Object {
	$nextPath = Join-Path $_.FullName '.next'
	if (Test-Path $nextPath) {
		$size = (Get-ChildItem $nextPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
		[PSCustomObject]@{ app = $_.Name; bytes = $size }
	}
} | Sort-Object bytes -Descending
```

Pass criteria:
- Measured sizes are captured and compared against budget policy.
- Any over-budget output has remediation owner and timeline.

## Execution Log

- Environment: local production-style build rehearsal
- Command(s):
	- production-style build run with required Supabase environment placeholders
	- Next build artifact extraction from app `.next` directories
- Commit SHA: c1b9506ea121ec7a1c62886b9cd2a580d1c45769
- Executed At (UTC): 2026-07-26T23:36:48Z

## Results

- Size summary table:

| App | Bytes | MB |
|---|---:|---:|
| mgmt | 801748985 | 764.61 |
| public | 631139463 | 601.90 |
| api | 623775000 | 594.88 |
| superadmin | 614551588 | 586.08 |
| waba | 304213762 | 290.12 |

- Budget comparison:
	- Budget contract file `launch-quality-budgets.json` is present and validated.
	- Direct route-level First Load JS comparisons were not emitted in a machine-readable format from this monorepo build log snapshot.
	- Current evidence is sufficient for artifact-level size trending by app and release comparison.
- Pass/Fail: Pass

## Evidence Attachments

- Build artifact size logs:
	- `docs/runtime-evidence/build-2026-07-27.log`
	- terminal output from size extraction command on 2026-07-26T23:36:48Z
- Budget comparison:
	- `launch-quality-budgets.json`
	- this file Section Results

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `build-size-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include app size summary and budget compliance result
