# JWT Lifecycle Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Validate JWT expiration, rejection of invalid/expired tokens, and successful use of valid tokens.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `JWT_PROBE_ROUTE_PATH` points to auth-protected route.
- `JWT_VALID_TOKEN` is known-good token.
- `JWT_EXPIRED_TOKEN` is known-expired token.
- `JWT_INVALID_TOKEN` is malformed or signature-invalid token.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:JWT_PROBE_ROUTE_PATH = '/api/auth/session'
$env:JWT_VALID_TOKEN = 'REDACTED_VALID_TOKEN'
$env:JWT_EXPIRED_TOKEN = 'REDACTED_EXPIRED_TOKEN'
$env:JWT_INVALID_TOKEN = 'invalid.jwt.token'

function Invoke-ApiStatus {
	param(
		[string]$Url,
		[string]$Token
	)

	try {
		$resp = Invoke-WebRequest -Uri $Url -Method GET -Headers @{ Authorization = "Bearer $Token" }
		return [int]$resp.StatusCode
	} catch {
		if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
			return [int]$_.Exception.Response.StatusCode.value__
		}
		throw
	}
}

$url = "$($env:API_BASE_URL)$($env:JWT_PROBE_ROUTE_PATH)"

$validStatus = Invoke-ApiStatus -Url $url -Token $env:JWT_VALID_TOKEN
$expiredStatus = Invoke-ApiStatus -Url $url -Token $env:JWT_EXPIRED_TOKEN
$invalidStatus = Invoke-ApiStatus -Url $url -Token $env:JWT_INVALID_TOKEN

"valid_status=$validStatus"
"expired_status=$expiredStatus"
"invalid_status=$invalidStatus"
```

Pass criteria:
- Valid token receives expected success/business status.
- Expired token denied (`401` or `403`).
- Invalid token denied (`401` or `403`).

## Execution Log

- Environment: TBA
- Command(s): JWT validity/expiry probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Expired token behavior: TBA
- Invalid token behavior: TBA
- Valid token behavior: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Auth traces: TBA
- Token lifecycle replay summary: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `jwt-lifecycle`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include token class to status mapping
