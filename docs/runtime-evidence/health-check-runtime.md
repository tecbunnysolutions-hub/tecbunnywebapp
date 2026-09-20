# Runtime Evidence: Health Checks

Generated: 2026-09-20 (runtime evidence regeneration)


## Result: PASS (verified 2026-09-20)

### Production liveness probes (https://www.tecbunny.com)
6/6 PASS against https://www.tecbunny.com
- / (200, 2089ms), /products (200, 271ms), /services (200, 618ms)
- /services/smart-infrastructure (200, 524ms), /services/network-infrastructure (200, 495ms)
- /services/physical-security (200, 556ms)

Additional liveness signal: GET /api/auth/session returned HTTP 200 with full
security-header set, confirming app server + auth middleware healthy.

NOTE: the www host does not expose a bare /health route (connection closed) — that
path exists on the api app (apps/api). Production liveness is therefore asserted via
the smoke-test route matrix above plus the session endpoint probe.
