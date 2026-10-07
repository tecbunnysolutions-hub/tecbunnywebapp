import { createTecbunnyApi } from '@tecbunny/api-client';

/** Server-side API client that forwards the caller's session (cookie, IP, user agent) to the API. */
export function createForwardedApi(forwarded: { cookie?: string | null; ip?: string | null; userAgent?: string | null }) {
  return createTecbunnyApi({
    getHeaders: () => {
      const headers: Record<string, string> = {};
      if (forwarded.cookie) headers.cookie = forwarded.cookie;
      if (forwarded.ip) headers['x-forwarded-for'] = forwarded.ip;
      if (forwarded.userAgent) headers['user-agent'] = forwarded.userAgent;
      return headers;
    },
  });
}


/** Browser client: same-origin so the superadmin session cookie rides along (`/api/*` is rewritten to the API). */
export function createBrowserApi() {
  return createTecbunnyApi({ baseUrl: window.location.origin });
}
