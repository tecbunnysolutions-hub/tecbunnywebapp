import {  createSupabaseServiceClient  } from '@tecbunny/database/admin';

let clientInstance: ReturnType<typeof createSupabaseServiceClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseServiceClient>, {
  get(target, prop) {
    if (!clientInstance) {
      clientInstance = createSupabaseServiceClient();
    }
    const value = Reflect.get(clientInstance, prop);
    return typeof value === 'function' ? value.bind(clientInstance) : value;
  }
});
