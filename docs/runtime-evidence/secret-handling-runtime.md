# Secret Handling Runtime Evidence

Date: 2026-07-26
Status: Pending completion

## Scope

Secrets must be sourced securely and not leaked in application logs.

## Prerequisites

- Access to deployment/runtime configuration metadata (without revealing values).
- Access to recent application logs in target environment.

## Command Runbook (PowerShell)

```powershell
# 1) Verify presence of required secret keys without printing secret values.
$requiredEnvKeys = @(
	'NEXT_PUBLIC_SUPABASE_URL',
	'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
	'SUPABASE_SECRET_KEY',
	'SUPABASE_SERVICE_ROLE_KEY',
	'SESSION_SECRET',
	'SUPERADMIN_SESSION_SECRET',
	'TOTP_SECRET_ENCRYPTION_KEY'
)

foreach ($k in $requiredEnvKeys) {
	$exists = [bool](Get-ChildItem Env:$k -ErrorAction SilentlyContinue)
	"env_key_present::$k=$exists"
}

# 2) Optional local leak-scan probe on captured log file (replace path).
$logFile = 'TBA.log'
if (Test-Path $logFile) {
	Select-String -Path $logFile -Pattern 'SUPABASE|SECRET|TOKEN|PASSWORD|API_KEY' -SimpleMatch:$false | Select-Object -First 20
} else {
	'log_file_not_found=provide_target_log_export'
}
```

Pass criteria:
- Required secret keys are configured in runtime environment.
- No plaintext secret values are observed in sampled logs.
- Secret material is sourced from secure configuration path and rotation policy is documented.

## Execution Log

- Environment: TBA
- Command(s): env-key presence and log leak-scan probes (see runbook)
- Commit SHA: TBA
- Executed At (UTC): TBA

## Results

- Secret source verification: TBA
- Log leakage scan summary: TBA
- Pass/Fail: TBA

## Evidence Attachments

- Sanitized configuration proof: TBA
- Rotation/management notes: TBA

## Gate Update Instructions

When pass criteria are met, update `runtime-readiness-evidence.json`:
- check id: `secret-handling-runtime`
- status: `pass`
- lastVerifiedAt: UTC ISO timestamp
- notes: include validated key presence summary and leak-scan outcome
