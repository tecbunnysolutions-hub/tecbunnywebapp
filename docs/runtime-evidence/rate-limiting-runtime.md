# Rate Limiting Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

High-risk endpoints must enforce thresholds and return 429 when exceeded.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `RATE_LIMIT_PATH` is high-risk endpoint path.
- `RATE_LIMIT_METHOD` is request method (example: `POST`).
- `BURST_COUNT` exceeds configured threshold.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:RATE_LIMIT_PATH = '/api/auth/send-otp'
$env:RATE_LIMIT_METHOD = 'POST'
$env:BURST_COUNT = '40'

$url = "$($env:API_BASE_URL)$($env:RATE_LIMIT_PATH)"
$payload = @{ probe = 'rate-limit' } | ConvertTo-Json
$codes = @()

for ($i = 1; $i -le [int]$env:BURST_COUNT; $i++) {
	try {
		$resp = Invoke-WebRequest -Uri $url -Method $env:RATE_LIMIT_METHOD -ContentType 'application/json' -Body $payload
		$codes += [int]$resp.StatusCode
	} catch {
		if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
			$codes += [int]$_.Exception.Response.StatusCode.value__
		} else {
			throw
		}
	}
}

$statusCounts = $codes | Group-Object | Sort-Object Name | ForEach-Object { "status_$($_.Name)=$($_.Count)" }
$statusCounts
```

Pass criteria:
- At least one request returns `429` once threshold is crossed.
- Baseline requests before threshold return expected non-429 statuses.

## Execution Log

- Environment: TBA
- Command(s): burst probe with status distribution (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Baseline throughput behavior: TBA
- Threshold exceed behavior (429): TBA
- Pass/Fail: TBA

## Evidence Attachments

- Request burst logs: TBA
- Retry-After behavior capture: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `rate-limiting-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include burst size and status-code distribution
