export interface PaymentMethod {
    id: string;
    name: string;
    type: 'online' | 'offline';
    enabled: boolean;
    config?: {
        keyId?: string;
        secretKey?: string;
        merchantId?: string;
        saltKey?: string;
        saltIndex?: string;
        appId?: string;
        publishableKey?: string;
        merchantKey?: string;
        merchantSalt?: string;
        websiteName?: string;
        industryType?: string;
        channelId?: string;
        environment?: string;
        minOrderAmount?: string;
        maxOrderAmount?: string;
        instructions?: string;
        upiId?: string;
        upiName?: string;
    };
}
export interface PaymentSettings {
    payu: PaymentMethod;
    cod: PaymentMethod;
    upi: PaymentMethod;
}
export declare function usePaymentMethods(): {
    paymentMethods: PaymentSettings;
    loading: boolean;
    error: null;
    updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => Promise<{
        success: boolean;
        error: string;
    }>;
    fetchPaymentSettings: () => Promise<void>;
    getEnabledPaymentMethods: () => any[];
    getOnlinePaymentMethods: () => any[];
    getOfflinePaymentMethods: () => any[];
};
//# sourceMappingURL=use-payment-methods.d.ts.map