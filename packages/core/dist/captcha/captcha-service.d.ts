export type CaptchaProvider = 'turnstile';
export interface CaptchaConfig {
    provider: CaptchaProvider;
    siteKey: string;
    secretKey: string;
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact' | 'invisible';
    language?: string;
}
export interface CaptchaVerificationResult {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    error?: string;
    errorCodes?: string[];
}
/**
 * Cloudflare Turnstile CAPTCHA service
 */
export declare class CaptchaService {
    private config;
    constructor(config: CaptchaConfig);
    /**
     * Verify CAPTCHA response from client
     */
    verifyCaptcha(response: string, remoteIp?: string): Promise<CaptchaVerificationResult>;
    /**
     * Get CAPTCHA client configuration for frontend
     */
    getClientConfig(): Omit<CaptchaConfig, 'secretKey'>;
    /**
     * Verify Cloudflare Turnstile
     */
    private verifyTurnstile;
}
export declare const captchaService: CaptchaService;
export declare function verifyCaptcha(response: string | null, remoteIp?: string): Promise<CaptchaVerificationResult>;
//# sourceMappingURL=captcha-service.d.ts.map