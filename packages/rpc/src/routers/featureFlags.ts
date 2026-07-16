import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createClient } from '@tecbunny/database';
import { FeatureFlags, FeatureFlagDictionary } from '@tecbunny/config';

export const featureFlagsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('feature_flags')
        .select('key, enabled');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return {} as FeatureFlagDictionary;
      }

      const flags: FeatureFlagDictionary = {};
      
      // Default fallbacks in case DB doesn't have them yet
      flags[FeatureFlags.CHECKOUT_ENABLED] = true;
      flags[FeatureFlags.NEW_PAYMENT_GATEWAY] = false;

      if (data) {
        data.forEach(flag => {
          flags[flag.key] = flag.enabled;
        });
      }

      return flags;
    } catch (err) {
      console.error('Exception fetching feature flags:', err);
      // Failsafe defaults
      return {
        [FeatureFlags.CHECKOUT_ENABLED]: true,
        [FeatureFlags.NEW_PAYMENT_GATEWAY]: false,
      } as FeatureFlagDictionary;
    }
  }),
  
  toggle: protectedProcedure
    .input(z.object({
      key: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.role !== 'admin' && ctx.role !== 'superadmin') {
        throw new Error('Unauthorized to toggle feature flags');
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from('feature_flags')
        .update({ enabled: input.enabled, updated_at: new Date().toISOString() })
        .eq('key', input.key)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update feature flag: ${error.message}`);
      }

      return data;
    }),
});
