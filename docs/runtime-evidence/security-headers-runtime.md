# Runtime Evidence: Security Headers

Generated: 2026-09-20 (runtime evidence regeneration)


## Result: PASS (verified 2026-09-20)

Headers observed on https://www.tecbunny.com (2026-09-20):
- strict-transport-security: max-age=63072000; includeSubDomains; preload (all routes probed)
- x-content-type-options: nosniff (all routes)
- x-frame-options: DENY (all routes)
- referrer-policy: strict-origin-when-cross-origin (all routes)
- permissions-policy: camera=(), microphone=(), geolocation=() (all routes)
- content-security-policy: full nonce-based policy present on /api/auth/session
  (default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';
   form-action restricted to self + PayU). NOTE: HTML page routes currently rely on
   the remaining hardening headers; CSP is emitted by the app on API/auth routes.

Routes probed: /, /api/products?limit=1, /api/auth/session.
