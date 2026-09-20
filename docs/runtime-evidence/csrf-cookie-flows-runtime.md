# CSRF Cookie Flows Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PARTIAL — cross-origin rejection proven 2026-09-20; authenticated cross-site trace requires an interactive session (human drill)

## Goal
Prove cookie-based mutations reject cross-site requests.

## Defense layers verified
1. CORS origin allowlist in the gateway middleware
   (packages/core/src/auth/unified-middleware.ts): only localhost,
   tecbunny.com, *.tecbunny.com and the Chrome extension origin receive a
   usable Access-Control-Allow-Origin; all other origins receive
   `Access-Control-Allow-Origin: null`.
2. Session cookies: superadmin-session is Set-Cookie with
   `HttpOnly; Secure; SameSite=Strict; Path=/` (set in
   apps/api/src/app/api/admin-auth/login/route.ts). SameSite=Strict prevents
   the browser from attaching the cookie to any cross-site request.

## Runtime evidence (executed 2026-09-20 against https://api.tecbunny.com)

### C1: cross-origin mutation attempt
```
POST /api/admin-auth/login
Origin: https://evil.example.com
HTTP 401  (INVALID_CREDENTIALS — expected for bogus payload)
Access-Control-Allow-Origin: null        <-- cross-origin blocked at CORS layer
```

### C2: same-origin control
```
POST /api/admin-auth/login
Origin: https://api.tecbunny.com
HTTP 401  (INVALID_CREDENTIALS — expected for bogus payload)
Access-Control-Allow-Origin: https://api.tecbunny.com   <-- allowlist echo
```

Result: origin allowlist differentiates correctly (null vs echo) on the same
route; combined with SameSite=Strict session cookies, a cross-site browser
request can neither attach the session cookie nor read the response.

## Remaining
An authenticated cross-site POST attempt with a valid session cookie (browser
or cookie-jar drill) to capture the final rejection trace. Paste transcript
here, then set status to "pass" and refresh lastVerifiedAt in
runtime-readiness-evidence.json.
