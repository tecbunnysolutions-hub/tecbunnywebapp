# TecBunny production go-live runbook

Prepared 27 October 2026 for the API VPS at `/opt/tecbunny`, using
`docker-compose.api.yml`, Caddy, Redis and an external Supabase database.
This document does not authorize or record a deployment. Current gate: **NO-GO**.
The traffic assumption is 100 concurrent users; request mix and SLOs need owner approval.

Updated 28 October: the separately approved connection repair is executed and verified
in [production-connection-repair-2026-10-28.md](production-connection-repair-2026-10-28.md).
Production still runs image `tecbunny-api:189aab37`. Its normal pg client now connects
through the session pooler with verified TLS; public health remains 503, blog 502,
and services 200. GitHub Actions cannot start because of an account billing lock.
Main has no branch protection/rulesets. These are outstanding release-owner actions.

## Release evidence required

Record the candidate Git SHA, deployed image digest, database migration version,
environment, timestamp, operator, commands, sanitized results and acceptance criteria
for each drill. Do not put credentials, tokens, customer payloads or backup contents
in evidence. Named release, database, security and incident owners are **unassigned**.

1. **Authorization BLOCKER:** test real customer, staff, root, separate-company and
   separate-branch identities. Record intended allows and denies for private orders,
   invoices, quotes, WABA history/media/assignment, and administrative mutations.
   Check expired/forged sessions and CSRF rejection. Local mocks do not close this item.
2. **Recovery BLOCKER:** restore a current backup into an isolated database, verify
   representative order/payment relationships and tenant policies, measure recovery
   time and recovery point, then obtain database-owner acceptance. Backup provider,
   restore command, RTO and RPO are **unresolved**; do not run a guessed command on production.
3. **Migration BLOCKER:** compare production relation definitions, grants and functions
   with the committed migration set. Rehearse unapplied migrations on the restored
   copy, record locks/timing, and verify the old and new application versions against
   the resulting schema. The archival-column repair adds nullable fields and preserves
   existing values. The separate `20261028000000_atomic_product_archival.sql` installs
   service-only atomic archive/restore and append-only audit snapshots. Its isolated
   tests pass, including broad default grants; this is not a production-like rehearsal.
   Legacy archives without a trusted snapshot require reconciliation and return 409
   rather than automatically becoming active. Do not manufacture historical states.
4. **Runtime failures HIGH:** retest the 22 routes listed in
   `docs/api-audit/live-api-audit.md`. Retain the verified pooler/CA configuration
   and its read-only certificate mount. Check communication-preferences view/base-table
   grants for the service role; retain private OTP access and RLS. Verify public
   content queries expose only intended published fields.
5. **Business workflows HIGH:** use provider sandbox accounts to prove checkout,
   duplicate callbacks, local settlement, staff order visibility, quote links,
   uploads, tenant-scoped WhatsApp delivery/history and email delivery. Preserve
   receipts without private payloads. Never reuse a paid production order as a test.
6. **Capacity HIGH:** run an approved staging soak with 100 concurrent users and
   agreed headroom, realistic reads/writes and provider stubs. Record throughput,
   p95/p99 latency, errors, CPU/memory, connections and queue depth. Duration,
   latency/error budgets and headroom are **unresolved**. The old 20-request-concurrency
   public-read probe does not satisfy this condition; do not run it on production.
7. **Alerting HIGH:** fire a controlled staging failure, record alert delivery,
   acknowledgement, escalation and runbook use. Alert destination, responder and
   escalation deadline are **unassigned**.
8. Refresh mobile LCP, keyboard/screen-reader checks, browser support, privacy and
   retention/deletion verification. Legal and support acceptance remain outstanding.

Update `quality/runtime-readiness-evidence.json` only after each check actually
passes. Keep failed/pending evidence honest; do not refresh timestamps for old drills.

## Pre-deploy checks

Run on the reviewed candidate revision:

```sh
npm ci
npm audit --audit-level=high
npm run check
npm run test:security-migrations
npm run validate:product-ux
npm run validate:launch-readiness
npm run validate:infra-observability
npm run validate:runtime-readiness
npm run build
```

