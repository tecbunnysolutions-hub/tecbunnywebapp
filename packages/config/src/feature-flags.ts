export const FeatureFlags = {
  CHECKOUT_ENABLED: 'checkout_enabled',
  NEW_PAYMENT_GATEWAY: 'new_payment_gateway',
} as const;

export type FeatureFlagKey = typeof FeatureFlags[keyof typeof FeatureFlags];

export interface FeatureFlag {
  key: FeatureFlagKey | string;
  enabled: boolean;
  description?: string;
  updated_at: string;
}

export type FeatureFlagDictionary = Record<string, boolean>;
