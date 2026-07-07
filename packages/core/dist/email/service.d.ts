import type { EmailTemplateData, EmailTemplateType } from './types';
export interface EmailServiceConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: {
        name: string;
        email: string;
    };
}
export declare class EmailService {
    private transporter;
    private config;
    constructor(config: EmailServiceConfig);
    /**
     * Verify email service connection
     */
    verifyConnection(): Promise<boolean>;
    /**
     * Send email using template
     */
    sendTemplateEmail(to: string | string[], templateType: EmailTemplateType, templateData: EmailTemplateData, options?: {
        cc?: string | string[];
        bcc?: string | string[];
        replyTo?: string;
        priority?: 'high' | 'normal' | 'low';
    }): Promise<boolean>;
    /**
     * Send custom email
     */
    sendCustomEmail(to: string | string[], subject: string, html: string, text?: string, options?: {
        cc?: string | string[];
        bcc?: string | string[];
        replyTo?: string;
        attachments?: Array<{
            filename: string;
            content: Buffer | string;
            contentType?: string;
        }>;
    }): Promise<boolean>;
    /**
     * Send bulk emails (with rate limiting)
     */
    sendBulkEmails(emails: Array<{
        to: string;
        templateType: EmailTemplateType;
        templateData: EmailTemplateData;
    }>, options?: {
        batchSize?: number;
        delayBetweenBatches?: number;
    }): Promise<{
        success: number;
        failed: number;
        results: Array<{
            email: string;
            success: boolean;
            error?: string;
        }>;
    }>;
}
export declare function createEmailService(): EmailService;
export declare const emailHelpers: {
    sendEmailVerification(to: string, userName: string, otp: string): Promise<boolean>;
    sendWelcomeEmail(to: string, userName: string): Promise<boolean>;
    sendOrderConfirmation(to: string, orderData: any): Promise<boolean>;
    sendAdminOrderNotification(recipients: string | string[], orderData: any): Promise<boolean>;
    sendPaymentConfirmation(to: string, orderData: any, paymentData: any): Promise<boolean>;
    sendShippingNotification(to: string, orderData: any, shippingData: any): Promise<boolean>;
    sendPaymentFailed(to: string, orderData: any, paymentData: any): Promise<boolean>;
    sendPaymentPending(to: string, orderData: any, paymentData: any): Promise<boolean>;
    sendPickupNotification(to: string, orderData: any, pickupCode: string): Promise<boolean>;
    sendOrderCompletion(to: string, orderData: any): Promise<boolean>;
    sendOrderDelivered(to: string, orderData: any): Promise<boolean>;
    sendPasswordResetOTP(to: string, userName: string, otp: string): Promise<boolean>;
    sendEmailChangeOTP(to: string, userName: string, otp: string): Promise<boolean>;
    sendMarketingCampaign(to: string | string[], data: EmailTemplateData): Promise<boolean>;
    sendAbandonedCartReminder(to: string, data: EmailTemplateData): Promise<boolean>;
    notifyManagerNewOrder(to: string | string[], data: EmailTemplateData): Promise<boolean>;
    notifySalesPickupOrder(to: string | string[], data: EmailTemplateData): Promise<boolean>;
    notifyAdminOrderApproved(to: string | string[], data: EmailTemplateData): Promise<boolean>;
};
//# sourceMappingURL=service.d.ts.map