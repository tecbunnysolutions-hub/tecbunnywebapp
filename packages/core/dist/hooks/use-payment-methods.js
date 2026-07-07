import { useState } from 'react';
const staticPaymentSettings = {
    payu: {
        id: 'payu',
        name: 'PayU',
        type: 'online',
        enabled: true,
        config: {
            environment: 'test'
        }
    },
    cod: {
        id: 'cod',
        name: 'Cash on Delivery',
        type: 'offline',
        enabled: true,
        config: {}
    },
    upi: {
        id: 'upi',
        name: 'UPI/QR Code',
        type: 'offline',
        enabled: true,
        config: {}
    }
};
export function usePaymentMethods() {
    const [paymentMethods] = useState(staticPaymentSettings);
    const fetchPaymentSettings = async () => {
        // No-op: Settings are strictly managed via codebase configuration.
    };
    const updatePaymentMethod = async (methodId, updates) => {
        // Updates via UI are disabled as payment options are code-driven
        return { success: false, error: 'Payment configurations are code-managed.' };
    };
    const getEnabledPaymentMethods = () => {
        return Object.values(paymentMethods).filter(method => method.enabled);
    };
    const getOnlinePaymentMethods = () => {
        return Object.values(paymentMethods).filter(method => method.enabled && method.type === 'online');
    };
    const getOfflinePaymentMethods = () => {
        return Object.values(paymentMethods).filter(method => method.enabled && method.type === 'offline');
    };
    return {
        paymentMethods,
        loading: false,
        error: null,
        updatePaymentMethod,
        fetchPaymentSettings,
        getEnabledPaymentMethods,
        getOnlinePaymentMethods,
        getOfflinePaymentMethods
    };
}
