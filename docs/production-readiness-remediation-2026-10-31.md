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
| Provider delivery and alerts | The owner created a replacement SMTP credential. Local and live API authentication now pass; the two approved delivery/simulated-alert emails were observed in the inbox. The API-only refresh retained its exact image and surrounding services. Six local monitor tests passed. The WhatsApp read-only credential probe returned 200. | SMTP authentication defect and the two inbox-delivery checks are fixed. Ongoing monitoring, owner acknowledgement/escalation and other provider business flows remain unverified. |
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
service was registered. No production restore, migration, charge or 100-user
production load was performed. The later SMTP repair sent exactly the two approved
test messages; those contained only a test ID/status and no customer data.

## SMTP repair completed

After the owner created the Google app password and requested its update, the
private local setting was backed up and updated without logging its value. Local
authentication passed. One delivery test and one simulated failure alert were
accepted and observed in the Gmail inbox. No additional test messages were sent.

The production preflight confirmed the same account and healthy immutable image.
The server's private environment was backed up; only `SMTP_PASS` changed. Only the
API was recreated, retaining image
`sha256:7cfacbaf1447d152fef488c18a26effd6e6e06424f589b2ad4318d65118c000f`.
Runtime environment/mount comparisons passed; surrounding container identities
were unchanged. SMTP authentication from inside the live API passed at
03:20:55 UTC on 31 October (08:50:55 IST). All nine subsequent public smoke checks
passed. This does not establish that an ongoing alert schedule is installed.

The private live and rollback overrides are recorded in
`production-smtp-verification-2026-10-31.json`. Preserve the current private SMTP
override when preparing a future API replacement; it is part of the current
Compose configuration. These private configuration files must not be copied into
public release artifacts or Git. No API image was built or published for this fix.

## Needs human action

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
- **Operations:** the two approved email tests have arrived. Owner acknowledgement,
  a persistent on-call channel, escalation and other provider sandbox business
  flows still need verification. The simulated alert did not inject a production
  outage and does not prove a deployed monitor is running.

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
