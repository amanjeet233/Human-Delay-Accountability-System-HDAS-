'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from './apiClient';

type FeatureFlagMap = Record<string, boolean>;

interface FeatureFlagContextType {
  flags: FeatureFlagMap;
  isLoading: boolean;
  isEnabled: (flag: string) => boolean;
  refetch: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  return ctx;
};

export const FeatureFlagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlagMap>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const data = await apiClient.getFeatureFlags();
      setFlags(data);
    } catch (err) {
      console.warn('Failed to fetch feature flags', err);
      // Default to all disabled
      setFlags({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const isEnabled = (flag: string): boolean => {
    return !!flags[flag];
  };

  const refetch = async () => {
    await fetchFlags();
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading, isEnabled, refetch }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
