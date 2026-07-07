export type OTPChannel = 'whatsapp' | 'email';
export type OTPPurpose = 'login' | 'registration' | 'password_reset' | 'transaction' | 'agent_order';
export interface OTPRequest {
    phone?: string;
    email?: string;
    purpose: OTPPurpose;
    preferredChannel?: OTPChannel;
    enforcePreferredChannel?: boolean;
    userId?: string;
    orderId?: string;
    ipAddress?: string;
}
export interface OTPVerification {
    otpId: string;
    code: string;
    channel?: OTPChannel;
}
export interface OTPRecord {
    id: string;
    code: string;
    phone?: string;
    email?: string;
    purpose: OTPPurpose;
    channel: OTPChannel;
    attempts: number;
    maxAttempts: number;
    verified: boolean;
    expiresAt: Date;
    createdAt: Date;
    userId?: string;
    orderId?: string;
    fallbackChannels: OTPChannel[];
    lastAttemptAt?: Date;
}
export interface OTPData {
    id: string;
    email: string;
    otp: string;
    expires_at: string;
    type: 'signup' | 'recovery';
    used: boolean;
    created_at: string;
}
export interface OTPInsertData {
    email: string;
    otp?: string;
    otp_code?: string;
    expires_at: string;
    type: 'signup' | 'recovery';
    used: boolean;
}
export declare function assertOtpVelocity(phoneNumber: string, ipAddress?: string): Promise<void>;
export declare class OTPManager {
    private emailTransporter;
    constructor();
    generateOTPCode(): string;
    private hashOTP;
    private sendEmailOTP;
    private sendWhatsAppOTP;
    private sendOTPViaChannel;
    generateOTP(): Promise<string>;
    generateOTP(request: OTPRequest): Promise<{
        success: boolean;
        otpId?: string;
        channel?: OTPChannel;
        message?: string;
        fallbackAvailable?: boolean;
        provider?: string;
        providerMessageId?: string;
        providerResponse?: any;
    }>;
    verifyOTP(verification: OTPVerification): Promise<{
        success: boolean;
        message?: string;
        canRetry?: boolean;
        suggestFallback?: boolean;
        nextFallbackChannel?: OTPChannel;
    }>;
    verifyOTP(email: string, otp: string, type?: 'signup' | 'recovery'): Promise<{
        success: boolean;
        message: string;
    }>;
    storeOTP(email: string, otp: string, type?: 'signup' | 'recovery'): Promise<boolean>;
    private storeOTPInMemory;
    private verifyOTPFromMemory;
    sendOTP(email: string, type?: 'signup' | 'recovery'): Promise<{
        success: boolean;
        message: string;
        waitTime?: number;
    }>;
    resendOTP(email: string, type?: 'signup' | 'recovery'): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanupExpiredOTPs(): Promise<void>;
    resendOTPWithFallback(otpId: string, fallbackChannel: OTPChannel): Promise<any>;
    getOTPStatus(otpId: string): Promise<any>;
}
export declare const otpManager: OTPManager;
export default otpManager;
//# sourceMappingURL=otp-manager.d.ts.map