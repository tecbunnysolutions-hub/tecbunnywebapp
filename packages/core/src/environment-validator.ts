// Environment variable validation and configuration
import { logger } from './logger';
import { requireSupabasePublicEnv, requireSupabaseServiceEnv } from './supabase/env';

export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    publicKeySource: 'publishable' | 'anon';
    dbPassword?: string;
    dbUrl?: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  };
  whatsapp: {
    apiKey: string;
    senderNumber: string;
    baseUrl: string;
    templateName: string;
    templateLanguage: string;
    webhookVerifyToken: string;
  };
  app: {
    siteUrl: string;
    appName: string;
    nodeEnv: string;
    baseDomain: string;
    apiUrl: string;
    mgmtUrl: string;
    superadminUrl: string;
    wabaUrl: string;
  };
  security: {
    otpSecretPepper: string;
    superadminSessionSecret: string;
    totpSecretEncryptionKey: string;
    sessionSecret: string;
    superadminUserId: string;
  };
  payu: {
    merchantKey: string;
    merchantSalt: string;
    clientSecret: string;
    environment: string;
    clientId: string;
  };
  turnstile: {
    siteKey: string;
    secretKey: string;
  };
}

class EnvironmentValidator {
  private config: Partial<EnvironmentConfig> = {};
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment() {
    // Supabase Configuration
    try {
      const publicEnv = requireSupabasePublicEnv();
      const serviceEnv = requireSupabaseServiceEnv();
      this.config.supabase = {
        url: publicEnv.url,
        anonKey: publicEnv.publicKey,
        serviceRoleKey: serviceEnv.serviceKey,
        publicKeySource: publicEnv.keySource,
        dbPassword: this.optionalEnv('SUPABASE_DB_PASSWORD', 'Database password'),
        dbUrl: this.optionalEnv('DATABASE_URL', 'Prisma DB connection URL'),
      };
    } catch (error) {
      this.errors.push(error instanceof Error ? error.message : 'Invalid Supabase configuration');
      this.config.supabase = {
        url: '',
        anonKey: '',
        serviceRoleKey: '',
        publicKeySource: 'anon'
      };
    }

    // SMTP Configuration
    this.config.smtp = {
      host: this.requireEnv('SMTP_HOST', 'SMTP Host'),
      port: parseInt(this.requireEnv('SMTP_PORT', 'SMTP Port')),
      secure: this.getEnv('SMTP_SECURE', 'false') === 'true',
      user: this.requireEnv('SMTP_USER', 'SMTP User'),
      pass: this.requireEnv('SMTP_PASS', 'SMTP Password'),
      from: this.requireEnv('SMTP_FROM', 'SMTP From Address'),
      fromName: this.getEnv('SMTP_FROM_NAME', 'TecBunny Solutions')
    };

    // Infobip WhatsApp Configuration
    this.config.whatsapp = {
      apiKey: this.requireEnv('INFOBIP_API_KEY', 'Infobip API Key'),
      senderNumber: this.requireEnv('INFOBIP_WHATSAPP_FROM', 'Infobip Sender Number'),
      baseUrl: this.requireEnv('INFOBIP_BASE_URL', 'Infobip Base URL'),
      templateName: this.optionalEnv('INFOBIP_WHATSAPP_TEMPLATE_NAME', 'Infobip Template Name'),
      templateLanguage: this.optionalEnv('INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE', 'Infobip Template Language'),
      webhookVerifyToken: this.requireEnv('WHATSAPP_WEBHOOK_VERIFY_TOKEN', 'WhatsApp Webhook Verify Token')
    };

    // App Configuration
    this.config.app = {
      siteUrl: this.requireEnv('NEXT_PUBLIC_SITE_URL', 'Site URL'),
      baseDomain: this.requireEnv('NEXT_PUBLIC_BASE_DOMAIN', 'Base Domain'),
      apiUrl: this.requireEnv('NEXT_PUBLIC_API_URL', 'API URL'),
      mgmtUrl: this.requireEnv('NEXT_PUBLIC_MGMT_URL', 'Management App URL'),
      superadminUrl: this.requireEnv('NEXT_PUBLIC_SUPERADMIN_URL', 'Superadmin App URL'),
      wabaUrl: this.requireEnv('NEXT_PUBLIC_WABA_URL', 'WABA App URL'),
      appName: this.getEnv('NEXT_PUBLIC_APP_NAME', 'TecBunny Solutions'),
      nodeEnv: this.getEnv('NODE_ENV', 'development')
    };

    // Security
    this.config.security = {
      otpSecretPepper: this.requireEnv('OTP_SECRET_PEPPER', 'OTP Secret Pepper'),
      superadminSessionSecret: this.requireEnv('SUPERADMIN_SESSION_SECRET', 'Superadmin Session Secret'),
      totpSecretEncryptionKey: this.requireEnv('TOTP_SECRET_ENCRYPTION_KEY', 'TOTP Secret Encryption Key'),
      sessionSecret: this.requireEnv('SESSION_SECRET', 'Session Secret'),
      superadminUserId: this.requireEnv('SUPERADMIN_USER_ID', 'Superadmin User ID')
    };

    // PayU
    this.config.payu = {
      merchantKey: this.requireEnv('PAYU_MERCHANT_KEY', 'PayU Merchant Key'),
      merchantSalt: this.requireEnv('PAYU_MERCHANT_SALT', 'PayU Merchant Salt'),
      clientSecret: this.requireEnv('PAYU_CLIENT_SECRET', 'PayU Client Secret'),
      environment: this.requireEnv('PAYU_ENVIRONMENT', 'PayU Environment'),
      clientId: this.requireEnv('PAYU_CLIENT_ID', 'PayU Client ID')
    };

    // Turnstile
    this.config.turnstile = {
      siteKey: this.requireEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'Turnstile Site Key'),
      secretKey: this.requireEnv('TURNSTILE_SECRET_KEY', 'Turnstile Secret Key')
    };

