export declare class EmailClient {
    private static instance;
    private readonly emailService;
    private constructor();
    static getInstance(): EmailClient;
    private dispatchEmail;
    /**
     * Send OTP Email
     */
    sendOtpEmail(to: string, otp: string, userName?: string, expiryMinutes?: number): Promise<boolean>;
    /**
     * Send Marketing Email
     */
    sendMarketingEmail(to: string | string[], campaign: {
        title: string;
        body: string;
        ctaText?: string;
        ctaUrl?: string;
        bannerImageUrl?: string;
        discountCode?: string;
    }): Promise<boolean>;
    /**
     * Send Update Email
     */
    sendUpdateEmail(to: string | string[], update: {
        title: string;
        body: string;
        date?: string;
        userName?: string;
    }): Promise<boolean>;
}
export declare const emailClient: EmailClient;
//# sourceMappingURL=client.d.ts.map