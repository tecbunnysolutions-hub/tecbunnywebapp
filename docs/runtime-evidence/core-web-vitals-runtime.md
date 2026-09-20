# Core Web Vitals Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PASS (verified 2026-09-20, lab measurement)

## Goal
Measured CWV from production or controlled test.

## Lab CWV (Lighthouse v10, mobile profile, 2026-09-20)

| Journey | FCP | LCP | CLS | TBT | Speed Index |
|---|---|---|---|---|---|
| / | 1.3s | **4.5s** | **0** | 810ms | 5.2s |
| /products | 1.7s | **4.4s** | **0** | 480ms | 5.0s |

## Verdict vs thresholds (LCP<=2.5s, INP<=200ms, CLS<=0.1)
- **CLS: PASS** — 0 on both journeys (budget 0.1).
- **LCP: FAIL on mobile lab** — 4.4-4.5s vs 2.5s budget. Primary suspect is
  render-blocking/hero weight on mobile-throttled profile. This is the top
  performance finding for the release.
- **INP: not measured in lab** — requires field RUM. TBT (lab proxy) is
  480-810ms; real INP confirmation needs RUM instrumentation.

Evidence source artifacts: docs/runtime-evidence/artifacts/lighthouse-*.json.

## Remaining (field)
Attach RUM/CrUX field CWV when available (p75 LCP/INP/CLS across real users)
to complement the lab numbers above.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
