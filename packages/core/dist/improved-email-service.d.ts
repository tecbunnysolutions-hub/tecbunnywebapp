export interface EmailOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    skipRateLimit?: boolean;
    subject: string;
    html: string;
    text?: string;
}
export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    waitTime?: number;
}
declare class ImprovedEmailService {
    private transporter;
    private backupTransporter?;
    private config;
    private lastSendTime;
    private isMainServiceDown;
    private isBackupServiceDown;
    private lastMainServiceCheck;
    private lastBackupServiceCheck;
    constructor();
    private verifyConnections;
    getConnectionStatus(): Promise<{
        primary: {
            status: string;
            host: string;
        };
        backup: {
            status: string;
            host: string;
        } | {
            status: string;
            host?: undefined;
        };
    }>;
    private checkRateLimit;
    private sendWithTransporter;
    sendEmail(options: EmailOptions): Promise<EmailResult>;
    sendOTPEmail(email: string, otp: string, type?: 'signup' | 'recovery'): Promise<EmailResult>;
    sendTestEmail(email: string, subject: string, message: string): Promise<EmailResult>;
}
declare const improvedEmailService: ImprovedEmailService;
export default improvedEmailService;
//# sourceMappingURL=improved-email-service.d.ts.map