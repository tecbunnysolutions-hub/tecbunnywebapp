# Core Web Vitals Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Provide measured LCP, INP, and CLS values for critical pages.

## Prerequisites

- Lighthouse or RUM source available for target pages.
- Thresholds aligned to release policy.

## Command Runbook (PowerShell)

```powershell
# Use Lighthouse JSON outputs generated in lighthouse-runtime.md and extract CWV-related metrics.
Get-ChildItem -Path . -Filter 'lighthouse_*.report.json' -ErrorAction SilentlyContinue | ForEach-Object {
	$json = Get-Content $_.FullName -Raw | ConvertFrom-Json
	[PSCustomObject]@{
		report = $_.Name
		lcp_ms = [math]::Round(($json.audits.'largest-contentful-paint'.numericValue), 2)
		cls = [math]::Round(($json.audits.'cumulative-layout-shift'.numericValue), 4)
		inp_ms = if ($json.audits.'interaction-to-next-paint') { [math]::Round(($json.audits.'interaction-to-next-paint'.numericValue), 2) } else { $null }
	}
}
```

Pass criteria:
- LCP/CLS/INP values are captured for critical routes.
- Values meet agreed thresholds or have remediation plan.

## Execution Log

- Environment: TBA
- Command(s): CWV extraction from Lighthouse JSON (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- LCP: TBA
- INP: TBA
- CLS: TBA
- Pass/Fail: TBA

## Evidence Attachments

- CWV traces and exports: TBA
- Threshold comparison: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `core-web-vitals-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include route-level CWV summary
