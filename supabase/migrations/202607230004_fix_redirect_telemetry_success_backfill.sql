-- =============================================================================
-- Backfill: correct mislabeled 3xx-redirect telemetry rows in
-- enterprise_analytics_events (2026-07-23)
-- =============================================================================
-- Root cause: packages/core/src/enterprise-analytics-proxy.ts previously set
-- `success: options.response.ok` on every proxy-level telemetry event.
-- `Response.ok` is only true for HTTP 200-299 -- it is FALSE for 3xx redirects,
-- including the completely normal `NextResponse.redirect(...)` (307) that
-- packages/database/src/middleware.ts issues whenever an unauthenticated
-- visitor hits a protected route (e.g. superadmin/mgmt root "/") and gets sent
-- to the login page. That is expected navigation behavior, not an API/
-- reliability failure, but it was being recorded as `success = false`, which
-- inflated the superadmin "Platform reliability" notification's error count
-- and dragged its computed SLO availability % down with false positives
-- (observed: top offender "/" driving 18 failed events / 93% availability /
-- 0% error budget remaining, none of which reflected an actual outage).
--
-- The code-level bug is fixed separately in enterprise-analytics-proxy.ts
-- (success is now `httpStatus < 400`, i.e. only 4xx/5xx count as failures).
-- This migration backfills the already-persisted bad rows so the dashboard
-- reflects accurate data immediately instead of waiting up to 24h for the
-- mislabeled rows to age out of the rolling window.
-- Idempotent: safe to re-run; the WHERE clause only matches rows still in the
-- old (incorrect) state, so re-running after the first successful run is a
-- no-op.

UPDATE public.enterprise_analytics_events
SET success = true
WHERE success = false
  AND http_status BETWEEN 300 AND 399;
