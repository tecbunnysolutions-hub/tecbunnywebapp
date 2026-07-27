# Health Check Runtime Evidence

Date: 2026-07-26
Status: Completed (local runtime rehearsal)

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

- Environment: local production-style runtime rehearsal (api app on localhost:4012)
- Command(s):
	- `npm run start --workspace=api -- --port 4012`
	- repeated probe sweep against `/health`, `/ready`, `/live` (5 rounds)
- Commit SHA: c1b9506ea121ec7a1c62886b9cd2a580d1c45769
- Executed At (UTC): 2026-07-26T23:40:26Z

## Results

- Health endpoint checks:
	- `/health`: 200 (5/5)
	- `/ready`: 200 (5/5)
	- `/live`: 200 (5/5)
- Runtime probe summary:
	- Total probes: 15
	- Success probes (HTTP 200): 15
	- Non-200 probes: 0
	- Short-window availability sample: 100%
- Pass/Fail: Pass

## Evidence Attachments

- Probe logs:
	- terminal run output captured on 2026-07-26T23:40:26Z for 5-sweep matrix
- SLO trend source:
	- this file Section Results (time-series sweep sample)
	- `docs/runtime-evidence/operational-verification-2026-07-27.md` latest gate run context

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `health-check-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include probe status matrix and SLO reference
