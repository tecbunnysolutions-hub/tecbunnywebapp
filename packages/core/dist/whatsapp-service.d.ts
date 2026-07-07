export declare const sendWhatsAppNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendShipmentNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendPaymentActionRequired: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendPaymentConfirmationNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOrderCancelled: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOrderDelayed: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOrderActionNeeded: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOrderPickupReady: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendDeliveryConfirmation: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendPaymentReminder: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendWelcomeNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOrderNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOrderStatusUpdate: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendPickupNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare const sendOutForDeliveryNotification: (...args: any[]) => Promise<{
    messages: {
        id: string;
    }[];
}>;
export declare class WhatsAppService {
    checkWhatsAppConsent(...args: any[]): Promise<boolean>;
    sendOTP(...args: any[]): Promise<{
        messages: {
            id: string;
        }[];
    }>;
    sendMessage(...args: any[]): Promise<{
        messages: {
            id: string;
        }[];
    }>;
}
//# sourceMappingURL=whatsapp-service.d.ts.map