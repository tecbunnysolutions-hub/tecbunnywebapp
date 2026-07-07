export declare const FeatureFlags: {
    readonly CHECKOUT_ENABLED: "checkout_enabled";
    readonly NEW_PAYMENT_GATEWAY: "new_payment_gateway";
};
export type FeatureFlagKey = typeof FeatureFlags[keyof typeof FeatureFlags];
export interface FeatureFlag {
    key: FeatureFlagKey | string;
    enabled: boolean;
    description?: string;
    updated_at: string;
}
export type FeatureFlagDictionary = Record<string, boolean>;
//# sourceMappingURL=feature-flags.d.ts.map