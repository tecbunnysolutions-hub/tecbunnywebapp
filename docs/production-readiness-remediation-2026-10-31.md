# TecBunny remaining-readiness remediation — 31 October 2026

**Starting verdict: NO-GO. Current verdict: NO-GO.** The public site is operational;
the missing launch controls below have not all been established. No production API
was published through GitHub. No customer data was changed for these drills.

The owner approved RPO at most 24 hours, RTO at most 60 minutes, a 100-user peak,
unexpected errors below 1% and API p95 below 2 seconds. The authoritative target
record is `quality/readiness-targets.json`.

## Results

| Finding | Implemented and verified | Disposition |
|---|---|---|
| Role, ownership and tenant isolation | Actual selected SQL migrations passed 289 synthetic PostgreSQL assertions across 22 roles, including checks after snapshot recovery. Live WABA restrictive policies were observed installed. Three fresh anonymous protected reads returned 401. | Partially fixed: the authenticated HTTP role/ownership/two-tenant matrix is still unverified. |
| Database recovery | A read-only export over verified TLS completed in 324.48 seconds. It was encrypted before disk writes and transferred with checksum verification. Authenticated decryption and a real PostgreSQL 17.11 restore succeeded: **459 tables, 49,648 rows**, all archived table row counts matched. | Actual logical data recovery verified; sustained RPO and full managed-service recovery remain unverified. |
| Storage recovery | All **230 objects / 8,812,253 bytes** were fetched with ETags and sizes matching the restored database snapshot. The encrypted archive was decrypted into a separate private directory; every recovered file matched its SHA-256. | Local file recovery verified; restoration to a separate Supabase Storage service is outstanding. |
| 100-user capacity | A bounded load runner and seven regression tests verify 100 virtual users, distinct sessions, identity checks, production refusal, redirect refusal and error-stop behavior. | Prepared and tested tooling only. The real application soak on an isolated representative target has not run. |
| Provider delivery and alerts | Six local monitor tests cover threshold, cooldown, recovery, SMTP sink acceptance, failed-send retry, protocol restrictions and atomic state. The live WhatsApp credential probe returned 200. **Gmail SMTP authentication failed with 535 EAUTH**, with no backup SMTP configured. | Actual SMTP defect needs a replacement owner-managed credential; external delivery/alert acknowledgement remain unverified. |
| API publishing and release governance | GitHub API publisher ID 391773798 is disabled. Main requires an up-to-date Local release gate, one peer/last-push approval, stale-review dismissal and resolved conversations; admins are included; force pushes/deletion are blocked. Settings were read back. Local admission tooling is prepared and does not deploy. | Repository protections fixed. Full local admission is not yet passing; billing-locked GitHub Actions are not used to publish the API. |
| Dependency policy | One raw high Zod advisory remains. Exact upstream source/runtime backport checks pass. Five tests verify the proposed policy fails closed for changed findings, versions, hashes, malformed reports and expiry. Registry latest remains 4.6.5 on 31 October. | Proposed temporary policy remains **unapproved**, expiring 13 November. It still blocks admission. |

## Evidence and scope

**New MEDIUM development-tool follow-up:** the 31 October audit also reports 18
moderate transitive findings tracing to two advisories in glob/minimatch. All
reported affected copies are development dependencies in the lockfile. The named
fixed package versions are unavailable from the configured registry. No forced
legacy-tool downgrade or incompatible override was applied. See the updated
dependency-policy proposal and `dependency-audit-summary.json`; these findings are
not hidden by the temporary high/critical admission policy.

Sanitized observations are in `docs/runtime-evidence/readiness-2026-10-30/`:

- `public-smoke.json`: all nine sequential production GET checks passed on
  31 October; health is healthy/redacted/no-store, public reads work and anonymous
  privileged reads are denied. This is not a load test.
- `local-recovery.json`: migration/runner hashes and 289 assertions, explicitly
  labelled synthetic PGlite evidence.
- `encrypted-database-capture.json`, `native-database-recovery.json`: real export,
  immutable client/source image identities, encryption and restore results.
- `storage-capture.json`, `storage-recovery.json`: object counts, version matching,
  encrypted archive and per-file integrity verification. No object names or customer
  content are published.
