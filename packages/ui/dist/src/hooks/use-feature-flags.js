import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const FeatureFlagContext = createContext({
    flags: {},
    isLoading: true,
});
export const FeatureFlagProvider = ({ children, flags, isLoading }) => {
    return (_jsx(FeatureFlagContext.Provider, { value: { flags, isLoading }, children: children }));
};
export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    const isEnabled = (key) => {
        return !!context.flags[key];
    };
    return { ...context, isEnabled };
};
