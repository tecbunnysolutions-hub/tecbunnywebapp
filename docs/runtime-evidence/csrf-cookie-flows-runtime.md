# CSRF Cookie Flow Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Cookie-authenticated mutation routes must reject missing/invalid CSRF token flows.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `CSRF_MUTATION_PATH` is a cookie-authenticated mutation endpoint.
- `SESSION_COOKIE` is a valid authenticated cookie.
- `CSRF_HEADER_NAME` matches server expectation (example: `x-csrf-token`).
- `VALID_CSRF_TOKEN` is a valid anti-CSRF token for the session.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:CSRF_MUTATION_PATH = '/api/user/notifications'
$env:SESSION_COOKIE = 'REDACTED_SESSION_COOKIE'
$env:CSRF_HEADER_NAME = 'x-csrf-token'
$env:VALID_CSRF_TOKEN = 'REDACTED_VALID_CSRF_TOKEN'

$url = "$($env:API_BASE_URL)$($env:CSRF_MUTATION_PATH)"
$payload = @{ sample = 'value' } | ConvertTo-Json

function Invoke-CsrfMutation {
	param([hashtable]$Headers)

	$allHeaders = @{
		Cookie = $env:SESSION_COOKIE
	}
	foreach ($k in $Headers.Keys) { $allHeaders[$k] = $Headers[$k] }

	try {
		$resp = Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Headers $allHeaders -Body $payload
		return [int]$resp.StatusCode
	} catch {
		if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
			return [int]$_.Exception.Response.StatusCode.value__
		}
		throw
	}
}

$missingStatus = Invoke-CsrfMutation -Headers @{}
$invalidStatus = Invoke-CsrfMutation -Headers @{ $env:CSRF_HEADER_NAME = 'invalid-token' }
$validStatus = Invoke-CsrfMutation -Headers @{ $env:CSRF_HEADER_NAME = $env:VALID_CSRF_TOKEN }

"missing_csrf_status=$missingStatus"
"invalid_csrf_status=$invalidStatus"
"valid_csrf_status=$validStatus"
```

Pass criteria:
- Missing token rejected (`401`/`403`).
- Invalid token rejected (`401`/`403`).
- Valid token accepted (expected success/business status).

## Execution Log

- Environment: TBA
- Command(s): CSRF mutation probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Missing token behavior: TBA
- Invalid token behavior: TBA
- Valid token behavior: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Header/cookie traces: TBA
- Mutation response samples: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `csrf-cookie-flows`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include CSRF status outcomes and endpoint path
