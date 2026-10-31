# Local API releases

The release owner selected local/manual API publication. GitHub's **Deploy API to
VPS** workflow (ID 391773798) was disabled and read back as `disabled_manually` on
30 October 2026. This change set removes that publisher from source as well. GitHub
may still host source and run checks; it does not build, publish or deploy API images.
No registry login or GitHub billing fix is required for this release path.

## Admission

Use an isolated checkout at the exact reviewed commit, with a clean worktree and
lockfile. Install pinned dependencies and run the source/runtime backport tests,
dependency audit, architecture/API boundaries, TypeScript, lint, tests, migration
regressions, product gates and strict runtime readiness. Build with the intended
public configuration. Private production settings are attached only at runtime.
Save commands, exit codes, commit/tree/lock hashes, platform and time in the release
receipt. A local run does not establish that GitHub Actions passed.

The temporary verified-backport audit policy in
`quality/dependency-audit-policy.json` is **proposed and unapproved**. The raw high
advisory remains visible. `node scripts/audit-dependencies.mjs` fails closed without
approval, for an expired policy, an unknown high/critical finding, a changed package,
or failed source/runtime verification. The existing raw-audit CI gate is unchanged.

`node scripts/drill-local-recovery.mjs` verifies a synthetic PGlite fixture. It does
not substitute for managed Supabase recovery, HTTP authorization, provider delivery
or a representative 100-user capacity test. Strict readiness must remain failing
while launch-critical evidence is missing. The manual route cannot waive it.

## Artifact preparation

Build on the local preparation machine, not the small production VPS. Use the pinned
Linux/musl dependency tree and the reviewed native CPU-v1 build recipe. The previous
releases needed a CPU-v1 Sharp/libvips overlay: neither the normal prebuilt binary nor
its Wasm SIMD fallback runs on this VPS. A generic newly pulled Node image does not
preserve that compatibility automatically.

The existing implementation and immutable receipts are documented in
`production-local-release-2026-10-29.md`, `production-blueprint-repair-2026-10-29.md`,
and the later `production-admin-product-release-2026-10-30.md` in the primary
checkout. These are historical executions, not permission to reuse stale hashes.

For every new candidate:

1. Record the current live image, application revision, active Compose override,
   health and native-runtime baseline directly from the server. Concurrent release
   work may have superseded an older document. Stop if the expected parent changed.
2. Package only the committed application and intended build output. Reject `.env`
   files, private values, compile canaries, unexpected links and archive traversal.
   Pin the archive SHA-256, build ID, lock semantics and exact parent image.
3. Transfer the archive and sanitized receipt directly over SSH/SCP. Enter the SSH
   credential only at the protected prompt. Never put it in command arguments,
   scripts, reports or Git. Verify the remote archive checksum before extraction.
4. Assemble a fresh candidate without production credentials, network membership or
   host mounts. Preserve the verified Linux dependency/native runtime only when
   dependency locks and schemas match exactly. A dependency change requires a full
   verified rebuild. Do not patch the live container in place.
5. Pin the resulting immutable image ID and record its parent and source identity.
   Run native conversion, bounded-parser, database TLS, Prisma and localhost API
   compatibility checks before cutover. Use a separate isolated database for any
   write, authorization, recovery or capacity test.

## API-only cutover and rollback

Do this only for an admitted, explicitly authorized release. Back up the current
private environment/override outside the checkout with restricted permissions.
Retain the previous immutable image. Prepare **both** the live and rollback Compose
overrides, preserving the provider CA read-only mount and current runtime settings.

On the server, with `RELEASE_OVERRIDE` set to the reviewed, absolute candidate
override path:

```sh
cd /opt/tecbunny
docker compose --env-file .env.local -f docker-compose.api.yml -f "$RELEASE_OVERRIDE" up -d --no-deps --no-build api
```

Do not run a bare Compose update, rebuild the full application on the VPS, pull a
GitHub registry image, restart surrounding services, or run automatic migrations.
Verify Docker health; public health/blog/services/blueprints; anonymous privileged
denials; the restricted blueprint projection; and preserved Caddy/Redis/MailHog
identities. Record the actual deployed immutable image and active override.

If checks fail, stop the release and use the prepared `ROLLBACK_OVERRIDE`:

```sh
cd /opt/tecbunny
docker compose --env-file .env.local -f docker-compose.api.yml -f "$ROLLBACK_OVERRIDE" up -d --no-deps --no-build api
```

Repeat health and smoke checks and save the result. Never restore an old database
over new customer transactions as an application rollback. Image replacement and
database recovery are separate procedures.

## Controls still requiring runtime evidence

The site is already operational. Full readiness remains **NO-GO** until the pending
role/ownership/tenant HTTP matrix, actual Supabase backup/restore, 100-user capacity,
provider delivery/failure alerts and release controls are evidenced. Drill
targets were approved by the owner on 30 October: RPO 24 hours, RTO 60 minutes,
100 users, unexpected errors below 1% and API p95 below 2 seconds. See
`quality/readiness-targets.json`. Writing this runbook is not execution evidence.
