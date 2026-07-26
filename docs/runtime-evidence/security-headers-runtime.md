# Security Headers Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Critical entry points must return expected security headers.

## Prerequisites

- `API_BASE_URL` points to target environment base URL.
- `HEADER_PATHS` includes critical routes for verification.

## Command Runbook (PowerShell)

```powershell
$env:API_BASE_URL = 'https://your-api-host'
$paths = @('/api/health', '/api/auth/session', '/api/security/settings')

foreach ($path in $paths) {
	$url = "$($env:API_BASE_URL)$path"
	try {
		$resp = Invoke-WebRequest -Uri $url -Method GET
		$headers = $resp.Headers
	} catch {
		if ($_.Exception.Response) {
			$headers = $_.Exception.Response.Headers
		} else {
			throw
		}
	}

	"route=$path"
	"csp=$($headers['Content-Security-Policy'])"
	"hsts=$($headers['Strict-Transport-Security'])"
	"x_content_type_options=$($headers['X-Content-Type-Options'])"
	"referrer_policy=$($headers['Referrer-Policy'])"
	''
}
```

Pass criteria:
- Required headers are present on critical entry points.
- Header values align with expected policy profile.

## Execution Log

- Environment: TBA
- Command(s): multi-route header capture (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Header matrix by route: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Captured response headers: TBA
- Compliance notes (CSP/HSTS/XCTO/Referrer-Policy): TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `security-headers-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include route-header matrix summary
