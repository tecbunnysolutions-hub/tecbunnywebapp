# Rate Limiting Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove 429 behavior at configured thresholds.

## Procedure
1. Pick a rate-limited endpoint (e.g. /api/auth/send-otp).
2. Issue burst requests above the configured limit from a single IP.
3. Record the first 429 response, its Retry-After header, and recovery after window expiry.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
