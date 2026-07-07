const levelOrder = { debug: 10, info: 20, warn: 30, error: 40 };
const envLevel = process.env.LOG_LEVEL || 'info';
const activeMin = levelOrder[envLevel] ?? 20;
function serialize(level, msg, meta) {
    const base = {
        time: new Date().toISOString(),
        level,
        msg,
    };
    if (meta && Object.keys(meta).length)
        base.meta = redacted(meta);
    return JSON.stringify(base);
}
// Basic redaction for likely sensitive keys (case-insensitive and substrings)
const SENSITIVE_KEYS = [
    'password', 'passwd', 'pwd', 'token', 'authorization', 'auth', 'email',
    'secret', 'key', 'api_key', 'access', 'refresh', 'txn', 'transaction',
    'client_secret', 'private', 'rsa', 'ssh', 'cookie', 'session', 'otp', 'salt'
];
function redacted(obj, seen = new WeakSet()) {
    if (!obj || typeof obj !== 'object')
        return obj;
    if (seen.has(obj)) {
        return '[CIRCULAR]';
    }
    seen.add(obj);
    if (Array.isArray(obj))
        return obj.map(item => redacted(item, seen));
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        const lowerK = k.toLowerCase();
        // Exact match or contains sensitive keyword
        const matchesKey = SENSITIVE_KEYS.some((s) => lowerK === s || lowerK.includes(s));
        if (matchesKey) {
            out[k] = '[REDACTED]';
            continue;
        }
        if (v && typeof v === 'string') {
            // More robust checks for secrets in strings
            const jwtLike = v.split('.').length === 3 && v.length > 20;
            const longToken = v.length > 60;
            const base64Like = v.length > 20 && /^(?:[A-Za-z0-9+/]{4}){5,}=?$/.test(v);
            const bearerLike = v.toLowerCase().startsWith('bearer ');
            if (jwtLike || longToken || base64Like || bearerLike) {
                out[k] = '[REDACTED]';
                continue;
            }
        }
        if (typeof v === 'object') {
            out[k] = redacted(v, seen);
        }
        else {
            out[k] = v;
        }
    }
    return out;
}
const noop = () => { };
const baseConsole = typeof globalThis !== 'undefined' && globalThis.console ? globalThis.console : null;
const writers = {
    debug: baseConsole?.debug?.bind(baseConsole) ?? baseConsole?.log?.bind(baseConsole) ?? noop,
    info: baseConsole?.info?.bind(baseConsole) ?? baseConsole?.log?.bind(baseConsole) ?? noop,
    warn: baseConsole?.warn?.bind(baseConsole) ?? baseConsole?.log?.bind(baseConsole) ?? noop,
    error: baseConsole?.error?.bind(baseConsole) ?? baseConsole?.log?.bind(baseConsole) ?? noop,
};
function log(level, msg, meta) {
    if (levelOrder[level] < activeMin)
        return;
    const line = serialize(level, msg, meta);
    writers[level](line);
}
export const logger = {
    debug: (m, meta) => log('debug', m, meta),
    info: (m, meta) => log('info', m, meta),
    warn: (m, meta) => log('warn', m, meta),
    error: (m, meta) => log('error', m, meta),
};
