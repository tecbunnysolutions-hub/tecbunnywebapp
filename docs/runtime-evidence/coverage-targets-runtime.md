# Coverage Targets Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PASS (verified 2026-09-20)

## Goal
Attach a coverage summary against enforced thresholds.

## Measured coverage (executed 2026-09-20)

Command: `npx vitest run --coverage` in packages/core (provider:
@vitest/coverage-v8). Suite: 12 test files, 85 tests — all passing.

```
Statements : 23.4% ( 608/2598 )
Branches   : 19.79% ( 475/2399 )
Functions  : 46.65% ( 230/493 )
Lines      : 23.76% ( 576/2424 )
```

## Enforced thresholds (added 2026-09-20)
packages/core/vitest.config.ts now enforces a ratchet baseline via
test.coverage.thresholds (statements 20 / branches 18 / functions 40 /
lines 20), set at the measured level and intended to be raised per release.
The suite was run with --coverage and exits non-zero below the threshold.

## CI enforcement (added 2026-09-20)
.github/workflows/ci.yml `quality` job now runs `npx vitest run --coverage`
in packages/core after `npm test`, so the threshold gate runs on every push.

## Remaining
Extend coverage runs to the other test-bearing packages (apps/waba,
packages/ui) and ratchet thresholds upward per release.
