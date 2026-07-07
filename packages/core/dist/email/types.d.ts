export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
export interface EmailTemplateData {
    userName?: string;
    userEmail?: string;
    otp?: string;
    otpExpiryMinutes?: number;
    orderId?: string;
    orderTotal?: number;
    orderItems?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    orderDate?: string;
    deliveryAddress?: string;
    pickupCode?: string;
    paymentMethod?: string;
    transactionId?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    companyName?: string;
    companyLogo?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    websiteUrl?: string;
    campaignTitle?: string;
    campaignBody?: string;
    ctaText?: string;
    ctaUrl?: string;
    bannerImageUrl?: string;
    discountCode?: string;
    updateTitle?: string;
    updateBody?: string;
    updateDate?: string;
    cartItems?: Array<{
        name: string;
        quantity: number;
        price: number;
        image?: string;
    }>;
    restoreCartUrl?: string;
    minutesSinceAbandoned?: number;
    orderType?: 'delivery' | 'pickup';
}
export declare const EMAIL_TEMPLATES: {
    readonly EMAIL_OTP_VERIFICATION: "email_otp_verification";
    readonly WELCOME_EMAIL: "welcome_email";
    readonly ORDER_PLACED: "order_placed";
    readonly PAYMENT_CONFIRMED: "payment_confirmed";
    readonly PAYMENT_FAILED: "payment_failed";
    readonly PAYMENT_PENDING: "payment_pending";
    readonly SHIPPING_NOTIFICATION: "shipping_notification";
    readonly READY_FOR_PICKUP: "ready_for_pickup";
    readonly ORDER_COMPLETED: "order_completed";
    readonly ORDER_DELIVERED: "order_delivered";
    readonly PASSWORD_RESET_OTP: "password_reset_otp";
    readonly EMAIL_CHANGE_OTP: "email_change_otp";
    readonly MARKETING_CAMPAIGN: "marketing_campaign";
    readonly ABANDONED_CART: "abandoned_cart";
    readonly ORDER_NOTIFICATION_MANAGER: "order_notification_manager";
    readonly ORDER_NOTIFICATION_SALES_PICKUP: "order_notification_sales_pickup";
    readonly ORDER_APPROVED_ADMIN: "order_approved_admin";
    readonly GENERAL_UPDATE: "general_update";
};
export type EmailTemplateType = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];
//# sourceMappingURL=types.d.ts.map