Build with the intended public configuration and server credentials supplied by the
approved CI secret store. Do not use production credentials in pull requests.
Resolve every failing gate before release. Check branch protection and production
environment approvals in GitHub; these settings cannot be established by YAML alone.
The Zod maintainer backport has source/runtime checksum and regression checks, but
raw audit still reports version 4.6.5. Review [the pinned backport](../patches/zod/README.md)
or adopt a published patched release; no audit exception or acceptance is recorded.

## Deployment — only after authorization and a passing gate

The API workflow now calls CI and strict readiness before building an image. It
deploys the image tagged with the candidate SHA and checks out that same SHA on the
VPS. It reads `.env.local` for Compose interpolation and replaces only the API service.
No automatic database migration or Caddy/Redis replacement is included.

Before approving the production job, record the previous Git SHA, API image reference
and digest, and verify the old image is still available in GHCR/local Docker storage.
Keep `.env.local` private. If database migration is required, a database owner must
execute the reviewed migration plan separately before application deployment.
For `20261027000000_product_archival_columns.sql`, inspect existing field types first;
`IF NOT EXISTS` intentionally does not rewrite incompatible live types.
`20261027000001_communication_preferences_service_read.sql` adds SELECT for the service
role only. Inspect view security-invoker semantics and underlying permissions before
applying it; the migration deliberately does not broaden browser access or rewrite RLS.
Reconcile live schema/history for all four prepared migrations and rehearse pending
changes in order before applying them. The audit-grant follow-up was executed with
approval and 18 live privilege assertions; its private ACL rollback record is linked
in [production-audit-grant-repair-2026-10-28.md](production-audit-grant-repair-2026-10-28.md).
Other schema changes were observed installed by an unidentified actor. Preserve the
new audit table/history during rollback; do not drop it to revert an application.
The production connection repair's private environment backup is outside the checkout
under `/var/backups/tecbunny/connection-repair-20261028T022308Z/`. It is an environment
rollback copy, **not a database backup** or evidence of a restore rehearsal.

## Smoke tests

The workflow probes `https://api.tecbunny.com/api/health`. A passing probe checks
environment/database access; SMTP/WhatsApp configuration is not proof of delivery.
Run the authenticated role matrix and sandbox business checks above. Separately run
`npm run smoke:production` for storefront pages; it is not an API transaction test.
Check private responses have `Cache-Control: private, no-store` and public health
responses contain no private database details. Observe Redis and provider errors.

## Rollback

Trigger rollback for failed health, broken checkout/settlement, tenant exposure or
material error regression. Numeric thresholds and the incident decision owner remain
**unresolved**. A failed workflow health check currently fails the job; it does **not**
automatically restore the previous image.

After explicit operational authorization, use the recorded previous SHA and image on
the VPS. Verify schema compatibility first. With those values assigned to
`PREVIOUS_REVISION` and `PREVIOUS_API_IMAGE`:

```sh
cd /opt/tecbunny
git fetch origin "$PREVIOUS_REVISION"
git checkout --detach "$PREVIOUS_REVISION"
export API_IMAGE="$PREVIOUS_API_IMAGE"
# Older revisions lack the CA mount. Preserve it with an image-specific override.
# ROLLBACK_OVERRIDE must name a new file in the recorded private release directory.
cat > "$ROLLBACK_OVERRIDE" <<EOF
services:
  api:
    image: ${PREVIOUS_API_IMAGE}
    volumes:
      - /opt/tecbunny/certs/supabase-ca.crt:/run/certs/supabase-ca.crt:ro
EOF
docker compose --env-file .env.local -f docker-compose.api.yml -f "$ROLLBACK_OVERRIDE" pull api
docker compose --env-file .env.local -f docker-compose.api.yml -f "$ROLLBACK_OVERRIDE" up -d --no-deps --no-build api
curl --fail --silent --show-error https://api.tecbunny.com/api/health
```

Do not drop columns, restore an old database over live financial transactions, or
remove images as an improvised rollback. Repeat smoke checks and record the result.
These commands require a staging rehearsal; writing them is not recovery evidence.

## First 24–72 hours

Monitor paid-but-unsettled orders, callback retries, error rate and p95/p99 latency,
database/Redis connectivity, CPU/memory, queue age/depth, notification delivery,
authorization denials, tenant-boundary violations and mobile LCP. Assign a responder
and escalation channel before launch. Run the readiness review again with the actual
deployment and rehearsal evidence before changing the verdict.
