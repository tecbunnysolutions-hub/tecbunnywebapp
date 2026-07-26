# RBAC Enforcement Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Role-denied identities must receive 403 responses for privileged endpoints.

## Prerequisites

- `API_BASE_URL` points to the target environment base URL.
- `RBAC_ROUTE_PATH` is a privileged endpoint (example: `/api/security/audit-logs`).
- `AUTH_TOKEN_DENIED_ROLE` belongs to a user that lacks required role.
- `AUTH_TOKEN_ALLOWED_ROLE` belongs to a user that has required role.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:RBAC_ROUTE_PATH = '/api/security/audit-logs'
$env:AUTH_TOKEN_DENIED_ROLE = 'REDACTED_DENIED_ROLE_TOKEN'
$env:AUTH_TOKEN_ALLOWED_ROLE = 'REDACTED_ALLOWED_ROLE_TOKEN'

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

$url = "$($env:API_BASE_URL)$($env:RBAC_ROUTE_PATH)"

$deniedStatus = Invoke-ApiStatus -Url $url -Token $env:AUTH_TOKEN_DENIED_ROLE
$allowedStatus = Invoke-ApiStatus -Url $url -Token $env:AUTH_TOKEN_ALLOWED_ROLE

"denied_status=$deniedStatus"
"allowed_status=$allowedStatus"
```

Pass criteria:
- Denied-role token receives `403`.
- Allowed-role token receives expected success/business status.

## Execution Log

- Environment: TBA
- Command(s): RBAC allow/deny probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Denied-role response(s): TBA
- Allowed-role response(s): TBA
- Pass/Fail: TBA

## Evidence Attachments

- Role matrix exercised: TBA
- Replay traces: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `rbac-enforcement`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include endpoint and observed status pairs
