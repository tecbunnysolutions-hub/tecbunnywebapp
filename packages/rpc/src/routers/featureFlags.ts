import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createClient } from '@tecbunny/database';
import { FeatureFlags, FeatureFlagDictionary } from '@tecbunny/config';
import { logger } from '@tecbunny/core';

export const featureFlagsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    logger.info('rpc_feature_flags.audit.get_all_requested');
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

      logger.info('rpc_feature_flags.audit.get_all_success', { count: Object.keys(flags).length });
      return flags;
    } catch (err) {
      logger.error('rpc_feature_flags.audit.get_all_failed', { error: err instanceof Error ? err.message : String(err) });
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
      logger.info('rpc_feature_flags.audit.toggle_requested', { key: input.key, enabled: input.enabled });
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
        logger.error('rpc_feature_flags.audit.toggle_failed', { key: input.key, error: error.message });
        throw new Error(`Failed to update feature flag: ${error.message}`);
      }

      logger.info('rpc_feature_flags.audit.toggle_success', { key: input.key, enabled: input.enabled });
      return data;
    }),
});
