import { EmailService } from './service';
import { EMAIL_TEMPLATES } from './types';
import { getEmailQueue } from './queue';
import { logger } from '../logger';
export class EmailClient {
    static instance;
    emailService;
    constructor() {
        this.emailService = new EmailService({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
            from: {
                name: process.env.SMTP_FROM_NAME || 'TecBunny Solutions',
                email: process.env.SMTP_FROM || 'noreply@tecbunny.com',
            },
        });
    }
    static getInstance() {
        if (!EmailClient.instance) {
            EmailClient.instance = new EmailClient();
        }
        return EmailClient.instance;
    }
    async dispatchEmail(to, templateId, data, options) {
        const queue = getEmailQueue();
        if (queue) {
            try {
                await queue.add('send-email', { to, templateId, data, options }, { priority: options.priority === 'high' ? 1 : 5 });
                logger.info('email_queued', { to, templateId });
                return true;
            }
            catch (error) {
                logger.error('email_queue_failed_fallback_direct', { error: error.message });
            }
        }
        // Fallback if no queue
        try {
            return await this.emailService.sendTemplateEmail(to, templateId, data, options);
        }
        catch (error) {
            logger.error('email_send_failed', { error: error.message });
            return false;
        }
    }
    /**
     * Send OTP Email
     */
    async sendOtpEmail(to, otp, userName, expiryMinutes = 10) {
        const data = {
            userName,
            otp,
            otpExpiryMinutes: expiryMinutes,
        };
        return this.dispatchEmail(to, EMAIL_TEMPLATES.EMAIL_OTP_VERIFICATION, data, { priority: 'high' });
    }
    /**
     * Send Marketing Email
     */
    async sendMarketingEmail(to, campaign) {
        const data = {
            campaignTitle: campaign.title,
            campaignBody: campaign.body,
            ctaText: campaign.ctaText,
            ctaUrl: campaign.ctaUrl,
            bannerImageUrl: campaign.bannerImageUrl,
            discountCode: campaign.discountCode,
        };
        return this.dispatchEmail(to, EMAIL_TEMPLATES.MARKETING_CAMPAIGN, data, { priority: 'low' });
    }
    /**
     * Send Update Email
     */
    async sendUpdateEmail(to, update) {
        const data = {
            userName: update.userName,
            updateTitle: update.title,
            updateBody: update.body,
            updateDate: update.date || new Date().toLocaleDateString(),
        };
        return this.dispatchEmail(to, EMAIL_TEMPLATES.GENERAL_UPDATE, data, { priority: 'normal' });
    }
}
export const emailClient = EmailClient.getInstance();
