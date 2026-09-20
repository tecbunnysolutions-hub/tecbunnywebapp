# Rate Limiting Runtime

Generated: 2026-09-20 (runtime evidence regeneration)


## Status: PASS (verified 2026-09-20)

## Goal
Prove 429 behavior at configured thresholds.

## Target
POST https://api.tecbunny.com/api/admin-auth/login — superadmin login, configured
limit 5 requests / 60 s per client IP (LOGIN_RATE_LIMIT in
apps/api/src/app/api/admin-auth/login/route.ts). The limiter runs before body
validation and credential verification, so bursts are throttled regardless of
payload validity.

## Burst transcript (2026-09-20, 7 sequential requests, single client IP)

| Attempt | Time (UTC) | HTTP | Code | Request ID |
|---|---|---|---|---|
| 1 | 13:10:46 | 400 | VALIDATION_ERROR | d1d303e85c38639d |
| 2 | 13:10:47 | 400 | VALIDATION_ERROR | d074cf2efef7f24c |
| 3 | 13:10:48 | 400 | VALIDATION_ERROR | fa70ae56dc4ad280 |
| 4 | 13:10:49 | 400 | VALIDATION_ERROR | a8a580927a699a8f |
| 5 | 13:10:49 | 400 | VALIDATION_ERROR | fd5a060c6b152b1b |
| 6 | 13:10:50 | **429** | **RATE_LIMITED** | 7af7e4e7dadd4114 |
| 7 | 13:10:50 | **429** | **RATE_LIMITED** | 4da43a8386ffbe6f |

First 429 at attempt 6 — exactly at the configured threshold of 5 per window.

429 body:
```
{"success":false,"message":"Too many login attempts. Please try again in one minute.","data":null,"errors":[{"code":"RATE_LIMITED","message":"Too many login attempts. Please try again in one minute."}],"meta":{"version":"v1","timestamp":"2026-09-20T13:10:50.137Z","requestId":"7af7e4e7dadd4114"}}
```

Note: no Retry-After header is emitted; the 60 s window is communicated in the
response body. Improvement candidate, not a blocker.

## Recovery after window expiry
Single schema-valid request at 13:12:06 UTC (~80 s after window start):
```
HTTP 401
{"success":false,"message":"Invalid superadmin credentials","errors":[{"code":"INVALID_CREDENTIALS",...}],"meta":{...,"requestId":"3ba6f59455c80e95"}}
```
401 (not 429) confirms the fixed window reset and normal processing resumed.

## Result
Threshold enforcement (429 at request 6/5-per-minute), stable rejection under
burst, and window recovery all confirmed against production.
