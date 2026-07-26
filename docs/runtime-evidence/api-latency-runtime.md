# API Latency Runtime Evidence

Date: 2026-07-26
Status: Pending completion

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

- Environment: TBA
- Command(s): k6 latency probe (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- p50: TBA
- p95: TBA
- p99: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Latency report output: TBA
- Endpoint grouping definition: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `api-latency-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include endpoint groups and percentile summary
