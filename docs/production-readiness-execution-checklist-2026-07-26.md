# Production Readiness Execution Checklist

Generated: 2026-09-20 (runtime evidence regeneration)


Living checklist; refreshed 2026-09-20.

## Automated gates (all PASS on 2026-09-20)
- [x] validate:product-ux (10 validators + 4 app typechecks)
- [x] validate:db-readiness
- [x] lint (6/6 turbo tasks)
- [x] test (50/50)
- [x] build (13/13 turbo tasks)
- [x] smoke:production (6/6 routes)

## Manual drills (tracked in runtime-readiness-evidence.json, status=pending)
- [ ] RBAC role-denial/allow trace capture
- [ ] Cross-tenant / cross-branch isolation replay
- [ ] Ownership forbidden-path checks
- [ ] JWT expiry/rejection/renewal runtime trace
- [ ] Refresh token rotation replay
- [ ] CSRF cookie-flow proof
- [ ] Rate-limit 429 threshold probe
- [ ] Secret-source & rotation evidence
- [ ] OWASP/DAST scan report
- [ ] Lighthouse run on critical journeys
- [ ] Core Web Vitals measurement
- [ ] DB query performance capture on production-like data
- [ ] Load test run
- [ ] Migration safety rehearsal with timing
- [ ] Rollback rehearsal
- [ ] Backup/restore rehearsal with RTO/RPO
- [ ] Monitoring alert-routing drill
