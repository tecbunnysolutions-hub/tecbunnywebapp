# ADR: notification rate limiting must be Redis-backed before running more than one API instance

Status: accepted, action required before scaling out
Date: 2026-10-20

## Context

`apps/api/src/lib/notification-guard.ts` rate limits the `/api/email/*` and `/api/notifications/send`
routes with the synchronous overload `rateLimit(key, bucket, { limit, windowMs })` from
`packages/core/src/rate-limit.ts`.

That overload is **always in-memory and process-local**, even when Redis is configured. It only logs
`rate_limit_sync_no_redis_production` when Redis is missing. The asynchronous overload
`rateLimit(key, limit, windowMs)` is the Redis-backed one (used by `auth/forgot-password`).

The same applies to the in-memory dedupe map in `email/notify-manager` and to other callers of the sync overload.

## Consequences

- With one API process (the current VPS plan) the limits are correct, but they reset on every restart/deploy.
- With N instances, an attacker or a retry loop gets N times the limit.

## Decision / TODO

Before running more than one `apps/api` instance (or any horizontal scaling, blue/green overlap included):

1. Move `authorizeNotification` to the async Redis overload (key = `${bucket}:${key}`) and `await` it.
2. Set `REDIS_URL` (or the configured Redis variable) and `REQUIRE_REDIS_RATE_LIMIT=true` so production fails closed.
3. Move the `notify-manager` dedupe to Redis (`SET NX PX`).
4. Update `email-routes.test.ts` mocks for the async overload.
