# Database Query Performance Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Record query timings and execution-plan evidence for high-impact flows.

## Prerequisites

- Access to production-like database and read-only diagnostics.
- List of high-impact queries tied to key workflows.

## Command Runbook (PowerShell)

```powershell
# Example placeholder command for collecting DB diagnostics output.
# Replace with your approved DB diagnostic workflow.
npm run validate:db-readiness
```

Pass criteria:
- Query timing and plan evidence captured for top workflows.
- Identified slow queries have remediation actions or accepted risk notes.

## Execution Log

- Environment: TBA
- Command(s): DB readiness and query diagnostics collection (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Top slow queries: TBA
- Optimization status: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Plan captures: TBA
- Timing logs: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `database-query-performance-report`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include top query metrics and optimization outcome
