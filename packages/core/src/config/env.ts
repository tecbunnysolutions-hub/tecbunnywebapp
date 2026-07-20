import { z } from 'zod';
import { logger } from '../logger';
import { resolveSupabasePublicEnv, resolveSupabaseServiceEnv } from '@tecbunny/database';

// Standardized unified Zod schema for environment variables across the monorepo
export const EnvSchema = z.object({
  supabase: z.object({
    url: z.string().url('Supabase URL must be a valid URL'),
    anonKey: z.string().min(1, 'Supabase Anon Key is required'),
    serviceRoleKey: z.string().min(1, 'Supabase Service Role Key is required'),
    publicKeySource: z.enum(['publishable', 'anon']),
    dbPassword: z.string().optional(),
    dbUrl: z.string().optional(),
  }),
  smtp: z.object({
    host: z.string().min(1, 'SMTP Host is required'),
    port: z.coerce.number().min(1, 'SMTP Port is required'),
    secure: z.boolean().or(z.string().transform(v => v === 'true' || v === '1')),
    user: z.string().min(1, 'SMTP User is required'),
    pass: z.string().min(1, 'SMTP Password is required'),
    from: z.string().min(1, 'SMTP From Address is required'),
    fromName: z.string().default('TecBunny Solutions'),
  }),
  whatsapp: z.object({
    apiKey: z.string().min(1, 'WhatsApp API Key is required'),
    senderNumber: z.string().min(1, 'WhatsApp Sender Number is required'),
    baseUrl: z.string().url('WhatsApp Base URL must be a valid URL'),
    templateName: z.string().optional(),
    templateLanguage: z.string().optional(),
    webhookVerifyToken: z.string().min(1, 'WhatsApp Webhook Verify Token is required'),
  }),
  app: z.object({
    siteUrl: z.string().url('Site URL must be a valid URL'),
    appName: z.string().default('TecBunny Solutions'),
    nodeEnv: z.string().default('development'),
    baseDomain: z.string().min(1, 'Base Domain is required'),
    apiUrl: z.string().url('API URL must be a valid URL'),
    mgmtUrl: z.string().url('Management URL must be a valid URL'),
    superadminUrl: z.string().url('Superadmin URL must be a valid URL'),
    wabaUrl: z.string().url('WABA URL must be a valid URL'),
  }),
  security: z.object({
    otpSecretPepper: z.string().min(1, 'OTP Secret Pepper is required'),
    superadminSessionSecret: z.string().min(1, 'Superadmin Session Secret is required'),
    totpSecretEncryptionKey: z.string().min(1, 'TOTP Secret Encryption Key is required'),
    sessionSecret: z.string().min(1, 'Session Secret is required'),
    superadminUserId: z.string().min(1, 'Superadmin User ID is required'),
  }),
  payu: z.object({
    merchantKey: z.string().min(1, 'PayU Merchant Key is required'),
    merchantSalt: z.string().min(1, 'PayU Merchant Salt is required'),
    clientSecret: z.string().min(1, 'PayU Client Secret is required'),
    environment: z.string().min(1, 'PayU Environment is required'),
    clientId: z.string().min(1, 'PayU Client ID is required'),
  }),
  supabasePublicKeySource: z.enum(['publishable', 'anon']).optional(), // Backward compatibility helper
  turnstile: z.object({
    siteKey: z.string().min(1, 'Turnstile Site Key is required'),
    secretKey: z.string().min(1, 'Turnstile Secret Key is required'),
  }),
});

export type EnvironmentConfig = z.infer<typeof EnvSchema>;

