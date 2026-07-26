# Refresh Token Rotation Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Refresh token rotation must invalidate prior tokens and accept rotated tokens.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `REFRESH_ROUTE_PATH` is the refresh-token endpoint path.
- `INITIAL_REFRESH_TOKEN` is a valid refresh token.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:REFRESH_ROUTE_PATH = '/api/auth/session'
$env:INITIAL_REFRESH_TOKEN = 'REDACTED_REFRESH_TOKEN'

function Invoke-Refresh {
	param(
		[string]$RefreshToken
	)

	$url = "$($env:API_BASE_URL)$($env:REFRESH_ROUTE_PATH)"
	$body = @{ refreshToken = $RefreshToken } | ConvertTo-Json

	try {
		$resp = Invoke-RestMethod -Uri $url -Method POST -ContentType 'application/json' -Body $body
		return @{ status = 200; body = $resp }
	} catch {
		$code = if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
			[int]$_.Exception.Response.StatusCode.value__
		} else {
			0
		}
		return @{ status = $code; body = $null }
	}
}

$first = Invoke-Refresh -RefreshToken $env:INITIAL_REFRESH_TOKEN
$rotatedToken = $first.body.refreshToken

$secondWithOld = Invoke-Refresh -RefreshToken $env:INITIAL_REFRESH_TOKEN
$thirdWithNew = if ($rotatedToken) { Invoke-Refresh -RefreshToken $rotatedToken } else { @{ status = 0; body = $null } }

"first_refresh_status=$($first.status)"
"old_token_after_rotation_status=$($secondWithOld.status)"
"new_token_status=$($thirdWithNew.status)"
```

Pass criteria:
- Initial refresh succeeds.
- Old refresh token is rejected after rotation (`401`/`403`).
- Rotated refresh token succeeds.

## Execution Log

- Environment: TBA
- Command(s): refresh token replay probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Old refresh token result: TBA
- New refresh token result: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Rotation flow traces: TBA
- Revocation verification: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `refresh-token-rotation`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include old/new token status outcomes
