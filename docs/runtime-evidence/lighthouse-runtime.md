# Lighthouse Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Record Lighthouse runs for critical user journeys.

## Prerequisites

- Lighthouse CLI available (`npx lighthouse`).
- Target URLs are accessible from test environment.

## Command Runbook (PowerShell)

```powershell
$urls = @(
	'https://your-public-host/',
	'https://your-public-host/products',
	'https://your-public-host/checkout'
)

foreach ($u in $urls) {
	$safe = ($u -replace 'https?://','' -replace '[^a-zA-Z0-9]','_')
	npx lighthouse $u --output html --output json --output-path "lighthouse_$safe" --quiet --chrome-flags="--headless"
}
```

Pass criteria:
- Critical routes have Lighthouse reports captured.
- Score regressions and failed audits are documented with remediation action.

## Execution Log

- Environment: TBA
- Command(s): Lighthouse CLI sweep (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Lighthouse score summary: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Lighthouse JSON/HTML links: TBA
- Route-level notes: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `lighthouse-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include route list and summary scores
