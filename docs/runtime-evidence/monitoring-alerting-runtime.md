# Monitoring/Alerting Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — telemetry pipeline verified 2026-09-20; live alert-fire + ack drill still required

## Goal
Prove alert routing fires and is acknowledged.

## Telemetry pipeline evidence (2026-09-20)
- Proxy-level telemetry is emitted for every request via
  emitEnterpriseProxyTelemetry (packages/core/src/enterprise-analytics-proxy.ts):
  api_request events (success=medium / failure=high priority), staff_activity
  events on mutations, and critical-priority audit events on sensitive
  mutations. Events POST to the analytics ingest endpoint; failures are
  swallowed (.catch) so telemetry never breaks the request path.
- Health probes verified live today (health-check-runtime check PASS):
  /api/auth/session liveness + 6/6 smoke matrix against production.

## Remaining
Live alert drill (procedure steps 1-3): trigger a synthetic failure, confirm
the alert fires through the configured channel, and acknowledge it via the
superadmin command-center ack/assign workflow. Requires alert-channel access —
human drill. Paste the alert + ack trace here, then set status to "pass" and
refresh lastVerifiedAt in runtime-readiness-evidence.json.
4. Record alert latency and ack timestamp.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
