import { unstable_cache } from 'next/cache';
import { createSupabaseClient } from './supabase-server';

/**
 * Fetch settings from DB with cache
 */
export const getAppSettings = unstable_cache(
  async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from('app_settings').select('key, value');
    const settings: Record<string, any> = {};
    if (data) {
      data.forEach((row) => {
        settings[row.key] = row.value;
      });
    }
    return settings;
  },
  ['db_app_settings'],
  { revalidate: 3600, tags: ['app_settings'] }
);

/**
 * Fetch GST rates
 */
export const getGstRatesFromDb = unstable_cache(
  async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from('gst_rates').select('category, rate');
    const rates: Record<string, number> = {};
    if (data) {
      data.forEach((row) => {
        rates[row.category] = Number(row.rate);
      });
    }
    return rates;
  },
  ['db_gst_rates'],
  { revalidate: 3600, tags: ['gst_rates'] }
);

/**
 * Fetch Role Permissions
 */
export const getRolePermissionsFromDb = unstable_cache(
  async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from('roles_permissions').select('role, permissions');
    const perms: Record<string, Record<string, boolean>> = {};
    if (data) {
      data.forEach((row) => {
        perms[row.role] = row.permissions;
      });
    }
    return perms;
  },
  ['db_roles_permissions'],
  { revalidate: 3600, tags: ['roles_permissions'] }
);

/**
 * Fetch Customer Categories
 */
export const getCustomerCategoriesFromDb = unstable_cache(
  async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from('customer_categories').select('*');
    return data || [];
  },
  ['db_customer_categories'],
  { revalidate: 3600, tags: ['customer_categories'] }
);

/**
 * Fetch Custom Setup Constants
 */
export const getCustomSetupConstantsFromDb = unstable_cache(
  async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from('custom_setup_constants').select('key, value');
    const constants: Record<string, number> = {};
    if (data) {
      data.forEach((row) => {
        constants[row.key] = Number(row.value);
      });
    }
    return constants;
  },
  ['db_custom_setup_constants'],
  { revalidate: 3600, tags: ['custom_setup_constants'] }
);

/**
 * Fetch Custom Setup Inventory
 */
export const getCustomSetupInventoryFromDb = unstable_cache(
  async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase.from('custom_setup_inventory').select('*').eq('is_active', true);
    return data || [];
  },
  ['db_custom_setup_inventory'],
  { revalidate: 3600, tags: ['custom_setup_inventory'] }
);
