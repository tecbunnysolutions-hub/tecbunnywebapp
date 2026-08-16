import { useState, useEffect, useRef, useCallback } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'online' | 'offline';
  enabled: boolean;
  config?: {
    environment?: string;
    minOrderAmount?: string;
    maxOrderAmount?: string;
    instructions?: string;
    upiId?: string;
    upiName?: string;
    merchantKey?: string;
    merchantSalt?: string;
    merchantId?: string;
    keyId?: string;
    secretKey?: string;
    appId?: string;
    publishableKey?: string;
    websiteName?: string;
    industryType?: string;
    channelId?: string;
    saltKey?: string;
    saltIndex?: string;
  };
}

export interface PaymentSettings {
  payu: PaymentMethod;
  cashfree: PaymentMethod;
  cod: PaymentMethod;
  upi: PaymentMethod;
}

const staticPaymentSettings: PaymentSettings = {
  payu: {
    id: 'payu',
    name: 'PayU',
    type: 'online',
    enabled: true,
    config: { environment: 'production' },
  },
  cashfree: {
    id: 'cashfree',
    name: 'Cashfree',
    type: 'online',
    enabled: true,
    config: { environment: 'production' },
  },
  cod: {
    id: 'cod',
    name: 'Cash on Delivery',
    type: 'offline',
    enabled: true,
    config: {},
  },
  upi: {
    id: 'upi',
    name: 'UPI/QR Code',
    type: 'offline',
    enabled: true,
    config: {},
  },
};

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>(staticPaymentSettings);
  const [loading, setLoading] = useState(true);
  // ref prevents stale-closure issues in updatePaymentMethod
  const methodsRef = useRef<PaymentSettings>(staticPaymentSettings);

  const fetchPaymentSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings?key=payment_methods_config', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const config = data?.value as Record<string, { enabled: boolean }> | null;
      if (!config) return;

      setPaymentMethods(prev => {
        const next = { ...prev };
        for (const [id, override] of Object.entries(config)) {
          if (id in next) {
            next[id as keyof PaymentSettings] = {
              ...next[id as keyof PaymentSettings],
              enabled: override.enabled ?? next[id as keyof PaymentSettings].enabled,
            };
          }
        }
        methodsRef.current = next;
        return next;
      });
    } catch {
      // Silently fall back to static defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentSettings();
  }, [fetchPaymentSettings]);

  const updatePaymentMethod = async (methodId: string, updates: Partial<PaymentMethod>) => {
    const next: PaymentSettings = {
      ...methodsRef.current,
      [methodId]: {
        ...methodsRef.current[methodId as keyof PaymentSettings],
        ...updates,
      },
    };
    methodsRef.current = next;
    setPaymentMethods(next);

    // Persist only enabled flags — credentials live in server env vars
    const enabledConfig = Object.fromEntries(
      Object.entries(next).map(([id, m]) => [id, { enabled: m.enabled }])
    );

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          key: 'payment_methods_config',
          value: enabledConfig,
          description: 'Payment gateway enabled/disabled configuration',
        }),
      });
      return res.ok ? { success: true } : { success: false, error: 'Failed to save' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const getEnabledPaymentMethods = () =>
    Object.values(paymentMethods).filter(m => m.enabled);

  const getOnlinePaymentMethods = () =>
    Object.values(paymentMethods).filter(m => m.enabled && m.type === 'online');

  const getOfflinePaymentMethods = () =>
    Object.values(paymentMethods).filter(m => m.enabled && m.type === 'offline');

  return {
    paymentMethods,
    loading,
    error: null,
    updatePaymentMethod,
    fetchPaymentSettings,
    getEnabledPaymentMethods,
    getOnlinePaymentMethods,
    getOfflinePaymentMethods,
  };
}