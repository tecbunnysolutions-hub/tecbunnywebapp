import { z } from 'zod';

import { apiEnvelope } from './envelope';

/**
 * Explicit allowlist of values that are safe to hand to any browser. Anything not declared here
 * cannot be served by GET /api/v1/config/public (the object is strict, so unknown keys are rejected).
 * Never add secrets, tokens, passwords, service-role or private keys.
 */
export const PublicConfigSchema = z.strictObject({
  site: z.strictObject({
    name: z.string(),
    url: z.string(),
    supportEmail: z.string(),
    supportPhone: z.string(),
    whatsappLink: z.string(),
  }),
  features: z.record(z.string(), z.boolean()),
  supabase: z.strictObject({
    url: z.string().nullable(),
    anonKey: z.string().nullable(),
  }),
  turnstileSiteKey: z.string().nullable(),
  sentryDsn: z.string().nullable(),
  pixels: z.strictObject({
    metaPixelId: z.string().nullable(),
    googleAnalyticsId: z.string().nullable(),
  }),
  pricing: z.strictObject({
    gstRatePercent: z.number().min(0).max(100),
    customSetupDiscountPercent: z.number().min(0).max(100),
  }),
});

export const PublicConfigResponseSchema = apiEnvelope(PublicConfigSchema);

export type PublicConfig = z.infer<typeof PublicConfigSchema>;

/** Safe values used by the api-client when the API cannot be reached. */
export const DEFAULT_PUBLIC_CONFIG: PublicConfig = {
  site: {
    name: 'TecBunny Solutions',
    url: 'https://www.tecbunny.com',
    supportEmail: 'support@tecbunny.com',
    supportPhone: '+91 96041 36010',
    whatsappLink: 'https://wa.me/919604136010',
  },
  features: {},
  supabase: { url: null, anonKey: null },
  turnstileSiteKey: null,
  sentryDsn: null,
  pixels: { metaPixelId: null, googleAnalyticsId: null },
  pricing: { gstRatePercent: 18, customSetupDiscountPercent: 12 },
};
