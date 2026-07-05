import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const AppSettingsSchema = z.object({
  max_quote_items: z.number().default(150),
  max_quote_pdf_mb: z.number().default(5),
  max_concurrent_pdfs: z.number().default(2),
  max_remote_asset_mb: z.number().default(5),
  site_url: z.string().url().default('https://www.tecbunny.com'),
  review_url: z.string().url().default('https://g.page/r/tecbunny/review')
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export interface CompanyConfig {
  name: string;
  registered_address: string;
  support_email: string;
  support_phone: string;
  gstin: string;
  cin: string;
  pan: string;
  tan: string;
  logo_url: string;
  font_regular_url: string;
  font_bold_url: string;
}

export interface GlobalConfig {
  company: CompanyConfig;
  settings: AppSettings;
}

const FALLBACK_CONFIG: GlobalConfig = {
  company: {
    name: 'TecBunny Solutions',
    registered_address: '',
    support_email: 'support@tecbunny.com',
    support_phone: '',
    gstin: '',
    cin: '',
    pan: '',
    tan: '',
    logo_url: '',
    font_regular_url: '',
    font_bold_url: ''
  },
  settings: AppSettingsSchema.parse({})
};

/**
 * Fetches global configuration from Supabase.
 * Wrapped in Next.js unstable_cache to completely eliminate DB roundtrips.
 * Revalidated via revalidateTag('app-config') on admin updates.
 */
export const getGlobalConfig = unstable_cache(
  async (): Promise<GlobalConfig> => {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        logger.error('Failed to fetch company config from DB', { error });
        return FALLBACK_CONFIG;
      }

      if (!data) {
        return FALLBACK_CONFIG;
      }

      return {
        company: {
          name: data.company_name,
          registered_address: data.registered_address || '',
          support_email: data.support_email || '',
          support_phone: data.support_phone || '',
          gstin: data.gstin || '',
          cin: data.cin || '',
          pan: data.pan || '',
          tan: data.tan || '',
          logo_url: data.logo_url || '',
          font_regular_url: data.font_regular_url || '',
          font_bold_url: data.font_bold_url || ''
        },
        settings: AppSettingsSchema.parse(data.settings)
      };
    } catch (err) {
      logger.error('Unexpected error fetching company config', { err });
      return FALLBACK_CONFIG;
    }
  },
  ['global-app-config'],
  {
    tags: ['app-config'],
    revalidate: 86400, // Background refresh every 24 hours
  }
);
