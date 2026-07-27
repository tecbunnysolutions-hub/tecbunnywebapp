# Provider-Native Probes Runtime Evidence

Date: 2026-07-27
Scope: Optional infrastructure probe adapters for Redis, database, and hosting providers
Status: Draft runbook

## Objective

Validate optional provider-native probes for faster root-cause isolation while preserving fail-open behavior for core health endpoints.

## Preconditions

- Feature flags exist for each probe adapter.
- Platform health endpoint can return normalized probe schema.
- Provider credentials and API scopes are configured for staging.

## Probe Domains

### Redis

- Ping latency
- Connected clients
- Memory pressure
- Evictions
- Replication lag (if replicas are used)

### Database

- Connection saturation
- CPU utilization
- Storage IOPS
- Lock wait time
- Slow query count

### Hosting

- CPU and memory pressure
- Disk usage growth
- Network throughput
- Packet loss or network error indicators
- Restart/error rates

## Runtime Validation Steps

1. Feature-flag control
- Enable each probe independently and verify data appears only when enabled.
- Disable all probes and verify baseline health endpoint still succeeds.

2. Timeout and fail-open behavior
- Inject provider delay or forced timeout.
- Confirm endpoint returns partial health and does not fail the full request.

3. Normalization contract
- Verify all providers map into a common health schema with source tagging:
  - source=provider
  - source=application

4. Data quality
- Cross-check sampled values against provider consoles for spot accuracy.
- Verify units and timestamp alignment.

5. Alert drill
- Trigger threshold breach scenarios and verify alert routing behavior.

## Evidence to Attach

- Health endpoint payload snapshots with probe-enabled and probe-disabled states.
- Timeout simulation logs showing partial health fallback.
- Schema validation output for normalized probe payload.
- Alert drill evidence for Redis, database, and hosting scenarios.

## Pass Criteria

- Probe adapters are optional and do not break core health checks.
- Timeout and provider failures degrade gracefully to partial health.
- Normalized schema is consistent across all enabled probes.
- Alert drills succeed for at least one scenario in each domain.

## Notes

- Treat this as medium-priority enhancement unless release authority promotes probe evidence to strict gate criteria.
