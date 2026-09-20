# Load Testing Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Concurrency and sustained-load run artifacts.

## Procedure
1. Run k6/artillery against staging or a production maintenance window: product listing + order read paths.
2. Record RPS, p95/p99 latency, error rate at target concurrency.
3. Confirm autoscaling/resource headroom.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
