export interface EnvironmentConfig {
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
        publicKeySource: 'publishable' | 'anon';
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
    };
    app: {
        siteUrl: string;
        appName: string;
        nodeEnv: string;
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
    isEmailEnabled(): boolean;
    isWhatsAppEnabled(): boolean;
    isSupabaseEnabled(): boolean;
    getFeatureStatus(): {
        email: boolean;
        whatsapp: boolean;
        database: boolean;
        notifications: boolean;
    };
}
export declare const environmentValidator: EnvironmentValidator;
export declare const envConfig: EnvironmentConfig;
export default environmentValidator;
//# sourceMappingURL=environment-validator.d.ts.map