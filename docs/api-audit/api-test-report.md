# API Test Report

Generated: 2026-09-20 (runtime evidence regeneration)


## Production probes (2026-09-20)

### Auth boundary
Anonymous probe: GET https://api.tecbunny.com/api/security/audit-logs
Result: HTTP 401 (no session cookie, no bearer token) — gateway auth wall confirmed.

### Latency
20 samples, GET https://www.tecbunny.com/api/products?limit=1 (2026-09-20):
min=909ms p50=981ms p95=2489ms p99=3184ms max=3184ms
(Production, cross-geography client, includes TLS + cold-start variance.)

### Smoke matrix
6/6 PASS against https://www.tecbunny.com
- / (200, 2089ms), /products (200, 271ms), /services (200, 618ms)
- /services/smart-infrastructure (200, 524ms), /services/network-infrastructure (200, 495ms)
- /services/physical-security (200, 556ms)
