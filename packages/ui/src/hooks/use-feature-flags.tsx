'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { FeatureFlagDictionary, FeatureFlagKey } from '@tecbunny/config';

interface FeatureFlagContextType {
  flags: FeatureFlagDictionary;
  isLoading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: {},
  isLoading: true,
});

export const FeatureFlagProvider = ({ 
  children, 
  flags, 
  isLoading 
}: { 
  children: ReactNode; 
  flags: FeatureFlagDictionary; 
  isLoading: boolean;
}) => {
  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }

  const isEnabled = (key: FeatureFlagKey | string, defaultValue: boolean = true) => {
    if (context.flags && context.flags[key] !== undefined) {
      return !!context.flags[key];
    }
    // Default fallback: if key is undefined, default to true for checkout_enabled
    if (key === 'checkout_enabled') {
      return true;
    }
    return defaultValue;
  };

  return { ...context, isEnabled };
};
