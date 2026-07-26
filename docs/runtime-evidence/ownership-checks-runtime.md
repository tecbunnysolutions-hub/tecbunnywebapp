# Ownership Checks Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

User-owned resources must reject non-owner access and permit owner access.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `OWNERSHIP_ROUTE_PATH` points to owner-scoped resource route.
- `OWNER_TOKEN` can access the target resource.
- `NON_OWNER_TOKEN` is authenticated but does not own the target resource.
- `OWNER_RESOURCE_ID` is a known resource owned by `OWNER_TOKEN` actor.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:OWNERSHIP_ROUTE_PATH = '/api/user/wishlist'
$env:OWNER_TOKEN = 'REDACTED_OWNER_TOKEN'
$env:NON_OWNER_TOKEN = 'REDACTED_NON_OWNER_TOKEN'
$env:OWNER_RESOURCE_ID = 'replace-with-owner-resource-id'

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

$url = "$($env:API_BASE_URL)$($env:OWNERSHIP_ROUTE_PATH)?resourceId=$($env:OWNER_RESOURCE_ID)"

$ownerStatus = Invoke-ApiStatus -Url $url -Token $env:OWNER_TOKEN
$nonOwnerStatus = Invoke-ApiStatus -Url $url -Token $env:NON_OWNER_TOKEN

"owner_status=$ownerStatus"
"non_owner_status=$nonOwnerStatus"
```

Pass criteria:
- Owner token is allowed (expected success/business status).
- Non-owner token denied (`403` or `404` depending on endpoint policy).

## Execution Log

- Environment: TBA
- Command(s): ownership allow/deny probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Non-owner denial cases: TBA
- Owner allow cases: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Request/response traces: TBA
- Resource IDs and actor mapping: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `ownership-checks`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include owner vs non-owner status outcomes
