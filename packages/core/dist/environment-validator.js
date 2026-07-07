// Environment variable validation and configuration
import { logger } from '@tecbunny/core';
import { requireSupabasePublicEnv, requireSupabaseServiceEnv } from './supabase/env';
class EnvironmentValidator {
    config = {};
    errors = [];
    warnings = [];
    constructor() {
        this.validateEnvironment();
    }
    validateEnvironment() {
        // Supabase Configuration
        try {
            const publicEnv = requireSupabasePublicEnv();
            const serviceEnv = requireSupabaseServiceEnv();
            this.config.supabase = {
                url: publicEnv.url,
                anonKey: publicEnv.publicKey,
                serviceRoleKey: serviceEnv.serviceKey,
                publicKeySource: publicEnv.keySource
            };
        }
        catch (error) {
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
            host: this.getEnv('SMTP_HOST', 'smtp.gmail.com'),
            port: parseInt(this.getEnv('SMTP_PORT', '587')),
            secure: this.getEnv('SMTP_SECURE', 'false') === 'true',
            user: this.optionalEnv('SMTP_USER', 'SMTP User'),
            pass: this.optionalEnv('SMTP_PASS', 'SMTP Password'),
            from: this.getEnv('SMTP_FROM', 'noreply@tecbunny.com'),
            fromName: this.getEnv('SMTP_FROM_NAME', 'TecBunny Solutions')
        };
        // Infobip WhatsApp Configuration
        this.config.whatsapp = {
            apiKey: this.getEnv('INFOBIP_API_KEY', 'Infobip API Key'),
            senderNumber: this.getEnv('INFOBIP_WHATSAPP_FROM', 'Infobip Sender Number'),
            baseUrl: this.getEnv('INFOBIP_BASE_URL', 'Infobip Base URL'),
            templateName: this.optionalEnv('INFOBIP_WHATSAPP_TEMPLATE_NAME', 'Infobip Template Name'),
            templateLanguage: this.optionalEnv('INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE', 'Infobip Template Language')
        };
        // App Configuration
        this.config.app = {
            siteUrl: this.getEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
            appName: this.getEnv('NEXT_PUBLIC_APP_NAME', 'TecBunny Solutions'),
            nodeEnv: this.getEnv('NODE_ENV', 'development')
        };
        this.reportValidationResults();
    }
    requireEnv(key, description) {
        const value = process.env[key];
        if (!value) {
            this.errors.push(`Missing required environment variable: ${key} (${description})`);
            return '';
        }
        return value;
    }
    optionalEnv(key, _description) {
        const value = process.env[key];
        // Silently return empty for optional env vars - no warnings needed
        return value || '';
    }
    getEnv(key, defaultValue) {
        return process.env[key] || defaultValue;
    }
    reportValidationResults() {
        if (this.errors.length > 0) {
            logger.error('Environment validation failed', {
                errors: this.errors
            });
            if (process.env.STRICT_ENV_VALIDATION === 'true') {
                throw new Error(`Environment validation failed: ${this.errors.join(', ')}`);
            }
        }
        // Only log validation completion in development mode
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Environment validation completed', {
                errorsCount: this.errors.length,
                nodeEnv: this.config.app?.nodeEnv
            });
        }
    }
    getConfig() {
        return this.config;
    }
    isValid() {
        return this.errors.length === 0;
    }
    getErrors() {
        return this.errors;
    }
    getWarnings() {
        return this.warnings;
    }
    // Feature availability checks
    isEmailEnabled() {
        return !!(this.config.smtp?.user && this.config.smtp?.pass);
    }
    isWhatsAppEnabled() {
        return !!(this.config.whatsapp?.apiKey && this.config.whatsapp?.senderNumber);
    }
    isSupabaseEnabled() {
        return !!(this.config.supabase?.url && this.config.supabase?.serviceRoleKey);
    }
    getFeatureStatus() {
        return {
            email: this.isEmailEnabled(),
            whatsapp: this.isWhatsAppEnabled(),
            database: this.isSupabaseEnabled(),
            notifications: this.isWhatsAppEnabled() || this.isEmailEnabled()
        };
    }
}
// Export singleton instance
export const environmentValidator = new EnvironmentValidator();
export const envConfig = environmentValidator.getConfig();
export default environmentValidator;
