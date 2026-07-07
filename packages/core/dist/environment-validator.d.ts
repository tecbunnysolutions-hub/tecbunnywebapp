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
declare class EnvironmentValidator {
    private config;
    private errors;
    private warnings;
    constructor();
    private validateEnvironment;
    private requireEnv;
    private optionalEnv;
    private getEnv;
    private reportValidationResults;
    getConfig(): EnvironmentConfig;
    isValid(): boolean;
    getErrors(): string[];
    getWarnings(): string[];
    getFeatureStatus(): Record<string, boolean>;
}
export declare const environmentValidator: EnvironmentValidator;
export declare const envConfig: EnvironmentConfig;
export default environmentValidator;
//# sourceMappingURL=environment-validator.d.ts.map