// Plain ESM (no TypeScript) so Node-loaded next.config files can import it too.
export const PRODUCTION_API_URL = 'https://api.tecbunny.store';
export const STAGING_API_URL = 'https://api-staging.tecbunny.store';
export const LOCAL_API_URL = 'http://localhost:3001';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/**
 * Picks the API base URL from the page hostname (browser) or the CI/build target (server).
 * Unknown hosts fall back to production.
 */
export function resolveApiBaseUrl(options = {}) {
  const hostname = (options.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();

  if (hostname) {
    if (LOCAL_HOSTS.has(hostname) || hostname.endsWith('.localhost')) return LOCAL_API_URL;
    if (hostname.includes('staging')) return STAGING_API_URL;
    return PRODUCTION_API_URL;
  }

  // Server / build time: production unless a CI flag selects staging, or a local dev server runs.
  const target = options.target ?? (typeof process !== 'undefined' ? process.env.API_TARGET : undefined);
  if (target === 'staging') return STAGING_API_URL;
  if (target === 'local') return LOCAL_API_URL;
  if (!target && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return LOCAL_API_URL;
  return PRODUCTION_API_URL;
}
