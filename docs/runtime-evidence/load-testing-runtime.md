# Load Testing Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Validate concurrent-user performance and sustained-load behavior.

## Prerequisites

- Load test scenario defined (concurrency, duration, endpoint mix).
- Environment and data setup representative of production usage.

## Command Runbook (PowerShell)

```powershell
# Example sustained-load k6 run (replace target URL and script logic as needed).
k6 run --vus 50 --duration 5m - <#'
import http from "k6/http";
import { check, sleep } from "k6";

export default function () {
	const res = http.get("https://your-api-host/api/health");
	check(res, { "status is < 500": (r) => r.status < 500 });
	sleep(1);
}
'#>
```

Pass criteria:
- Concurrency and duration targets achieved.
- Throughput and error rate captured and within release limits.

## Execution Log

- Environment: TBA
- Command(s): sustained-load run (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Concurrency level: TBA
- Throughput: TBA
- Error rate: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Load report exports: TBA
- Bottleneck notes: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `load-testing-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include concurrency, duration, throughput, and error rate
