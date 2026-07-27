# API Route Authentication Coverage Runtime Evidence

Date: 2026-07-26
Status: Completed (pass)

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

- Environment: Staging (`NEXT_PUBLIC_API_URL` from `.env`)
- Command(s): PowerShell `Invoke-WebRequest` probes for anonymous and authenticated access
- Commit SHA: c534ad31
- Executed At (UTC): 2026-07-27T01:32:01.265Z

## Results

- Protected route tested: `/api/security/audit-logs`
- Anonymous request result: `401`
- Login route result (`/api/admin-auth/login`): `200`
- Authenticated request result: `200`
- Pass/Fail: Pass

## Evidence Attachments

- Runtime trace summary (status codes): anonymous `401`, authenticated `200`
- Control evidence: authenticated session cookie issued by `POST /api/admin-auth/login`

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `api-route-auth-coverage`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include route path and observed statuses
