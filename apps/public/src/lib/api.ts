import { createTecbunnyApi } from '@tecbunny/api-client';

let api: ReturnType<typeof createTecbunnyApi> | undefined;

/** Shared typed client for the TecBunny API; reads are cached via Next fetch revalidate/tags. */
export function getApi() {
  api ??= createTecbunnyApi();
  return api;
}

/** Browser client that sends the caller's Supabase access token as a Bearer header. */
export function createAuthedApi(getToken: () => Promise<string | null | undefined>) {
  return createTecbunnyApi({ getToken });
}
