# Load Testing Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — concurrency probe clean 2026-09-20; full sustained-load run (k6/artillery at target RPS) still required

## Goal
Concurrency and sustained-load run artifacts.

## Concurrency probe (executed 2026-09-20)

Runner: scripts/load-probe-2026-09-20.mjs (reproducible: `node scripts/load-probe-2026-09-20.mjs`)
Target: GET https://www.tecbunny.com/api/products?limit=1 (production, cross-geography client)
Profile: 60 requests, 10 concurrent workers

```
total=60 statuses={"200":60}
min=877ms p50=932ms p95=1454ms p99=1727ms max=1727ms
errors=0
```

Result: 100% success under 10x concurrency; no 429/5xx; p95 within the
observed single-request envelope (api-latency-runtime.md p95=2489ms).

## Sustained load (executed 2026-09-20, heavier profile)

Runner: scripts/load-sustained-2026-09-20.mjs (reproducible: `node scripts/load-sustained-2026-09-20.mjs`)
Profile: 200 requests, 20 concurrent workers, rotating across 3 endpoints
Result:
```
elapsed=9.0s rps=22.1
total=200 statuses={"200":134,"401":66}
min=219ms p50=752ms p90=1499ms p95=1792ms p99=2220ms max=2243ms
```

Per-endpoint breakdown:
- products?limit=1: 67/67 HTTP 200, 0 errors (max 2243ms)
- offers: 67/67 HTTP 200, 0 errors (max 2199ms)
- settings: 66/66 HTTP 401 (max 881ms)

**On the true public endpoints (products + offers): 134/134 success, 0 errors
at 22 RPS / 20 concurrent — PASS.** No 5xx, no throttling on public reads.

### Finding (not a load failure): /api/settings gateway inconsistency
`GET /api/settings` is listed under publicRoutes in apps/api/src/proxy.ts but
returned 401 on https://www.tecbunny.com under load. Either the publicRoutes
match is not landing on this host, or the route is intentionally
session-gated in production and the source comment is stale. This should be
reconciled — if /api/settings is meant to be public, the gateway is
over-gating it; if it is meant to be protected, the publicRoutes entry is
misleading. Flagged for follow-up.

## Remaining
A full k6/artillery run at a defined target RPS for a sustained duration
(minutes, not seconds) with autoscaling/resource-headroom confirmation on the
hosting platform. The 9-second / 22 RPS burst above proves concurrency
stability; it does not measure sustained soak or autoscaling. Paste run
artifacts here, then set status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
