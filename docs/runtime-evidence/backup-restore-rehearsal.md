# Backup/Restore Rehearsal

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PENDING — drill not yet executed

## Goal
Prove restore works with measured RTO/RPO.

## Procedure
1. Take a fresh Supabase backup/snapshot.
2. Restore into an isolated instance.
3. Verify row counts on key tables (orders, profiles, products) match source.
4. Record restore duration (RTO) and data currency (RPO).

## Evidence to attach after execution
Paste command transcripts / screenshots / exported reports into this file, then
set the check status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
