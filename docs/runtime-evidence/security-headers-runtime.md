# Security Headers Runtime Evidence

Date: 2026-07-26
Status: Completed (local runtime rehearsal)

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

- Environment: local runtime rehearsal (api app on localhost:4015)
- Command(s): multi-route header capture via `Invoke-WebRequest`
- Commit SHA: c1b9506ea121ec7a1c62886b9cd2a580d1c45769
- Executed At (UTC): 2026-07-27T00:02:00Z

## Results

- Header matrix by route:
	- Route `/health`
		- `Content-Security-Policy`: present (`default-src 'none'; frame-ancestors 'none'; base-uri 'none'`)
		- `Strict-Transport-Security`: present (`max-age=31536000; includeSubDomains; preload`)
		- `X-Content-Type-Options`: present (`nosniff`)
		- `Referrer-Policy`: present (`strict-origin-when-cross-origin`)
	- Route `/api/auth/session`
		- `Content-Security-Policy`: present
		- `Strict-Transport-Security`: present (`max-age=31536000; includeSubDomains; preload`)
		- `X-Content-Type-Options`: present (`nosniff`)
		- `Referrer-Policy`: present (`strict-origin-when-cross-origin`)
	- Route `/api/docs/openapi`
		- `Content-Security-Policy`: present
		- `Strict-Transport-Security`: present (`max-age=31536000; includeSubDomains; preload`)
		- `X-Content-Type-Options`: present (`nosniff`)
		- `Referrer-Policy`: present (`strict-origin-when-cross-origin`)
- Additional runtime checks:
	- `/ready`: required header set present
	- `/live`: required header set present
- Pass/Fail: Pass

## Evidence Attachments

- Captured response headers: terminal output from local header probe on 2026-07-27T00:02:00Z
- Compliance notes (CSP/HSTS/XCTO/Referrer-Policy): required header set verified on all sampled critical routes in this rehearsal.

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `security-headers-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include route-header matrix summary
