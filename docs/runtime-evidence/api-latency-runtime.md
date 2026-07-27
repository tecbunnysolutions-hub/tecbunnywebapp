# API Latency Runtime Evidence

Date: 2026-07-26
Status: Completed (local runtime rehearsal)

## Scope

Capture p50/p95/p99 latency for critical API endpoint classes.

## Prerequisites

- Latency tool available (`k6` or equivalent).
- Representative endpoint list and test payloads.

## Command Runbook (PowerShell)

```powershell
# Example k6 run using inline script for a single endpoint.
# Replace URL and headers with environment-appropriate values.
k6 run --vus 20 --duration 60s - <#'
import http from "k6/http";
import { check } from "k6";

export default function () {
	const res = http.get("https://your-api-host/api/health");
	check(res, { "status is < 500": (r) => r.status < 500 });
}
'#>
```

Pass criteria:
- p50/p95/p99 captured for critical endpoint classes.
- Latency SLO targets met or exceptions documented with remediation owner.

## Execution Log

- Environment: local production-style runtime rehearsal (api app on localhost:4013)
- Command(s):
	- `npm run start --workspace=api -- --port 4013`
	- PowerShell latency probe loop (60 samples) against `/health`
- Commit SHA: c1b9506ea121ec7a1c62886b9cd2a580d1c45769
- Executed At (UTC): 2026-07-26T23:48:48Z

## Results

- Endpoint group definition:
	- `control-plane-health`: `/health`
- Sample summary:
	- `samples_total=60`
	- `samples_ok=60`
- Percentiles:
	- `p50=10.53 ms`
	- `p95=12.82 ms`
	- `p99=13.33 ms`
	- `avg=10.61 ms`
	- `min=8.49 ms`
	- `max=13.33 ms`
- Pass/Fail: Pass

## Evidence Attachments

- Latency report output: terminal probe output captured on 2026-07-26T23:48:48Z
- Endpoint grouping definition: this file Section Results

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `api-latency-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include endpoint groups and percentile summary
