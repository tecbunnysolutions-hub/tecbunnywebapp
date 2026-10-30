# Blueprint sitemap API repair — 29 October 2026

The storefront production build completed but logged a failed blueprint sitemap
fetch. The external endpoint `/api/v1/blueprints` returned 502. Read-only Supabase
checks showed both requested timestamp columns exist and the server client can read
them, while the browser role receives `42501`, permission denied for
`published_blueprints`.

The list handler now uses the existing server client, consistently with the public
blueprint detail handler. Its database projection remains exactly `id, updated_at`;
configuration payloads and creator information are not returned. No database grant,
RLS policy, credential, or customer record was changed.

The regression reproduces the denied browser client and verifies the handler uses
the server client with the fixed projection. All 243 API tests in 37 files passed.
Next compilation, TypeScript and production output completed successfully with real
public settings and nonfunctional private compile canaries.

## Candidate and preservation

- Application revision: `6d2358c5db9863f5833480530dfca0e22972fd3d`.
- Next build ID: `IWeRz4F99LLY5m1sv-ac2`.
- Application archive: 6,696,433 bytes; SHA-256
  `575977b70338adf960366d70d744787a4d8ae0596fd9e727ce3730476ef918b7`.
- Runtime application payload before its receipt: 1,758 files, 28,068,302 bytes.
- Parent is the already verified CPU-compatible API image
  `sha256:0bd0920735ac14804ea6f24dbc5a249a030b691c2e31a6e775ad2bc44c2902aa`.
- Dependency manifests have no Git changes. Source and installed Linux lockfiles
  are structurally identical, including dependency versions and integrity fields.
  npm's formatting differs: source hash
  `fd8084f8fed9a8ff073510e54c8005ff9592add2b23cbd1a7caee76810bf37e9`,
  installed runtime hash
  `261db75c5cc05a481ad2f0367bee8f0c214147158b803d83d320f25a1f68a4ae`.
  An initial byte-hash assertion stopped packaging; exact parsed comparison reconciled
  that formatting difference before reuse. No dependency version check was waived.
- The fresh application archive passed private-value, compile-canary, file type and
  link checks. A fresh container with no network, mounts or production credentials
  received it. Only that disposable container's previous `.next` directory was
  removed before copying the new application; the live API was not modified in place.
- The derivative retains the parent's exact runtime environment, command and nonroot
  user, including its verified native libraries. The assembly container was removed
  after commit.

Release directory: `/opt/tecbunny/releases/blueprints-20261029-6d2358c5`.
Private backups: `/var/backups/tecbunny/blueprints-20261029-6d2358c5`.

## Runtime verification and deployment

All seven candidate checks passed, including Linux native conversion, PostgreSQL
TLS, Prisma WASM, localhost endpoints and the blueprint response's field restriction.
The API-only replacement completed at **10:11:56 IST** (04:41:56 UTC).
The immutable image is
`sha256:93b9398ef2affa1a8aafa24876d6216601e2cef005f7ff2c4b6be39302b0b5ed`.
Docker reported healthy; public health, blog, services and blueprints returned 200,
and anonymous admin quotes/archive reads returned 401. Current private configuration,
the read-only CA mount and public assets were preserved. Redis, Caddy and MailHog
container identities were unchanged. The immutable parent is retained for rollback.

The live and rollback Compose overrides are `compose.live.json` and
`compose.rollback.json` in the release directory. Both pin immutable image IDs and
preserve the CA mount. The fresh private backup is
`/var/backups/tecbunny/blueprints-20261029-6d2358c5/cutover-20261029T044108Z`.
The production checkout remains unchanged: future manual Compose commands must
include the current release's override, rather than the preceding release override.

The external run at 10:12:50 IST had transport failures without HTTP responses for
the apex and API requests. The API remained healthy and a server-side HTTPS check
returned 200. A repeat with no intervening server change at **10:14:23 IST** passed
all 11 checks. The transport failure's cause was not established; it is not silently
represented as a passing run. The sanitized final results are in
`docs/production-postdeploy-smoke-2026-10-29.json`.

The frontend sitemap uses one-hour revalidation. The earlier generated copy can
remain cached until regeneration; the API fix does not itself purge Vercel caches.
The verified public listing currently contains zero published blueprints, so there
are no existing blueprint entries missing from that cached sitemap.
Formal production readiness remains NO-GO for the separate unverified authorization,
recovery, provider/alert, capacity, credential and governance conditions.
