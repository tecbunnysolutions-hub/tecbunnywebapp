# Secret Handling Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — no-secret-leak proven 2026-09-20; live rotation drill still requires environment access

## Goal
Prove secrets come from the secret store and rotation works.

## No-secret-leak evidence (executed 2026-09-20)

1. **Tracked-file scan** — git ls-files (excluding lockfiles/docs/maps) scanned
   for AWS keys, private-key blocks, Stripe live/test keys, Slack tokens,
   GitHub PATs, GCP API keys, and populated SUPABASE_SERVICE_ROLE_KEY:
   **0 matches**.
2. **Committed env files** — only `.env.example` is tracked; verified it holds
   placeholders/localhost URLs only (no real secret values).
3. **Build-time gate** — packages/core/src/environment-validator.ts runs as the
   root `prebuild` and hard-fails the build on missing/invalid env (freshly
   proven 2026-09-20: production build 13/13 passed through this gate).
4. **Runtime gate** — packages/database/src/env.ts throws on missing Supabase
   URL/keys and refuses to build a service client from a publishable/anon key
   (env.ts:144-154).

Secrets are sourced from environment (Vercel env / Supabase) — never from the
repository.

## Remaining
Live rotation drill (step 2): rotate one non-critical secret in the deployment
environment and verify old value rejected / new value accepted. Requires
environment access — human drill. Also grep the built `.next` client bundle for
known secret prefixes as a final leak check. Paste evidence here, then set
status to "pass" and refresh lastVerifiedAt in runtime-readiness-evidence.json.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
