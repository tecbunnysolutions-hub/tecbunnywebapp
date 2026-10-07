import { CommandCenterSchema, LeadCommandCenterSchema, type LeadCommandCenterData, type SuperadminCommandCenterData } from '@tecbunny/contracts';

import type { ApiClient } from './client';

export function superadminApi(client: ApiClient) {
  return {
    /** Superadmin only; forward the session cookie via `getHeaders`. Never cached. */
    async commandCenter(opts: { signal?: AbortSignal } = {}): Promise<SuperadminCommandCenterData> {
      const data = await client.request('/api/v1/superadmin/command-center', { schema: CommandCenterSchema, signal: opts.signal, cache: 'no-store' });
      if (!data) throw new Error('Empty command center response');
      return data;
    },
  
    /** Superadmin only: lead and revenue metrics for the lead command center and mobile dashboards. */
    async leadCommandCenter(opts: { signal?: AbortSignal } = {}): Promise<LeadCommandCenterData> {
      const data = await client.request('/api/v1/superadmin/lead-command-center', { schema: LeadCommandCenterSchema, signal: opts.signal, cache: 'no-store' });
      if (!data) throw new Error('Empty lead command center response');
      return data;
    },
  };
}
