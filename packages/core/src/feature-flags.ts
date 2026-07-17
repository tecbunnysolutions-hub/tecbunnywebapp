/**
 * Lightweight feature flags — backed by environment variables with optional
 * Redis override for runtime toggling without redeployment.
 *
 * Usage:
 *   const flags = getFeatureFlags();
 *   if (flags.blogEnabled) { ... }
 *
 * Set via env:
 *   FEATURE_BLOG=true
 *   FEATURE_REFERRAL=true
 *   FEATURE_WABA_REALTIME=true
 *
 * Optional runtime override via Redis key `feature_flags` (JSON object).
 * Redis values take precedence over env vars.
 */

export interface FeatureFlags {
  blogEnabled:          boolean;
  referralEnabled:      boolean;
  wabaRealtime:         boolean;
  gdprDeletion:         boolean;
  calendarEnabled:      boolean;
  amcEnabled:           boolean;
  tasksEnabled:         boolean;
  wishlistPersistence:  boolean;
  broadcastRateLimit:   boolean;
}

function parseBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

let _runtimeOverrides: Partial<FeatureFlags> | null = null;
let _lastFetchedAt = 0;
const CACHE_TTL_MS = 60_000; // 1 minute cache for Redis overrides

/**
 * Load runtime overrides from Redis (cached). Falls back to env vars only.
 */
async function loadRuntimeOverrides(): Promise<Partial<FeatureFlags>> {
  const now = Date.now();
  if (_runtimeOverrides !== null && now - _lastFetchedAt < CACHE_TTL_MS) {
    return _runtimeOverrides;
  }

  try {
    const { getRedis } = await import('./redis');
    const redis = getRedis();
    if (!redis) return {};
    const raw = await redis.get('feature_flags');
    _runtimeOverrides = raw ? (JSON.parse(raw) as Partial<FeatureFlags>) : {};
    _lastFetchedAt = now;
    return _runtimeOverrides;
  } catch {
    return {};
  }
}

/** Synchronous: env-vars only, no Redis. Use in edge/middleware contexts. */
export function getStaticFeatureFlags(): FeatureFlags {
  return {
    blogEnabled:          parseBool(process.env.FEATURE_BLOG, true),
    referralEnabled:      parseBool(process.env.FEATURE_REFERRAL, true),
    wabaRealtime:         parseBool(process.env.FEATURE_WABA_REALTIME, true),
    gdprDeletion:         parseBool(process.env.FEATURE_GDPR_DELETION, true),
    calendarEnabled:      parseBool(process.env.FEATURE_CALENDAR, true),
    amcEnabled:           parseBool(process.env.FEATURE_AMC, true),
    tasksEnabled:         parseBool(process.env.FEATURE_TASKS, true),
    wishlistPersistence:  parseBool(process.env.FEATURE_WISHLIST_PERSISTENCE, true),
    broadcastRateLimit:   parseBool(process.env.FEATURE_BROADCAST_RATE_LIMIT, true),
  };
}

/** Async: env-vars merged with Redis overrides (server-side only). */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const base = getStaticFeatureFlags();
  const overrides = await loadRuntimeOverrides();
  return { ...base, ...overrides };
}

/** Toggle a flag at runtime via Redis (server-side admin action). */
export async function setFeatureFlag(flag: keyof FeatureFlags, value: boolean): Promise<void> {
  const { getRedis } = await import('./redis');
  const redis = getRedis();
  if (!redis) throw new Error('Redis not available for runtime feature flag toggle');

  const current = await loadRuntimeOverrides();
  const next = { ...current, [flag]: value };
  await redis.set('feature_flags', JSON.stringify(next));
  _runtimeOverrides = next;
  _lastFetchedAt = Date.now();
}
