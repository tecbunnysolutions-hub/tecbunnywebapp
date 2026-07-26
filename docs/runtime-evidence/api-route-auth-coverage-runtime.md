# API Route Authentication Coverage Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Protected API routes must reject anonymous requests and accept valid authenticated requests.

## Prerequisites

- `API_BASE_URL` points to the target environment base URL.
- `AUTH_TOKEN_USER` is a valid non-expired user token.
- `PROTECTED_ROUTE_PATH` is a route that requires authentication (example: `/api/user/notifications`).

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:PROTECTED_ROUTE_PATH = '/api/user/notifications'
$env:AUTH_TOKEN_USER = 'REDACTED_VALID_USER_TOKEN'

function Invoke-ApiStatus {
	param(
		[string]$Url,
		[hashtable]$Headers
	)

	try {
		$resp = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers
		return [int]$resp.StatusCode
	} catch {
		if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
			return [int]$_.Exception.Response.StatusCode.value__
		}
		throw
	}
}

$url = "$($env:API_BASE_URL)$($env:PROTECTED_ROUTE_PATH)"

$anonStatus = Invoke-ApiStatus -Url $url -Headers @{}
$authStatus = Invoke-ApiStatus -Url $url -Headers @{ Authorization = "Bearer $($env:AUTH_TOKEN_USER)" }

"anonymous_status=$anonStatus"
"authenticated_status=$authStatus"
```

Pass criteria:
- Anonymous status is `401` or `403`.
- Authenticated status is expected success or business response (`2xx`/documented non-auth failure).

## Execution Log

- Environment: TBA
- Command(s): `Invoke-WebRequest` auth coverage probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Anonymous request result: TBA
- Authenticated request result: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Request/response traces: TBA
- Negative and positive case summary: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `api-route-auth-coverage`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include route path and observed statuses
