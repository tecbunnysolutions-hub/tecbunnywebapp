# Refresh Token Rotation Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove refresh token rotation + reuse revocation.

## Procedure
1. Perform a refresh; confirm a new refresh token is issued.
2. Replay the OLD refresh token — expect rejection (rotation reuse detection).
3. Record Supabase auth responses.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
