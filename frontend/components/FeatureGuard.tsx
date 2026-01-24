'use client';

import React from 'react';
import { useFeatureFlags } from '../lib/featureFlagContext';

interface FeatureGuardProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children only when the given feature flag is enabled.
 * If disabled, shows fallback (default: null). Useful for UI-only gating.
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({ flag, children, fallback = null }) => {
  const { isEnabled, isLoading } = useFeatureFlags();

  if (isLoading) return null; // or a loading spinner if you prefer
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
};
