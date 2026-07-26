# Rollback Rehearsal Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Prove rollback can restore previous known-good state.

## Prerequisites

- Current deploy reference and rollback target reference identified.
- Service health probes available before and after rollback.

## Command Runbook (PowerShell)

```powershell
# Replace with your deployment rollback command sequence.
# Example placeholders:
"rollback_target_tag=TBA"
"execute_rollback_command=TBA"

# Post-rollback health checks (replace URLs)
Invoke-WebRequest -Uri 'https://your-api-host/health' -Method GET | Select-Object StatusCode
Invoke-WebRequest -Uri 'https://your-api-host/ready' -Method GET | Select-Object StatusCode
```

Pass criteria:
- Rollback command succeeds.
- Post-rollback health and smoke checks pass.
- No critical data inconsistencies observed.

## Execution Log

- Environment: TBA
- Command(s): rollback sequence + post-rollback probes (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Rollback command outcome: TBA
- Restored-state verification: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Rollback logs: TBA
- Post-rollback checks: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `rollback-rehearsal`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include rollback reference and health outcomes
