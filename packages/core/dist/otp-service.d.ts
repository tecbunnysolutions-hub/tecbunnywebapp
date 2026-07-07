/**
 * OTP Verification Service for Agent Orders and Customer Verification
 * Handles OTP generation, validation, and management
 */
import type { OtpType } from '@tecbunny/core';
export interface OtpRequest {
    order_id: string;
    agent_id?: string;
    customer_phone: string;
    customer_email?: string;
    otp_type: OtpType;
    created_by?: string;
    channel?: 'whatsapp' | 'email' | 'both';
}
export interface OtpVerification {
    order_id: string;
    customer_phone: string;
    otp_code: string;
}
export declare class OtpService {
    private supabase;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly MAX_ATTEMPTS;
    constructor();
    /**
     * Generate a 6-digit OTP code using cryptographically strong pseudo-random numbers
     */
    private generateOtpCode;
    /**
     * Generate and send OTP for agent order verification
     */
    generateOtp(request: OtpRequest, skipPhoneDelivery?: boolean): Promise<{
        success: boolean;
        otp_id?: string;
        expires_at?: string;
        error?: string;
        otp_code?: string;
    }>;
    /**
     * Verify OTP code
     */
    verifyOtp(verification: OtpVerification): Promise<{
        success: boolean;
        verified?: boolean;
        error?: string;
        attempts_left?: number;
    }>;
    /**
     * Send OTP via Meta WhatsApp API
     */
    private sendOtpWhatsApp;
    /**
     * Update order with OTP verification status
     */
    private updateOrderOtpStatus;
    /**
     * Get OTP verification status for an order
     */
    getOtpStatus(orderId: string): Promise<{
        verified: boolean;
        pending: boolean;
        expired: boolean;
        attempts_used: number;
        max_attempts: number;
    }>;
    /**
     * Clean up expired OTP records (should be run periodically)
     */
    cleanupExpiredOtps(): Promise<number>;
}
export declare const otpService: OtpService;
//# sourceMappingURL=otp-service.d.ts.map