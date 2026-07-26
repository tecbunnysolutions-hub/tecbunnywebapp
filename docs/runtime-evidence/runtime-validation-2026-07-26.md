# Runtime Validation Evidence - 2026-07-26

Date: 2026-07-26
Executor: GitHub Copilot (GPT-5.3-Codex)
Workspace: tecbunny monorepo

## Commands Executed

### 1) Test Suite Runtime Execution

Command:

```powershell
npm run test
```

Result: PASS

Key output:
- turbo run test completed successfully.
- packages/core Vitest: 6 test files passed, 44 tests passed.
- apps/public Vitest: no test files found, exited successfully because `--passWithNoTests` is enabled.
- Exit code: 0.

### 2) Security Gate Runtime Execution

Command:

```powershell
npm run validate:security-gate
```

Result: PASS (with approved exceptions)

Key output:
- Security gate passed with approved exceptions:
  - next (high)
  - postcss (high)
  - sharp (high)

### 3) Production-Style Build Runtime Execution

Command:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://placeholder.supabase.co';
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='placeholder';
$env:TECBUNNY_VALIDATE_ENV='off';
$env:NEXT_TELEMETRY_DISABLED='1';
npm run build
```

Result: FAIL

Failure summary:
- `superadmin` app build failed during Next.js page-data collection.
- Error surfaced while collecting page data for `/api/users`.
- Environment validation failure in runtime path reported missing:
  - `supabase.anonKey`
  - `supabase.serviceRoleKey`
- Overall build job exited with code 1 (`superadmin#build`).

Additional observation:
- Other app builds reached successful compile stages, but monorepo build is considered failed due to `superadmin` failure.

## Current Runtime Readiness Implications

- Testing:
  - CI test execution: implemented by workflow.
  - Runtime test command: passed for current workspace state.
- Security:
  - Dependency security gate command: passed according to allowlist policy.
- Deployment:
  - Production build verification: currently failing in this runtime environment due to missing required runtime secrets for superadmin route build path.

## Required Follow-up Before Production Ready

1. Provide production-like secret set for build-time/runtime environment validation in all apps (including superadmin service-role requirements).
2. Re-run full monorepo build and attach successful output for this same commit.
3. Continue evidence collection for pending categories: authz runtime replay, CSRF/JWT lifecycle, latency/perf/load, migration rollback/restore drills, and monitoring alert drills.

## 4) Follow-up Build Rehearsal (Same Date)

Command:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://demo.supabase.co';
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiZXhwIjo0MTAyNDQ0ODAwfQ.sig';
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='sb_publishable_demo_key_1234567890';
$env:SUPABASE_SERVICE_ROLE_KEY='sb_secret_demo_key_1234567890';
$env:SUPABASE_SECRET_KEY='sb_secret_demo_key_1234567890';
$env:TECBUNNY_VALIDATE_ENV='off';
$env:CI='false';
$env:NEXT_TELEMETRY_DISABLED='1';
npm run build
```

Result: PASS

Key output:
- All build tasks completed (`Tasks: 13 successful, 13 total`).
- Previous `superadmin` `/api/users` page-data build blocker did not reproduce under this env set.

Related artifact:
- `docs/runtime-evidence/production-build-rehearsal.md`
