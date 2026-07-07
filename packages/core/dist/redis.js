import Redis from 'ioredis';
import { logger } from '@tecbunny/core';
let client = null;
let initializing = false;
export function getRedis() {
    if (client)
        return client;
    if (initializing)
        return null;
    const url = process.env.REDIS_URL;
    if (!url)
        return null;
    initializing = true;
    try {
        client = new Redis(url, { maxRetriesPerRequest: 2, enableOfflineQueue: false });
        client.on('error', (e) => logger.warn('redis_error', { error: e.message }));
        client.on('connect', () => logger.info('redis_connect'));
    }
    catch (e) {
        logger.error('redis_init_failed', { error: e.message });
        client = null;
    }
    finally {
        initializing = false;
    }
    return client;
}
export async function redisPing() {
    const r = getRedis();
    if (!r)
        return false;
    try {
        const res = await r.ping();
        return res === 'PONG';
    }
    catch {
        return false;
    }
}
