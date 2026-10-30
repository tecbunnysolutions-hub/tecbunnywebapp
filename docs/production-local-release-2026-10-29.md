# Local API repair release — 29 October 2026

**Readiness verdict: NO-GO.** The local release path does not establish the missing
authorization, disaster recovery, provider delivery, alerting or 100-user capacity
evidence. The user explicitly authorized deployment and selected the local option
after GitHub rejected job startup because of an account billing lock.

**Operational outcome:** the repaired API was deployed at 09:02:59 IST on 29 October
2026 (03:32:59 UTC). Its immutable image is
`sha256:0bd0920735ac14804ea6f24dbc5a249a030b691c2e31a6e775ad2bc44c2902aa`.
Docker reports healthy. Public health, blog and services return 200; anonymous admin
quotes and archive requests return 401. Frontend production promotion subsequently
completed; see `docs/production-frontend-release-2026-10-29.md` for all four Ready
deployments, fresh domain checks and the separately discovered blueprint API defect.

**Latest API update:** the blueprint defect was subsequently repaired and deployed
at 10:11:56 IST. The current image and override paths supersede this initial release;
see `docs/production-blueprint-repair-2026-10-29.md` and the current JSON receipt.

## Immutable candidate

| Item | Verified value |
|---|---|
| Application revision | `91e5a86367313d4941658d98c6bace2f1ca6f075` |
| Dependency preparation revision | `1d26579bb23de78e9697bc763ade08102c5cb383` |
| Target | Linux x64 musl, Node 22, Next 16.4.3, Prisma 7 WASM |
| Next build ID | `bPJizMfkDI9oL9KZDfIfn` |
| Archive size | 170,949,000 bytes |
| Archive SHA-256 | `884222af77347639adc3e3c69b44e5bf28e7ffa2efe2131aaa33dcf801d8cec2` |
| Lockfile SHA-256 | `261db75c5cc05a481ad2f0367bee8f0c214147158b803d83d320f25a1f68a4ae` |
| Runtime payload | 40,077 regular files, 661,006,202 bytes, excluding embedded manifest |
| Packaged runtime | 40,078 regular files, 661,007,176 bytes, including its 974-byte manifest |
| VPS release directory | `/opt/tecbunny/releases/local-20261029-91e5a863` |
| Core candidate image (not deployed) | `tecbunny-api:local-91e5a863-import` |
| Image ID | `sha256:517593310084aa80207a22fa94c17afaab02535c6154e95eadc73c66ea534934` |

The local build helper admits only the eight real public build settings and uses
nonfunctional private compile canaries. The runtime installer resolves pinned Linux
musl dependencies without install hooks, applies and verifies the precise Zod
backport, and checks Linux native binaries. Prisma's generated WASM client is copied
only after matching its version and schema. The assembler refreshes tracked source,
materializes workspace links, excludes build caches and environment files, and checks
for actual private local values and the compile canary. VPS upload checksum and tar
path/type checks passed before extraction.

Next compilation and the main Linux dependency installation ran locally. Image
assembly uses cached Node base
`sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402`.
BuildKit timed out; legacy/direct Engine builds subsequently timed out in `COPY`.
Their clients stopped and temporary contexts were released. A fresh container with
no network and no production environment received the verified runtime in one pass.
Ownership is 1001:1001, directories 0755 and regular files 0644 plus original execute
bits. It was committed with the reviewed Dockerfile's user, working directory,
entrypoint, command and public runtime settings. Assertions reject private
environment keys before committing. The assembly container was then removed.

An initial inventory assertion stopped before commit because the receipt counts the
payload before embedding its own manifest. Archive totals and the copied manifest
proved that the difference is exactly one 974-byte file. The existing complete copy
was committed after that check; no runtime file was omitted. The packaging helper now
labels the payload scope and reports packaged totals separately for future releases.

## Verification and live state

- API: 242 tests passed in 36 files; core: 124 tests passed, including three new
  CAPTCHA configuration regressions. Earlier cumulative workspace/type/lint/build,
  isolated SQL and source/runtime backport checks remain described in the 28 October
  candidate record.
- All four Vercel preview checks passed on
  `80173d881c5f774c4b94910f24bbb1b4f279bb0c`: storefront, management, superadmin and
  WABA. Preview builds do not prove production domain assignment or business flows.
