// Unified rate limiter with overloads: async (detailed) and sync (boolean)
// Async detailed (for endpoints that can await):
//   await rateLimit(key, limit, windowMs) -> { allowed, remaining, reset }
// Sync fixed-window (fast boolean):
//   rateLimit(key, bucketName, { limit, windowMs }) -> boolean
import { getRedis } from './redis';
import { logger } from '.';
// In-memory state
const stores = {};
const memoryBuckets = new Map();
const requireRedisRateLimit = process.env.REQUIRE_REDIS_RATE_LIMIT === 'true';
// Periodic memory cleanup to prevent memory leaks in long-running processes
if (typeof global !== 'undefined') {
    const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes
    const MAX_RECORD_AGE_MS = 10 * 60 * 1000; // Evict entries older than 10 minutes
    const intervalKey = '_rate_limit_cleanup_interval';
    if (!global[intervalKey]) {
        global[intervalKey] = setInterval(() => {
            const now = Date.now();
            // Prune sync fixed-window bucket stores
            for (const bucketName of Object.keys(stores)) {
                const store = stores[bucketName];
                for (const [key, rec] of store.entries()) {
                    if (now - rec.first > MAX_RECORD_AGE_MS) {
                        store.delete(key);
                    }
                }
                if (store.size === 0) {
                    delete stores[bucketName];
                }
            }
            // Prune async memoryBuckets
            for (const [key, timestamps] of memoryBuckets.entries()) {
                const kept = timestamps.filter(ts => ts > now - MAX_RECORD_AGE_MS);
                if (kept.length === 0) {
                    memoryBuckets.delete(key);
                }
                else {
                    memoryBuckets.set(key, kept);
                }
            }
        }, CLEANUP_INTERVAL_MS);
        // Unref the interval so it doesn't block process termination in CLI/scripts
        if (typeof global[intervalKey].unref === 'function') {
            global[intervalKey].unref();
        }
    }
}
export function rateLimit(key, a, b) {
    // Sync boolean variant: (key, bucketName, opts)
    if (typeof a === 'string' && typeof b === 'object' && b !== null) {
        const bucketName = a;
        const opts = b;
        const redis = getRedis();
        if (process.env.NODE_ENV === 'production' && !redis) {
            logger.error('rate_limit_sync_no_redis_production', { key, bucketName });
            if (requireRedisRateLimit) {
                return false;
            }
        }
        if (!stores[bucketName])
            stores[bucketName] = new Map();
        const store = stores[bucketName];
        const now = Date.now();
        // Inline eviction of expired entries in this store
        for (const [k, rec] of store.entries()) {
            if (now - rec.first > opts.windowMs) {
                store.delete(k);
            }
        }
        const rec = store.get(key);
        if (!rec) {
            store.set(key, { count: 1, first: now });
            return true;
        }
        if (now - rec.first > opts.windowMs) {
            store.set(key, { count: 1, first: now });
            return true;
        }
        if (rec.count >= opts.limit)
            return false;
        rec.count += 1;
        return true;
    }
    // Async detailed variant: (key, limit, windowMs)
    if (typeof a === 'number' && typeof b === 'number') {
        const limit = a;
        const windowMs = b;
        const now = Date.now();
        const windowStart = now - windowMs;
        const redis = getRedis();
        // Define the async logic in a separate function to maintain non-async outer function
        const executeAsync = async () => {
            if (redis) {
                try {
                    const windowKey = `rl:cnt:${key}`;
                    // Use a simple atomic increment
                    const count = await redis.incr(windowKey);
                    if (count === 1) {
                        await redis.pexpire(windowKey, windowMs);
                    }
                    const remainingValue = Math.max(0, limit - count);
                    const allowed = count <= limit;
                    if (!allowed) {
                        logger.warn('rate_limit_exceeded', { key, count, limit });
                    }
                    return { allowed, remaining: remainingValue, reset: now + windowMs };
                }
                catch (err) {
                    logger.warn('rate_limit_redis_failed', { error: err.message });
                    // fall through to memory
                }
            }
            // memory fallback for async variant (Warning: not shared across serverless instances)
            if (process.env.NODE_ENV === 'production' && !redis) {
                logger.error('rate_limit_no_redis_production', { key });
                if (requireRedisRateLimit) {
                    return { allowed: false, remaining: 0, reset: now + windowMs };
                }
            }
            const arr = memoryBuckets.get(key) || [];
            const kept = arr.filter(ts => ts > windowStart);
            kept.push(now);
            memoryBuckets.set(key, kept);
            const remainingValue = Math.max(0, limit - kept.length);
            return { allowed: kept.length <= limit, remaining: remainingValue, reset: now + windowMs };
        };
        return executeAsync();
    }
    throw new Error('Invalid rateLimit arguments');
}
// Optional helpers for sync variant state
export function remaining(key, bucketName, opts) {
    const store = stores[bucketName];
    if (!store)
        return undefined;
    const rec = store.get(key);
    if (!rec)
        return opts.limit;
    if (Date.now() - rec.first > opts.windowMs)
        return opts.limit;
    return Math.max(0, opts.limit - rec.count);
}
export function bucketResetMs(key, bucketName) {
    const store = stores[bucketName];
    if (!store)
        return undefined;
    const rec = store.get(key);
    if (!rec)
        return undefined;
    const now = Date.now();
    const ttl = rec.first + 60_000 - now; // default 1m fallback
    return ttl > 0 ? ttl : 0;
}
