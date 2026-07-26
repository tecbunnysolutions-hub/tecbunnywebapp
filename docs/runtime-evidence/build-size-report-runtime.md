# Build Size Report Runtime Evidence

Date: 2026-07-26
Status: Pending completion

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

- Environment: TBA
- Command(s): production build and size extraction (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Size summary table: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Build artifact size logs: TBA
- Budget comparison: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `build-size-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include app size summary and budget compliance result
