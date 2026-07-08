import { AppError, Result, success, failure } from '../errors';
import { OTPManager, type OTPChannel } from '../otp-manager';
import { verifyCaptcha } from '../captcha/captcha-service';
import { logger } from '../logger';

export class AuthService {
  private otpService: OTPManager;

  constructor(private readonly supabaseAdmin: any) {
    this.otpService = new OTPManager();
  }

  async signup(params: any, clientIp: string, siteKey?: string): Promise<Result<any>> {
    const { email, password, name, mobile: _mobile, captchaToken, channel: requestedChannel } = params;
    
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedMobile = typeof _mobile === 'string' ? _mobile.replace(/\D/g, '') : '';

    if (siteKey) {
      const captcha = await verifyCaptcha(captchaToken, clientIp);
      if (!captcha.success) {
        return failure(AppError.badRequest(`Captcha verification failed: ${captcha.error || captcha.errorCodes?.join(', ') || 'Invalid captcha token'}`));
      }
    }

    if (!password || !name || !normalizedEmail || !normalizedMobile) {
      return failure(AppError.badRequest('Name, email address, mobile number, and password are required'));
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return failure(AppError.badRequest('Please enter a valid email address'));
    }

    if (password.length < 8) {
      return failure(AppError.badRequest('Password must be at least 8 characters long'));
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return failure(AppError.badRequest('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'));
    }

    let mobile = normalizedMobile.replace(/\D/g, '');
    if (mobile.length < 10 || mobile.length > 15) {
      return failure(AppError.badRequest('Mobile number must be between 10-15 digits'));
    }

    try {
      const orConditions: string[] = [];
      if (normalizedEmail) orConditions.push(`email.eq.${normalizedEmail}`);
      if (mobile) orConditions.push(`mobile.eq.${mobile}`);

      if (orConditions.length > 0) {
        const { data: existingProfiles, error: checkError } = await this.supabaseAdmin
          .from('profiles')
          .select('id, email, mobile')
          .or(orConditions.join(','));

        if (!checkError && existingProfiles && existingProfiles.length > 0) {
          return failure(new AppError('USER_ALREADY_EXISTS', 'An account with this email address or mobile number already exists', 409));
        }
      }
    } catch (checkError) {
      logger.error('signup.check_existing_users_failed', { email: normalizedEmail || email, error: checkError });
    }

    const otpMobile = mobile || undefined;
    const preferredChannel: OTPChannel = (requestedChannel && ['email', 'whatsapp'].includes(requestedChannel)) 
      ? requestedChannel as OTPChannel 
      : 'whatsapp';
    
    const otpResult = await this.otpService.generateOTP({
      email: normalizedEmail || undefined,
      phone: otpMobile,
      purpose: 'registration',
      preferredChannel,
      enforcePreferredChannel: true,
    });

    if (!otpResult.success || !otpResult.otpId) {
      return failure(AppError.internal(otpResult.message || 'Failed to send verification code'));
    }

    return success({
      message: otpResult.message ?? `Verification code sent via ${otpResult.channel}.`,
      otpSent: true,
      verificationRequired: true,
      otpId: otpResult.otpId,
      channel: otpResult.channel,
      fallbackAvailable: otpResult.fallbackAvailable,
      fallbackProvider: otpResult.provider,
      preferredChannel,
    });
  }

  async verifyOtp(params: any): Promise<Result<any>> {
    const { email, mobile, otp, type = 'signup', otpId: rawOtpId } = params || {};
    
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return failure(AppError.badRequest('Valid 6-digit OTP is required'));
    }
    if (!['signup', 'recovery'].includes(type)) {
      return failure(AppError.badRequest('Invalid OTP type. Must be either "signup" or "recovery"'));
    }
    
    const purpose = type === 'signup' ? 'registration' : 'password_reset';
    const otpId = typeof rawOtpId === 'string' ? rawOtpId.trim() : undefined;

    if (!otpId) {
      return failure(AppError.badRequest('otpId is required'));
    }

    const { data: otpRecord, error: otpRecordError } = await this.supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('id', otpId)
      .maybeSingle();

    if (otpRecordError || !otpRecord) {
      return failure(AppError.badRequest('Invalid or expired OTP reference. Please request a new code.'));
    }

    if (otpRecord.purpose !== purpose) {
      return failure(AppError.badRequest('OTP type mismatch. Please request a new code.'));
    }

    const verificationResult = await this.otpService.verifyOTP({
      otpId,
      code: otp,
      channel: otpRecord.channel || undefined,
    });

    if (!verificationResult.success) {
      return failure(AppError.badRequest(verificationResult.message || 'Invalid or expired OTP'));
    }

    const identifier = otpRecord.email || otpRecord.phone;

    if (type === 'signup') {
      return success({
        message: 'OTP verified successfully! Creating your account...',
        type: 'signup',
        identifier,
        otpId,
        requiresAccountCreation: true
      });
    }

    if (type === 'recovery') {
      try {
        let user: any = null;
        let profileRole: string | null = null;
        
        if (otpRecord.email) {
          const { data: profile } = await this.supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('email', otpRecord.email.trim().toLowerCase())
            .maybeSingle();
          
          if (profile?.id) {
            profileRole = profile.role;
            const { data: userData } = await this.supabaseAdmin.auth.admin.getUserById(profile.id);
            if (userData?.user) user = userData.user;
          }
        } else if (otpRecord.phone) {
          const { data: profile } = await this.supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('mobile', otpRecord.phone.trim())
            .maybeSingle();
          
          if (profile?.id) {
            profileRole = profile.role;
            const { data: userData } = await this.supabaseAdmin.auth.admin.getUserById(profile.id);
            if (userData?.user) user = userData.user;
          }
        }
        
        if (profileRole) {
          const role = profileRole.trim().toLowerCase();
          const isStaff = ['superadmin', 'admin', 'manager', 'sales', 'service_engineer', 'accounts'].includes(role);
          if (isStaff) {
            return failure(new AppError('FORBIDDEN', 'High-privilege account detected. Please use the Staff Portal to authenticate.', 403, { redirectTo: '/staff/login' }));
          }
        }
        
        if (user) {
          const { error: confirmError } = await this.supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
          if (confirmError) {
            return failure(AppError.internal('Failed to confirm account. Please try again.'));
          } else {
            return success({
              message: 'Account verified successfully!',
              type,
              identifier,
              otpId,
              requiresSignIn: false
            });
          }
        } else {
          return failure(AppError.badRequest('User not found. Please sign up first.'));
        }
      } catch (e) {
        return failure(AppError.internal('Failed to verify account. Please try again.'));
      }
    }

    return success({
      message: verificationResult.message || 'Verification successful',
      type,
      identifier,
      otpId,
      requiresSignIn: type === 'signup'
    });
  }
}
