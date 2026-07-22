import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@tecbunny/database/admin';

// Safe wrapper for Next.js cache that falls back to direct execution in workers
function safeCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options?: { revalidate?: number; tags?: string[] }
): T {
  let cachedFn: T;
  try {
    cachedFn = unstable_cache(fn, keyParts, options) as T;
  } catch (e) {
    cachedFn = fn;
  }
  
  return (async (...args: Parameters<T>) => {
    try {
      return await cachedFn(...args);
    } catch (e: any) {
      if (e && e.message && e.message.includes('incrementalCache missing')) {
        return await fn(...args);
      }
      throw e;
    }
  }) as T;
}

/**
 * Fetch settings from DB with cache
 */
export const getAppSettings = safeCache(
  async () => {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.from('app_settings').select('key, value');
      const settings: Record<string, any> = {};
      if (data) {
        data.forEach((row) => {
          settings[row.key] = row.value;
        });
      }
      return settings;
    } catch (e) {
      console.warn('[config-db] Supabase client missing or fetch failed. Returning default settings.');
      return {};
    }
  },
  ['db_app_settings'],
  { revalidate: 3600, tags: ['app_settings'] }
);

/**
 * Fetch GST rates
 */
export const getGstRatesFromDb = safeCache(
  async () => {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.from('gst_rates').select('category, rate');
      const rates: Record<string, number> = {};
      if (data) {
        data.forEach((row) => {
          rates[row.category] = Number(row.rate);
        });
      }
      return rates;
    } catch (e) {
      return {};
    }
  },
  ['db_gst_rates'],
  { revalidate: 3600, tags: ['gst_rates'] }
);

/**
 * Fetch Role Permissions
 */
export const getRolePermissionsFromDb = safeCache(
  async () => {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.from('roles_permissions').select('role, permissions');
      const perms: Record<string, Record<string, boolean>> = {};
      if (data) {
        data.forEach((row) => {
          perms[row.role] = row.permissions;
        });
      }
      return perms;
    } catch (e) {
      return {};
    }
  },
  ['db_roles_permissions'],
  { revalidate: 3600, tags: ['roles_permissions'] }
);

/**
 * Fetch Customer Categories
 */
export const getCustomerCategoriesFromDb = safeCache(
  async () => {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.from('customer_categories').select('*');
      return data || [];
    } catch (e) {
      return [];
    }
  },
  ['db_customer_categories'],
  { revalidate: 3600, tags: ['customer_categories'] }
);

/**
 * Fetch Custom Setup Constants
 */
export const getCustomSetupConstantsFromDb = safeCache(
  async () => {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.from('custom_setup_constants').select('key, value');
      const constants: Record<string, number> = {};
      if (data) {
        data.forEach((row) => {
          constants[row.key] = Number(row.value);
        });
      }
      return constants;
    } catch (e) {
      return {};
    }
  },
  ['db_custom_setup_constants'],
  { revalidate: 3600, tags: ['custom_setup_constants'] }
);

/**
 * Fetch Custom Setup Inventory
 */
export const getCustomSetupInventoryFromDb = safeCache(
  async () => {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.from('custom_setup_inventory').select('*').eq('is_active', true);
      return data || [];
    } catch (e) {
      return [];
    }
  },
  ['db_custom_setup_inventory'],
  { revalidate: 3600, tags: ['custom_setup_inventory'] }
);
