# Tenant/Branch Isolation Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove org/branch boundaries cannot be crossed via API.

## Procedure
1. As tenant-A user, request a tenant-B resource by ID (order, customer) — expect 404/403.
2. Repeat across branch-scoped mgmt endpoints.
3. Verify RLS denial at DB level by querying with a restricted role.
4. Record traces.

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
