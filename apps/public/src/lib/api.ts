import { createTecbunnyApi } from '@tecbunny/api-client';
import { getGuestOrderToken } from './guest-order-access';

let api: ReturnType<typeof createTecbunnyApi> | undefined;

/** Shared typed client for the TecBunny API; reads are cached via Next fetch revalidate/tags. */
export function getApi() {
  api ??= createTecbunnyApi();
  return api;
}

/** Browser client that sends the caller's Supabase access token as a Bearer header. */
export function createAuthedApi(getToken: () => Promise<string | null | undefined>) {
  return createTecbunnyApi({
    getToken,
    getHeaders: (): Record<string, string> => {
      if (typeof window === 'undefined') return {};
      const match = window.location.pathname.match(/^\/(?:payment\/[^/]+|orders)\/([^/]+)/);
      const orderId = match ? decodeURIComponent(match[1]) : null;
      const guestToken = orderId ? getGuestOrderToken(orderId) : null;
      return guestToken ? { 'x-guest-order-token': guestToken } : {};
    },
  });
}
