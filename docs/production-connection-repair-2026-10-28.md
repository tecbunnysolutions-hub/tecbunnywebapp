# Production database connection repair — executed and verified

## Execution record

The user explicitly approved this connection repair and API restart on 28 October
2026. It was applied at 02:23 UTC; the API restarted at 02:23:55 UTC with the same
recorded image digest. The normal pg client, using only the updated `DATABASE_URL`,
passed `SELECT 1`; its TLS socket reported `encrypted=true` and `authorized=true`.
No custom test SSL override was used for this final check. No database writes or
migrations were performed. Caddy, Redis and MailHog retained their previous start times.

The private rollback environment is retained outside the checkout/build context at
`/var/backups/tecbunny/connection-repair-20261028T022308Z/env.before` (file 0600,
directory 0700). The secret-free execution record and Compose override are under
`/opt/tecbunny/releases/connection-repair-20261028T022308Z/` with restricted permissions.
The active environment file is mode 0600. The provider CA SHA-256 is
`700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7`.
Public route checks remained services 200, health 503 and blog 502, matching baseline.

The existing VPS Compose file remains unchanged; until the reviewed repository Compose
mount is deployed, API recreation commands **must include** the release directory's
`compose.connection.yml` override. A base-only recreation would lose the certificate
mount. The repository Compose change mounts the same `/opt/tecbunny/certs` directory
read-only for subsequent deployments. Never commit release backups or include them in
Docker build contexts; repository ignore rules now exclude both release and cert folders.

## Verified scope

On 28 October 2026 the production API uses `tecbunny-api:189aab37`, image digest
`sha256:39a0ff1f4fb41f724c13a48733e6a14ff74f224d8388249a3ca69dc9b6410870`.
Its direct PostgreSQL hostname resolves to IPv6 and the VPS reports `ENETUNREACH`.
The Supabase dashboard supplies this project's session pooler:

- Host: `aws-1-ap-northeast-2.pooler.supabase.com`, port `5432`.
- User: `postgres.yzrznydkqcacjiwalmlw`; database: `postgres`.
- Provider CA: https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

A read-only connection from the running API container succeeded using the existing
database password, the provider CA and `rejectUnauthorized: true`. `SELECT` confirmed
the expected database and products table. This verifies connectivity, not backups,
migrations or application deployment. The local and production Supabase project IDs
match. The approved configuration change is recorded above.

## Approved operational change

1. Reconfirm the running image digest and save a root-only copy of `.env.local` and
   the resolved, secret-free image reference in a timestamped release directory.
   Do not print environment contents or credential-bearing URLs.
2. Download the public CA over verified HTTPS, pin its SHA-256 in the release record,
   and store it under `/opt/tecbunny/certs/supabase-ca.crt` (readable by the API UID).
3. Replace **only** `DATABASE_URL` in `.env.local`: preserve its database password,
   select the verified session pooler host/port/user, remove conflicting SSL options,
   and set `sslmode=verify-full&sslrootcert=/run/certs/supabase-ca.crt`.
4. Create a release-local Compose override mounting that certificate read-only into
   the API at `/run/certs/supabase-ca.crt`. Validate the Compose model without printing
   its environment. Keep the existing production Compose file and exact API image.
5. Recreate only the API, with explicit `API_IMAGE=tecbunny-api:189aab37`, `--no-deps`,
   `--no-build`, and `--pull never`. This single-instance service may briefly interrupt
   requests. Do not replace Caddy, Redis or MailHog, or apply a database migration.
6. From the recreated container, run `SELECT 1` using `DATABASE_URL` with its normal
   pg configuration, proving that the mounted CA and URL work without custom test SSL
   options. Check API startup, public services, and public/internal health responses.

## Rollback

If startup, the normal pg connection or previously working API checks regress,
restore the private environment backup and recreate only the API from the recorded
image using the original Compose file without the override. Recheck the previous
baseline. Retain both image and backup; do not prune Docker images or delete data.

The existing health endpoint is already HTTP 503 because the old image uses the
wrong privilege context for OTP/preferences checks. The public blog is already 502;
services are 200. This connection-only repair does not claim to repair those routes
or make the container healthy. Their reviewed code and migration changes require
separate deployment authorization and a passing release gate.

## Remaining constraints

The VPS has about 1 GB RAM and 4.2 GB free disk. Do not build a parallel full stack
or run the requested 100-user load test there. GitHub Actions jobs currently do not
start because the account is locked for a billing issue. Backup/restore rehearsal,
tenant isolation evidence, sandbox business checks and an isolated staging target
remain launch requirements. Root credential rotation belongs to the owner because
the credential was shared in chat; this workflow does not rotate it automatically.