export class EnvironmentValidator {
  private config: EnvironmentConfig | Partial<EnvironmentConfig> = {};
  private errors: z.ZodIssue[] = [];

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment() {
    let supabasePublic: any = {};
    let supabaseService: any = {};
    try {
      supabasePublic = resolveSupabasePublicEnv();
    } catch (e: any) {
      this.errors.push({
        path: ['supabase', 'anonKey'],
        message: e.message || 'Invalid public Supabase configuration',
        code: z.ZodIssueCode.custom,
      });
    }
    try {
      supabaseService = resolveSupabaseServiceEnv();
    } catch (e: any) {
      this.errors.push({
        path: ['supabase', 'serviceRoleKey'],
        message: e.message || 'Invalid service Supabase configuration',
        code: z.ZodIssueCode.custom,
      });
    }

    const unvalidated = {
      supabase: {
        url: supabasePublic.url || supabaseService.url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
        anonKey: supabasePublic.publicKey || '',
        serviceRoleKey: supabaseService.serviceKey || '',
        publicKeySource: supabasePublic.keySource || 'anon',
        dbPassword: process.env.SUPABASE_DB_PASSWORD,
        dbUrl: process.env.DATABASE_URL,
      },
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM,
        fromName: process.env.SMTP_FROM_NAME,
      },
      whatsapp: {
        apiKey: process.env.INFOBIP_API_KEY,
        senderNumber: process.env.INFOBIP_WHATSAPP_FROM,
        baseUrl: process.env.INFOBIP_BASE_URL,
        templateName: process.env.INFOBIP_WHATSAPP_TEMPLATE_NAME,
        templateLanguage: process.env.INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE,
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      },
      app: {
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        mgmtUrl: process.env.NEXT_PUBLIC_MGMT_URL,
        superadminUrl: process.env.NEXT_PUBLIC_SUPERADMIN_URL,
        wabaUrl: process.env.NEXT_PUBLIC_WABA_URL,
        appName: process.env.NEXT_PUBLIC_APP_NAME,
        nodeEnv: process.env.NODE_ENV,
      },
      security: {
        otpSecretPepper: process.env.OTP_SECRET_PEPPER,
        superadminSessionSecret: process.env.SUPERADMIN_SESSION_SECRET,
        totpSecretEncryptionKey: process.env.TOTP_SECRET_ENCRYPTION_KEY,
        sessionSecret: process.env.SESSION_SECRET,
        superadminUserId: process.env.SUPERADMIN_USER_ID,
      },
      payu: {
        merchantKey: process.env.PAYU_MERCHANT_KEY,
        merchantSalt: process.env.PAYU_MERCHANT_SALT,
        clientSecret: process.env.PAYU_CLIENT_SECRET,
        environment: process.env.PAYU_ENVIRONMENT,
        clientId: process.env.PAYU_CLIENT_ID,
      },
      turnstile: {
        siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        secretKey: process.env.TURNSTILE_SECRET_KEY,
      },
    };

    const result = EnvSchema.safeParse(unvalidated);

    if (!result.success) {
      this.errors = result.error.issues;
      this.config = unvalidated as any;

      const errorMessages = this.getErrors();

      if (this.shouldFailHard()) {
        logger.error('Environment validation failed', { errors: errorMessages });
        throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
      }

      if (errorMessages.length > 0) {
        logger.warn('Environment validation warnings', { errors: errorMessages });
      }
    } else {
      this.errors = [];
      this.config = result.data;
    }
  }

  private shouldFailHard() {
    if (process.env.TECBUNNY_VALIDATE_ENV === 'off') {
      return false;
    }
    return process.env.NODE_ENV === 'production'
      || process.env.CI === 'true'
      || process.env.TECBUNNY_VALIDATE_ENV === 'strict';
  }

  getConfig(): EnvironmentConfig {
    return this.config as EnvironmentConfig;
  }

  isValid() {
    return this.errors.length === 0;
  }

  getErrors() {
    return this.errors.map(e => `${e.path.join('.')}: ${e.message}`);
  }

  getWarnings() {
    return this.getErrors();
  }
}

export const environmentValidation = new EnvironmentValidator();
export const env = environmentValidation.getConfig();