- `provider-inspection.json`, `release-controls.json`: bounded provider observations
  and verified repository configuration.

The database source snapshot was captured on 30 October from API image
`sha256:7cfacbaf1447d152fef488c18a26effd6e6e06424f589b2ad4318d65118c000f`.
The restore target is native Windows PostgreSQL 17.11, obtained from EDB's official
binary archive with its vendor-published SHA-256 verified. It is a different OS and
platform from production Supabase. The approximately **11-second measurement covers
import and row-count checks on a prepared target**; it excludes tooling/cluster
provisioning, key retrieval, transfer and application/service failover. It does not
establish the complete 60-minute service RTO.

The first export attempt reached its 180-second safety limit and was not counted
as a backup. The subsequent 600-second-bounded attempt succeeded with the same
read-only, memory, CPU, disk and size safeguards. Initial native CLI configuration
used an empty `PGSERVICE` override, which libpq rejected; removing that override
allowed the successful import. Failed attempts are not represented as passes.

The decryption key stayed on the owner's PC. Private archives, object mappings,
plaintext restore files and logs are outside Git under an owner/SYSTEM-only ACL.
The restore database has been stopped and its loopback port closed. No Windows
service was registered. No production restore, migration, provider message, charge
or 100-user production load was performed.

## Needs human action

- **SMTP credential:** create a Gmail app password in the account configured by
  `SMTP_USER`, then securely update `SMTP_PASS` in the primary checkout's private
  `.env.local`. Keep it out of chat. The existing local setting has not changed
  since the failed verification. Credential rotation is human-owned under the
  production-remediation skill. After verification, prepare the narrowly scoped
  server update and API restart before executing it.
- **Staging:** the free `tecbunny-readiness-staging` Supabase form was prepared in
  Seoul. The owner must complete password creation/submission and retain the
  credential securely. A representative isolated application host is also needed
  for capacity evidence; no paid host was provisioned and production was not loaded.
- **Dependency decision:** explicitly approve or reject the exact temporary
  verified-backport policy in `dependency-audit-policy-proposal-2026-10-30.md`.
  Generic remediation instructions are not recorded as exception approval.
- **Recovery continuity:** establish the recurring database/object capture,
  retention, key escrow and backup-failure channel. One successful capture is not a
  sustained 24-hour RPO guarantee. Managed Supabase/Storage failover remains a
  separate rehearsal.
  A concrete twice-daily database service/timer is prepared in
  [`ops/README.md`](../ops/README.md), with three passing cancellation/timeout
  tests. It is not installed or enabled. Automatic approval review blocked the
  remote Linux validation command because approval was required and this session
  cannot request it. Retention and storage-object recurrence remain separate.
- **Operations:** two test emails to the owner were explicitly approved: one
  delivery test and one simulated alert. None have been sent because SMTP rejects
  authentication. Inbox receipt/acknowledgement, an ongoing on-call channel and
  provider sandbox business flows still need verification.

The owner previously deferred Turnstile rotation; its configured value was not
changed by this work. That deferral is not recorded as successful rotation.

## Release and monitoring procedure

Use `local-api-release.md` for local admission, credential-free packaging, direct
SSH transfer, immutable candidate verification, API-only cutover, smoke checks and
the retained-image rollback. The local gate stops on its first actual failure and
records checks not run; it never emits a success for incomplete checks. Source
verification status on GitHub is separate from API artifact publication.

Keep strict runtime readiness failing until the authenticated matrix, full recovery
and continuity, real 100-user soak, provider delivery/failure drills and admission
conditions are supported by current evidence. During the first 24–72 hours, watch
health, errors/latency, memory/disk, database connections, queues, authorization
denials and provider delivery. The prepared host-side monitor has not been installed
as a production schedule or presented as an external host-outage monitor.

The clean local admission run at `3c7f0534fddafab8b19c6f7a4d4f6ee532da5584`
passed `npm ci` and source/runtime backport verification, then stopped at the
unapproved dependency policy. Its remaining checks were explicitly recorded as not
run. Later proposal-only changes do not convert that result into a passing gate.
