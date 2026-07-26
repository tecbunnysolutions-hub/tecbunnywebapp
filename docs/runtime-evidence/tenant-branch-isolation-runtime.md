# Tenant and Branch Isolation Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Cross-tenant and cross-branch access must be denied for read and write operations.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `ISOLATION_ROUTE_PATH` points to a tenant/branch-scoped resource route.
- `TOKEN_TENANT_A_BRANCH_A` and `TOKEN_TENANT_B_BRANCH_B` are valid tokens from different scopes.
- `RESOURCE_ID_TENANT_A_BRANCH_A` belongs only to tenant A, branch A.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$env:ISOLATION_ROUTE_PATH = '/api/orders'
$env:TOKEN_TENANT_A_BRANCH_A = 'REDACTED_TOKEN_A'
$env:TOKEN_TENANT_B_BRANCH_B = 'REDACTED_TOKEN_B'
$env:RESOURCE_ID_TENANT_A_BRANCH_A = 'replace-with-scope-owned-id'

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

$urlSameScope = "$($env:API_BASE_URL)$($env:ISOLATION_ROUTE_PATH)/$($env:RESOURCE_ID_TENANT_A_BRANCH_A)"

$allowedStatus = Invoke-ApiStatus -Url $urlSameScope -Token $env:TOKEN_TENANT_A_BRANCH_A
$crossScopeStatus = Invoke-ApiStatus -Url $urlSameScope -Token $env:TOKEN_TENANT_B_BRANCH_B

"same_scope_status=$allowedStatus"
"cross_scope_status=$crossScopeStatus"
```

Pass criteria:
- Same-scope token is allowed (expected success/business status).
- Cross-scope token is denied (`403` or `404` based on concealment strategy).

## Execution Log

- Environment: TBA
- Command(s): scope-isolation replay probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Tenant isolation checks: TBA
- Branch isolation checks: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Forbidden-path traces: TBA
- Allowed-path control traces: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `cross-tenant-cross-branch-isolation`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include resource IDs (redacted) and denied status behavior
