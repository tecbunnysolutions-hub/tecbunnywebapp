import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createClient } from '@tecbunny/database';
import { FeatureFlags, FeatureFlagDictionary } from '@tecbunny/config';

export const featureFlagsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const defaultFlags: FeatureFlagDictionary = {
      [FeatureFlags.CHECKOUT_ENABLED]: true,
      [FeatureFlags.NEW_PAYMENT_GATEWAY]: false,
    };

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('feature_flags')
        .select('key, enabled');

      if (error) {
        console.error('Error fetching feature flags, returning default fallbacks:', error);
        return defaultFlags;
      }

      const flags: FeatureFlagDictionary = { ...defaultFlags };

      if (data && Array.isArray(data)) {
        data.forEach((flag: any) => {
          flags[flag.key] = flag.enabled;
        });
      }

      return flags;
    } catch (err) {
      console.error('Exception fetching feature flags:', err);
      return defaultFlags;
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
        .upsert(
          { key: input.key, enabled: input.enabled, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update feature flag: ${error.message}`);
      }

      return data;
    }),
});
