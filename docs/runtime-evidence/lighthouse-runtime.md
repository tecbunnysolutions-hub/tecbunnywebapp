# Lighthouse Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PASS (verified 2026-09-20)

## Goal
Fresh Lighthouse runs for critical journeys.

## Runs (executed 2026-09-20, Lighthouse v10, mobile profile, headless Chrome)

Artifacts:
- docs/runtime-evidence/artifacts/lighthouse-home-2026-09-20.json
- docs/runtime-evidence/artifacts/lighthouse-products-2026-09-20.json

| Journey | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| / (home) | 61 | 99 | 100 | 92 |
| /products | 68 | 96 | 100 | 92 |

Note: npx lighthouse@11/12 could not resolve in this environment (transitive
dep b4a@^1.8.1 absent from registry; capped at 1.8.0) — v10 installed in a
scratch dir with b4a pinned to 1.8.0.

## Budget comparison (launch-quality-budgets.json)
- LCP budget 2500ms: **home 4.5s and /products 4.4s EXCEED the mobile budget**
  (lab, throttled mobile; field RUM may differ). This is a performance finding,
  not an evidence gap — see core-web-vitals-runtime.md.
- CLS budget 0.1: both journeys 0 — PASS.
- INP: not captured in Lighthouse v10 lab (lab metric is TBT: home 810ms,
  /products 480ms) — RUM required for INP confirmation.

Accessibility 96-99 and Best-Practices 100 corroborate the passing
accessibility-contract and security-headers checks.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
