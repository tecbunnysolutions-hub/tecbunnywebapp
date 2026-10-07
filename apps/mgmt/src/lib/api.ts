import { createTecbunnyApi } from '@tecbunny/api-client';

/** Browser client for staff screens: same-origin so the Supabase session cookie rides along (`/api/*` is rewritten to the API). */
export function createStaffApi() {
  return createTecbunnyApi({ baseUrl: window.location.origin });
}
