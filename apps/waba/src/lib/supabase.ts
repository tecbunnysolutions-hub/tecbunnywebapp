import { createSupabaseServiceClient } from '@tecbunny/database';

let clientInstance: ReturnType<typeof createSupabaseServiceClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseServiceClient>, {
  get(target, prop) {
    if (!clientInstance) {
      clientInstance = createSupabaseServiceClient();
    }
    const value = (clientInstance as any)[prop];
    return typeof value === 'function' ? value.bind(clientInstance) : value;
  }
});