    this.reportValidationResults();
  }

  private requireEnv(key: string, description: string): string {
    const value = process.env[key];
    if (!value) {
      this.errors.push(`Missing required environment variable: ${key} (${description})`);
      return '';
    }
    return value;
  }

  private optionalEnv(key: string, _description: string): string {
    const value = process.env[key];
    return value || '';
  }

  private getEnv(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  private reportValidationResults() {
    if (this.errors.length > 0) {
      // Avoid logging using external logger if running as script
      if (!process.argv[1]?.endsWith('environment-validator.ts')) {
        logger.error('Environment validation failed', { errors: this.errors });
      }

      if (process.env.STRICT_ENV_VALIDATION === 'true') {
        throw new Error(`Environment validation failed: ${this.errors.join(', ')}`);
      }
    } else if (process.env.NODE_ENV !== 'production' && !process.argv[1]?.endsWith('environment-validator.ts')) {
      logger.info('Environment validation completed', {
        errorsCount: this.errors.length,
        nodeEnv: this.config.app?.nodeEnv
      });
    }
  }

  getConfig(): EnvironmentConfig {
    return this.config as EnvironmentConfig;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }
}

// Export singleton instance
export const environmentValidator = new EnvironmentValidator();
export const envConfig = environmentValidator.getConfig();
export default environmentValidator;

// If executed directly as a script
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('environment-validator.ts')) {
  // We explicitly load dotenv in the script context since the monorepo root might have the .env
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    // Re-run validation with loaded envs
    const validator = new EnvironmentValidator();
    if (!validator.isValid()) {
      console.error('❌ Environment validation failed. Missing variables:');
      console.error(validator.getErrors().map(e => `   - ${e}`).join('\n'));
      process.exit(1);
    } else {
      console.log('✅ Environment validation passed successfully.');
    }
  } else {
    console.error(`❌ Cannot find .env at ${envPath}`);
    process.exit(1);
  }
}
