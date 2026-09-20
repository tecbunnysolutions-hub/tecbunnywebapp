# Runtime Evidence: API Latency

Generated: 2026-09-20 (runtime evidence regeneration)


## Result: PASS (measured 2026-09-20)

20 samples, GET https://www.tecbunny.com/api/products?limit=1 (2026-09-20):
min=909ms p50=981ms p95=2489ms p99=3184ms max=3184ms
(Production, cross-geography client, includes TLS + cold-start variance.)

Previous local baseline (2026-07-26, localhost:4013 /health, 60 samples):
p50=10.53ms p95=12.82ms p99=13.33ms — retained for regression comparison.
