# Health Check Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Capture runtime health probe outputs and SLO trend references.

## Prerequisites

- `API_BASE_URL` and app entry URLs available.
- Health endpoints confirmed (`/health`, `/ready`, `/live` as applicable).

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$paths = @('/health', '/ready', '/live')

foreach ($p in $paths) {
	$url = "$($env:API_BASE_URL)$p"
	try {
		$resp = Invoke-WebRequest -Uri $url -Method GET
		"path=$p status=$($resp.StatusCode)"
	} catch {
		if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
			"path=$p status=$([int]$_.Exception.Response.StatusCode.value__)"
		} else {
			throw
		}
	}
}
```

Pass criteria:
- Health/ready/live probes return expected healthy responses.
- SLO trend source is linked and current.

## Execution Log

- Environment: TBA
- Command(s): health endpoint probe sweep (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Health endpoint checks: TBA
- Runtime probe summary: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Probe logs: TBA
- SLO dashboard links: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `health-check-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include probe status matrix and SLO reference