- Separate Linux checks passed for the Zod bounded-parser mitigation, PostgreSQL
  `SELECT 1` with an encrypted and authorized TLS socket, and Prisma WASM `SELECT 1`
  plus the mapped Permission model count. These read-only checks do not establish
  application role or tenant isolation.
- A separate, resource-capped localhost server probe passed: health, versioned blog
  and services **200**; anonymous admin quotes and archive listing **401**. Public
  health excluded private details and returned `Cache-Control: no-store`.
- The full image compatibility check **failed at Sharp**: this VPS lacks the x64 v2
  CPU features required by its prebuilt native binding. The documented Wasm fallback
  was tested separately with exact pinned packages and also failed because the host
  lacks Wasm SIMD. Neither failure was hidden or recorded as a pass.
- Production API replacement: **completed**, using the CPU-compatible derivative
  `tecbunny-api:local-91e5a863-cpuv1`. The full native and localhost checks passed on
  its immutable image before replacement. The previous image remains available for rollback.
- Before replacement: API health 503, blog 502, versioned services 200.
  After replacement: health, blog and services 200; anonymous privileged reads 401.
  Docker health passed, the CA mount remains read-only, and Redis, Caddy and MailHog
  container IDs were unchanged. No customer writes or database migrations were performed.
  `admin.tecbunny.com` initially returned Vercel `DEPLOYMENT_NOT_FOUND`. The Vercel
  project had only `superadmin.tecbunny.com` connected. Added the already configured
  `admin.tecbunny.com` hostname to the same Production environment, retaining the
  existing hostname. Vercel reports Valid Configuration; an independent HTTPS probe
  now follows the normal redirect to `/superadmin/login` and returns **200**.
  No DNS record or authentication setting was changed. The unnecessary source
  redirect change was reverted. This repairs the hostname, not proof of root login.

## CPU compatibility repair completed

An isolated, credential-free build container has no production network membership,
volumes or runtime environment. It initially ran at 160 MiB RAM and 0.5 CPU. After
observing 262 MiB host headroom and a successful live services probe, only this owned
builder was adjusted to 224 MiB RAM, 640 MiB total RAM plus swap, and 0.75 CPU. Its
controller stops it below 64 MiB host memory headroom, below
512 MiB free disk or at the bounded segment deadline. The first source segment
stopped after 3,616 seconds at step 498/535, with no OOM and 1,699 MiB disk free.
The remaining 38 incremental build steps resumed from saved objects under a fresh
40-minute limit, retaining the same memory/disk guards. Only this owned build
container is affected.
Host packages and the running API are not changed.

Alpine's packaged libvips 8.18.2 was rejected by the explicit 8.18.7 minimum check.
The successful attempt built official libvips 8.18.7 with `-march=x86-64`, a separate
library prefix and scalar paths, before building the exact Sharp 0.35.5 source.
The official release archive digest is
`5baaead3b0bb20ffdb9e9ff09aa9fda08620923df77b63b436654cb5e0b3bf94`.
Source: https://github.com/libvips/libvips/releases/tag/v8.18.7.
All 12 configured upstream tests passed, with zero failures. Sharp initially selected
the distro headers despite the custom pkg-config prefix. Explicit include and linker
flags selected the real 8.18.7 headers and libraries without relaxing the version check.
Synthetic PNG/JPEG/WebP conversion and the exact loaded libvips version assertion passed.
The 79 runtime libraries and addon produced a 50,279,424-byte archive with SHA-256
`27e4b7a96386fa2f369a6684b601524154080581bfd404a7b207cc7c70dc2491`.
Only that runtime overlay was copied into a fresh credential-free derivative of the
core image. Full native, database TLS, Prisma WASM and localhost endpoint checks passed
again on the derivative before deployment. The Dockerfile now includes the pinned
source recipe for future builds; a complete fresh Dockerfile build remains unrun.

This limited native build is an exception to the initial copy-only VPS plan,
necessitated by the observed CPU incompatibility. No whole-application build runs
on the VPS. No 100-user load test, customer write or provider send was performed.

## Frontend promotion status

**Subsequent outcome:** all four tested frontend releases were promoted and reached
Ready after the authorized Gmail verification. The following paragraphs retain the
earlier access-blocker history; the current outcome and deployment IDs are in the
frontend release record linked above.

