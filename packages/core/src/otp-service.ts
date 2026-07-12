import { createServiceClient, isSupabaseServiceConfigured } from './supabase/server';
/**
 * OTP Verification Service for Agent Orders and Customer Verification
 * Handles OTP generation, validation, and management
 */

import type { OtpType } from '@tecbunny/core';
import improvedEmailService from './improved-email-service';
import crypto from 'crypto';
import { rateLimit } from './rate-limit';

import { logger } from '@tecbunny/core';

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

export class OtpService {
  private supabase: ReturnType<typeof createServiceClient> | null;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor() {
    this.supabase = isSupabaseServiceConfigured ? createServiceClient() : null;
  }

  /**
   * Bug #7 fix: OTP codes are now stored as a scrypt hash, not plaintext.
   * A DB breach no longer exposes usable OTPs.
   *
   * Generate a 6-digit OTP and return both the plaintext (for delivery) and
   * the hash (for storage). Verification compares the submitted code against
   * the stored hash using timingSafeEqual.
   */
  private generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private hashOtpCode(plaintext: string): string {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(plaintext, salt, 32);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  private verifyOtpHash(plaintext: string, stored: string): boolean {
    try {
      const [saltHex, hashHex] = stored.split(':');
      if (!saltHex || !hashHex) return false;
      const salt = Buffer.from(saltHex, 'hex');
      const expected = Buffer.from(hashHex, 'hex');
      const actual = crypto.scryptSync(plaintext, salt, 32);
      return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  /**
   * Generate and send OTP for agent order verification
   */
  async generateOtp(request: OtpRequest, skipPhoneDelivery: boolean = false): Promise<{
    success: boolean;
    otp_id?: string;
    expires_at?: string;
    error?: string;
    otp_code?: string;
  }> {
    try {
      if (!this.supabase) {
        return { success: false, error: 'Supabase service client is not configured' };
      }

      // SECURITY: Rate limit OTP generation per phone number (60s cooldown)
      const rateKey = `otp_gen:${request.customer_phone}`;
      const isAllowed = await rateLimit(rateKey, 1, 60000);
      if (!isAllowed) {
        return { success: false, error: 'Please wait 60 seconds before requesting another OTP.' };
      }

      // Check if there's already a pending OTP for this order.
      // Bug #6 fix: We no longer return the stored otp_code in the response.
      // The plaintext OTP is only available at generation time and is never
      // re-exposed from the database (which now stores only the hash).
      const { data: existingOtp } = await this.supabase
        .from('order_otp_verifications')
        .select('id, expires_at')
        .eq('order_id', request.order_id)
        .eq('customer_phone', request.customer_phone)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (existingOtp) {
        // Cannot resend the original OTP because we only store the hash.
        // Expire the old record and fall through to generate a fresh OTP.
        await this.supabase
          .from('order_otp_verifications')
          .update({ expires_at: new Date().toISOString() })
          .eq('id', existingOtp.id);
      }

      // Generate new OTP
      const otpCode = this.generateOtpCode();
      // Bug #7 fix: Store the hash, not the plaintext.
      const otpHash = this.hashOtpCode(otpCode);
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      const { data: otpRecord, error } = await this.supabase
        .from('order_otp_verifications')
        .insert([{
          order_id: request.order_id,
          agent_id: request.agent_id,
          customer_phone: request.customer_phone,
          otp_code: otpHash,          // store hash only
          otp_type: request.otp_type,
          expires_at: expiresAt.toISOString(),
          created_by: request.created_by
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating OTP record', { error, request });
        return {
          success: false,
          error: 'Failed to generate OTP'
        };
      }

      // Send OTP via Email if requested or if channel is 'both'
      if ((request.channel === 'email' || request.channel === 'both') && request.customer_email) {
        try {
          await improvedEmailService.sendOTPEmail(request.customer_email, otpCode);
        } catch (emailError) {
          logger.error('Failed to send OTP email', { error: emailError, email: request.customer_email });
          if (request.channel === 'email') {
            return { success: false, error: 'Failed to send OTP email' };
          }
        }
      }

      if (!skipPhoneDelivery && (request.channel === 'whatsapp' || request.channel === 'both' || !request.channel)) {
        const whatsAppResult = await this.sendOtpWhatsApp(request.customer_phone, otpCode, request.otp_type);
        
        if (!whatsAppResult.success && request.channel !== 'both') {
          await this.supabase
            .from('order_otp_verifications')
            .delete()
            .eq('id', otpRecord.id);

          return {
            success: false,
            error: 'Failed to send OTP via WhatsApp'
          };
        }
      }

      // Bug #6 fix: otp_code is NOT returned in the response. The plaintext OTP
      // is only used for delivery (WhatsApp/email) and is never stored or returned.
      return {
        success: true,
        otp_id: otpRecord.id,
        expires_at: expiresAt.toISOString(),
      };

    } catch (error) {
      logger.error('Error in generateOtp', { error, request });
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Verify OTP code.
   * Bug #7 fix: Verification now uses hash comparison (verifyOtpHash) instead
   * of passing the plaintext to the DB RPC. The RPC fetches the stored hash and
   * the application layer compares using timingSafeEqual.
   */
  async verifyOtp(verification: OtpVerification): Promise<{
    success: boolean;
    verified?: boolean;
    error?: string;
    attempts_left?: number;
  }> {
    try {
      if (!this.supabase) {
        return { success: false, error: 'Supabase service client is not configured' };
      }

      // Fetch the pending OTP record (increment attempts atomically via RPC)
      const { data, error: rpcError } = await this.supabase.rpc('fetch_and_increment_otp_attempt', {
        p_order_id: verification.order_id,
        p_customer_phone: verification.customer_phone,
        p_max_attempts: this.MAX_ATTEMPTS,
      });

      if (rpcError) {
        logger.error('Error fetching OTP record via RPC', { error: rpcError, verification });
        return { success: false, error: 'Internal server error during verification' };
      }

      const result = data as {
        found: boolean;
        expired: boolean;
        locked: boolean;
        otp_code_hash: string;
        record_id: string;
        attempts_left: number;
      } | null;

      if (!result || !result.found) {
        return { success: false, error: 'OTP not found or already verified' };
      }
      if (result.expired) {
        return { success: false, error: 'OTP has expired. Please request a new one.' };
      }
      if (result.locked) {
        return { success: false, error: 'Too many incorrect attempts. Please request a new OTP.', attempts_left: 0 };
      }

      // Application-layer hash comparison — plaintext never stored or sent to DB
      const isValid = this.verifyOtpHash(verification.otp_code, result.otp_code_hash);

      if (!isValid) {
        return {
          success: false,
          error: 'Invalid OTP',
          attempts_left: result.attempts_left,
        };
      }

      // Mark as verified
      await this.supabase
        .from('order_otp_verifications')
        .update({ verified: true })
        .eq('id', result.record_id);

      return { success: true, verified: true };

    } catch (error) {
      logger.error('Error in verifyOtp service', { error, verification });
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Bug #22 fix: sendOtpWhatsApp was a no-op that always returned success,
   * silently failing to deliver OTPs. It now sends via the Infobip service.
   * The OTP is delivered as a WhatsApp template message so it works outside
   * the 24h messaging window.
   */
  private async sendOtpWhatsApp(
    phone: string,
    otpCode: string,
    otpType: OtpType,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Dynamically import to avoid circular dependency issues at module load
      const whatsappService = await import('./whatsapp-service') as any;
      const result = await whatsappService.sendTemplateMessage(phone, process.env.OTP_WHATSAPP_TEMPLATE_NAME ?? 'otp_verification', [otpCode]);
      if (!result?.success) {
        logger.error('OTP WhatsApp delivery failed', { phone, otpType, error: result?.error });
        return { success: false, error: 'WhatsApp delivery failed' };
      }
      logger.info('OTP delivered via WhatsApp', { phone, otpType });
      return { success: true };
    } catch (err) {
      logger.error('OTP WhatsApp delivery threw', { phone, error: err });
      return { success: false, error: 'WhatsApp delivery error' };
    }
  }

  /**
   * Update order with OTP verification status
   */
  private async updateOrderOtpStatus(orderId: string, verified: boolean) {
    try {
      if (!this.supabase) return;
      await this.supabase
        .from('orders')
        .update({
          otp_verified: verified,
          otp_verified_at: verified ? new Date().toISOString() : null
        })
        .eq('id', orderId);
    } catch (error) {
      logger.error('Error updating order OTP status', { error, orderId, verified });
    }
  }

  /**
   * Get OTP verification status for an order
   */
  async getOtpStatus(orderId: string): Promise<{
    verified: boolean;
    pending: boolean;
    expired: boolean;
    attempts_used: number;
    max_attempts: number;
  }> {
    try {
      if (!this.supabase) {
        return {
          verified: false,
          pending: false,
          expired: false,
          attempts_used: 0,
          max_attempts: this.MAX_ATTEMPTS
        };
      }
      const { data: otpRecord } = await this.supabase
        .from('order_otp_verifications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return {
          verified: false,
          pending: false,
          expired: false,
          attempts_used: 0,
          max_attempts: this.MAX_ATTEMPTS
        };
      }

      const isExpired = new Date(otpRecord.expires_at) < new Date();
      const isPending = !otpRecord.verified && !isExpired && otpRecord.attempts < this.MAX_ATTEMPTS;

      return {
        verified: otpRecord.verified,
        pending: isPending,
        expired: isExpired,
        attempts_used: otpRecord.attempts,
        max_attempts: this.MAX_ATTEMPTS
      };

    } catch (error) {
      logger.error('Error getting OTP status', { error, orderId });
      return {
        verified: false,
        pending: false,
        expired: false,
        attempts_used: 0,
        max_attempts: this.MAX_ATTEMPTS
      };
    }
  }

  /**
   * Clean up expired OTP records (should be run periodically)
   */
  async cleanupExpiredOtps(): Promise<number> {
    try {
      if (!this.supabase) return 0;
      const { count, error } = await this.supabase
        .from('order_otp_verifications')
        .delete({ count: 'exact' })
        .lt('expires_at', new Date().toISOString())
        .eq('verified', false);

      if (error) {
        logger.error('Error cleaning up expired OTPs', { error });
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in cleanupExpiredOtps', { error });
      return 0;
    }
  }
}
export const otpService = new OtpService();
