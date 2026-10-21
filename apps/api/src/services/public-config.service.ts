import { PublicConfigSchema, type PublicConfig } from '@tecbunny/contracts';
import { getFeatureFlags } from '@tecbunny/core/feature-flags';
import {
  getDefaultGstPercentage,
  getSettingValue,
  getSupportEmail,
  getSupportPhone,
  getWhatsAppLink,
} from '@tecbunny/core/settings';

const DEFAULT_CUSTOM_SETUP_DISCOUNT_PERCENT = 12;

export interface PublicConfigSources {
  env: Record<string, string | undefined>;
  flags: () => Promise<Record<string, boolean>>;
  setting: (key: string, fallback: string) => Promise<string>;
  gstPercent: () => Promise<number>;
  support: () => Promise<{ email: string; phone: string; whatsappLink: string }>;
}

const defaultSources = (): PublicConfigSources => ({
  env: process.env,
  flags: async () => ({ ...(await getFeatureFlags()) }),
  setting: getSettingValue,
  gstPercent: getDefaultGstPercentage,
  support: async () => {
    const [email, phone, whatsappLink] = await Promise.all([getSupportEmail(), getSupportPhone(), getWhatsAppLink()]);
    return { email, phone, whatsappLink };
  },
});

const clean = (value: string | undefined | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const percentOr = (raw: string, fallback: number) => {
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value >= 0 && value <= 100 ? value : fallback;
};

/**
 * Builds the browser-safe configuration. Values are read one by one and the result is parsed with the
 * strict PublicConfigSchema, so nothing outside the contract allowlist can be returned.
 */
export async function buildPublicConfig(sources: PublicConfigSources = defaultSources()): Promise<PublicConfig> {
  const { env } = sources;
  const [features, support, gst, discountRaw, metaPixelSetting] = await Promise.all([
    sources.flags(),
    sources.support(),
    sources.gstPercent(),
    sources.setting('custom_setup_discount_percent', String(DEFAULT_CUSTOM_SETUP_DISCOUNT_PERCENT)),
    sources.setting('facebook_pixel_id', ''),
  ]);

  return PublicConfigSchema.parse({
    site: {
      name: clean(env.NEXT_PUBLIC_APP_NAME) ?? 'TecBunny Solutions',
      url: clean(env.NEXT_PUBLIC_SITE_URL) ?? 'https://www.tecbunny.com',
      supportEmail: support.email,
      supportPhone: support.phone,
      whatsappLink: support.whatsappLink,
    },
    features,
    supabase: {
      url: clean(env.NEXT_PUBLIC_SUPABASE_URL),
      anonKey: clean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ?? clean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? clean(env.SUPABASE_ANON_KEY),
    },
    turnstileSiteKey: clean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    sentryDsn: clean(env.NEXT_PUBLIC_SENTRY_DSN),
    pixels: {
      metaPixelId: clean(env.NEXT_PUBLIC_META_PIXEL_ID) ?? clean(env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) ?? clean(metaPixelSetting),
      googleAnalyticsId: clean(env.NEXT_PUBLIC_GA_ID),
    },
    pricing: {
      gstRatePercent: percentOr(String(gst), 18),
      customSetupDiscountPercent: percentOr(discountRaw, DEFAULT_CUSTOM_SETUP_DISCOUNT_PERCENT),
    },
  });
}