The signed-in Vercel dashboard confirmed the superadmin production rollback target
`HCuT69yP14fLxENe33LeBA3jE9fN`, source
`a15e315fb59b4c437a47141f683b691f3344f158`. The verified preview promotion is prepared
for `80173d881c5f774c4b94910f24bbb1b4f279bb0c`; its Git tree is identical to the API
application revision 91e5a863. Vercel explicitly rebuilds with Production variables
and retains the configured domains.

**Promotion is blocked by Vercel account reauthentication**, not a new permission
request from this workflow. The provider emailed its account-owner verification
code; the browser is open at the code-entry step. The owner must enter it directly
there, keeping the code out of chat. No production frontend code promotion has
completed. Existing production frontend deployments remain in place.

The owner could not access the in-app browser, explaining the ineffective handoff.
The tested superadmin preview was opened in desktop Chrome instead. Its promotion
also requested reauthentication; Send Code to Email was selected. Desktop computer
control then stopped because it could not determine the active browser URL with
enough confidence to enforce policy. No further browser action was attempted.

## Security finding discovered during packaging

The artifact scan found a hardcoded CAPTCHA provider credential in
`packages/core/src/captcha/captcha-service.ts`. A private fingerprint comparison
confirmed that it also matches the current production configuration. The source
fallback and automatic substitution were removed. Missing or mistyped secrets now
fail closed, configured secrets are used, and client configuration excludes secrets.
The API was rebuilt and the artifact passed its private-value scan.

**HIGH — owner rotation remains outstanding.** Source removal does not revoke this
credential or remove historical copies. Per the remediation skill, rotation is a
human action. Rotate the existing Cloudflare Turnstile widget secret and update
every backend using it through its private configuration, including the VPS
`/opt/tecbunny/.env.local`. Keep the value out of chat. Confirm any Supabase Auth or
Vercel server configuration that uses the same widget. Provider instructions:
https://developers.cloudflare.com/turnstile/troubleshooting/rotate-secret-key/.
The SSH credential previously shared in chat also still needs owner rotation.
The owner initially reported rotation, but the VPS setting still matched its
pre-release backup and local configuration. The owner subsequently stated that the
older Turnstile setting is working. The repair therefore preserved the current
configured value. This is not evidence of revocation or acceptance of the exposed-key risk.

## Preservation and rollback

Private pre-release environment and container-inspection backups are outside the
checkout under `/var/backups/tecbunny/local-20261029-91e5a863`, restricted to root.
The previous API public directory was inventoried and backed up: one existing logo,
197,879 bytes, and no old-only assets. No customer-upload directory was discovered
there. This file backup is not evidence of a database restore rehearsal.

Before replacement, verify the immutable image and Linux checks, preserve the CA
mount at `/run/certs`, retain the previous image, and use the current private
environment file. Replace only the API with `--no-deps --no-build --pull never`.
Verify public health, blog and services plus anonymous denials. If those regress,
restore the previous image with the CA mount and the **current** environment file;
do not overwrite a credential rotation with the old environment backup. Redis,
Caddy, MailHog and database data are outside the replacement scope.

The completed replacement used only the API service with immutable image IDs.
The live override is `/opt/tecbunny/releases/local-20261029-91e5a863/compose.live.json`;
rollback is `compose.rollback.json` in that directory. Both preserve the CA mount.
The fresh private cutover backup is
`/var/backups/tecbunny/local-20261029-91e5a863/cutover-20261029T033212Z`.
The production Git checkout was not overwritten. Future manual Compose operations
must include the recorded override; the older checkout alone does not describe this release.
After the subsequent blueprint repair, only the owned stopped compiler container
was removed, after verifying the retained native archive digest and saved upstream
test log. Rollback images and private backups remain available. Disk headroom was
2,116 MiB after cleanup; no global Docker prune ran.

## Remaining launch conditions

The raw npm audit still reports the published Zod 4.6.5 advisory; its exact tested
maintainer backport does not silently satisfy the existing audit policy. No risk
acceptance is inferred. GitHub billing/protection/deployment access, isolated
authorization/recovery/migration evidence, provider and alert drills, and current
100-user capacity evidence remain unresolved as recorded in the remediation report.
Do not run the missing load test against this constrained single production host.
