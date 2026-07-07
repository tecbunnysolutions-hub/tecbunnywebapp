const SUPABASE_URL_ENV = 'NEXT_PUBLIC_SUPABASE_URL';
const PUBLISHABLE_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY';
const LEGACY_ANON_KEY_ENV = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
const LEGACY_SERVICE_KEY_ENV = 'SUPABASE_SERVICE_ROLE_KEY';
const SECRET_KEY_ENV = 'SUPABASE_SECRET_KEY';
const trimEnv = (name, staticValue) => {
    if (staticValue)
        return staticValue.trim();
    if (typeof process !== 'undefined' && process.env[name])
        return process.env[name].trim();
    return '';
};
const isPlaceholder = (value) => !value ||
    value.toLowerCase().includes('placeholder') ||
    value === 'undefined' ||
    value === 'null';
const decodeBase64Url = (value) => {
    try {
        const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
        if (typeof globalThis.atob === 'function') {
            return globalThis.atob(padded);
        }
        return Buffer.from(padded, 'base64').toString('utf8');
    }
    catch {
        return null;
    }
};
const getJwtRole = (key) => {
    const [, payload] = key.split('.');
    if (!payload) {
        return null;
    }
    const decoded = decodeBase64Url(payload);
    if (!decoded) {
        return null;
    }
    try {
        const parsed = JSON.parse(decoded);
        return typeof parsed.role === 'string' ? parsed.role : null;
    }
    catch {
        return null;
    }
};
const isPublishableKey = (key) => key.startsWith('sb_publishable_');
const isSecretKey = (key) => key.startsWith('sb_secret_');
const isLegacyAnonKey = (key) => getJwtRole(key) === 'anon';
const isLegacyServiceRoleKey = (key) => getJwtRole(key) === 'service_role';
const assertValidSupabaseUrl = (url) => {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Unsupported protocol');
        }
    }
    catch {
        throw new Error(`[supabase] ${SUPABASE_URL_ENV} must be a valid http(s) URL.`);
    }
};
export function getSupabaseRuntimeEnv() {
    if (process.env.VERCEL_ENV) {
        return process.env.VERCEL_ENV === 'production' ? 'production' : 'development';
    }
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}
export function resolveSupabasePublicEnv() {
    const runtimeEnv = getSupabaseRuntimeEnv();
    const url = trimEnv(SUPABASE_URL_ENV, process.env.NEXT_PUBLIC_SUPABASE_URL);
    const publishableKey = trimEnv(PUBLISHABLE_KEY_ENV, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const anonKey = trimEnv(LEGACY_ANON_KEY_ENV, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const publicKey = publishableKey || anonKey;
    const keySource = isPublishableKey(publicKey) ? 'publishable' : 'anon';
    if (isPlaceholder(url)) {
        throw new Error(`[supabase] ${SUPABASE_URL_ENV} is required.`);
    }
    assertValidSupabaseUrl(url);
    if (isPlaceholder(publicKey)) {
        throw new Error(`[supabase] Missing public Supabase key. Expected ${PUBLISHABLE_KEY_ENV} or ${LEGACY_ANON_KEY_ENV}.`);
    }
    if (isSecretKey(publicKey) || isLegacyServiceRoleKey(publicKey)) {
        throw new Error(`[supabase] Refusing to expose a secret/service-role key through public client env. Check ${PUBLISHABLE_KEY_ENV} and ${LEGACY_ANON_KEY_ENV}.`);
    }
    if (runtimeEnv === 'production' && !isPublishableKey(publicKey) && !isLegacyAnonKey(publicKey)) {
        throw new Error(`[supabase] Production public key must be ${PUBLISHABLE_KEY_ENV} or legacy ${LEGACY_ANON_KEY_ENV}.`);
    }
    if (runtimeEnv !== 'production' && !isPublishableKey(publicKey) && !isLegacyAnonKey(publicKey)) {
        console.warn(`[supabase] Development public key is not an sb_publishable_ key or a legacy anon JWT. Verify ${PUBLISHABLE_KEY_ENV}/${LEGACY_ANON_KEY_ENV}.`);
    }
    return { url, publicKey, keySource, runtimeEnv };
}
export const isSupabasePublicConfigured = (() => {
    try {
        resolveSupabasePublicEnv();
        return true;
    }
    catch {
        return false;
    }
})();
export function requireSupabasePublicEnv() {
    return resolveSupabasePublicEnv();
}
export function resolveSupabaseServiceEnv() {
    const url = trimEnv(SUPABASE_URL_ENV, process.env.NEXT_PUBLIC_SUPABASE_URL);
    const serviceKey = trimEnv(LEGACY_SERVICE_KEY_ENV, process.env.SUPABASE_SERVICE_ROLE_KEY) || trimEnv(SECRET_KEY_ENV, process.env.SUPABASE_SECRET_KEY);
    if (isPlaceholder(url)) {
        throw new Error(`[supabase] ${SUPABASE_URL_ENV} is required for service clients.`);
    }
    assertValidSupabaseUrl(url);
    if (isPlaceholder(serviceKey)) {
        throw new Error(`[supabase] Missing Supabase backend key. Expected ${SECRET_KEY_ENV} or ${LEGACY_SERVICE_KEY_ENV}.`);
    }
    if (isPublishableKey(serviceKey) || isLegacyAnonKey(serviceKey)) {
        throw new Error('[supabase] Backend service client cannot use a publishable or anon key.');
    }
    return { url, serviceKey };
}
export const isSupabaseServiceConfigured = (() => {
    try {
        resolveSupabaseServiceEnv();
        return true;
    }
    catch {
        return false;
    }
})();
export function requireSupabaseServiceEnv() {
    return resolveSupabaseServiceEnv();
}
