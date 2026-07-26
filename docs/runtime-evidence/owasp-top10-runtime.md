# OWASP Top 10 Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Document DAST or penetration-test verification against OWASP Top 10 risks.

## Prerequisites

- A DAST tool installed (for example OWASP ZAP baseline scan) or approved penetration-test execution process.
- `TARGET_BASE_URL` configured for the environment under test.

## Command Runbook (PowerShell)

```powershell
$env:TARGET_BASE_URL = 'https://your-public-host'

# Example using OWASP ZAP Docker baseline scan.
# Replace report path as needed.
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py `
	-t $env:TARGET_BASE_URL `
	-J zap-baseline-report.json `
	-r zap-baseline-report.html
```

Pass criteria:
- No unresolved Critical/High findings without approved risk acceptance.
- Findings are triaged with remediation owner and due date.

## Execution Log

- Environment: TBA
- Tool(s): DAST/pen-test runner (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Findings summary: TBA
- Remediation status: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Scan/export reports: TBA
- Issue links: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `owasp-top10-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include scan baseline and residual accepted risks (if any)
