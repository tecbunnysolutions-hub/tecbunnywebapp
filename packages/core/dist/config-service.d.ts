import { z } from 'zod';
export declare const AppSettingsSchema: z.ZodObject<{
    max_quote_items: z.ZodDefault<z.ZodNumber>;
    max_quote_pdf_mb: z.ZodDefault<z.ZodNumber>;
    max_concurrent_pdfs: z.ZodDefault<z.ZodNumber>;
    max_remote_asset_mb: z.ZodDefault<z.ZodNumber>;
    site_url: z.ZodDefault<z.ZodString>;
    review_url: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
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
/**
 * Fetches global configuration from Supabase.
 * Wrapped in Next.js unstable_cache to completely eliminate DB roundtrips.
 * Revalidated via revalidateTag('app-config') on admin updates.
 */
export declare const getGlobalConfig: () => Promise<GlobalConfig>;
//# sourceMappingURL=config-service.d.ts.map