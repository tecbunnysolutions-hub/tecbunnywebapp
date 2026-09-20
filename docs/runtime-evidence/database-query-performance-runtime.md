# Database Query Performance Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Query plan/perf evidence on production-like data.

## Procedure
1. Run EXPLAIN ANALYZE on the 10 hottest queries (product list, order lookup, dashboard aggregations).
2. Record timings and index usage.
3. Flag any seq scans on large tables.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
