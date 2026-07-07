import { ReactNode } from 'react';
import type { FeatureFlagDictionary, FeatureFlagKey } from '@tecbunny/config';
export declare const FeatureFlagProvider: ({ children, flags, isLoading }: {
    children: ReactNode;
    flags: FeatureFlagDictionary;
    isLoading: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useFeatureFlags: () => {
    isEnabled: (key: FeatureFlagKey | string) => boolean;
    flags: FeatureFlagDictionary;
    isLoading: boolean;
};
//# sourceMappingURL=use-feature-flags.d.ts.map