'use client';

import React from 'react';
import { useFeatureFlags } from '../lib/featureFlagContext';
import { useToast } from '../components/Toast';

interface ComingSoonCardProps {
  /** Feature flag name in backend */
  flag: string;
  /** Human-readable feature title */
  title: string;
  /** Short description for tooltip */
  description?: string;
  /** Optional icon (ReactNode) */
  icon?: React.ReactNode;
  /** Optional custom CTA label */
  ctaLabel?: string;
  /** Optional custom className for the card container */
  className?: string;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders a card that is disabled when the feature flag is off.
 * When disabled: shows “Coming Soon” overlay, disables clicks, shows tooltip.
 * When enabled: renders children (or default button) normally.
 */
export const ComingSoonCard: React.FC<React.PropsWithChildren<ComingSoonCardProps>> = ({
  flag,
  title,
  description = 'This feature is coming soon.',
  icon,
  ctaLabel = 'Open',
  className = '',
  size = 'md',
  children,
}) => {
  const { isEnabled, isLoading } = useFeatureFlags();
  const { showToast } = useToast();

  const enabled = !isLoading && isEnabled(flag);

  const handleClick = (e: React.MouseEvent) => {
    if (!enabled) {
      e.preventDefault();
      e.stopPropagation();
      showToast(description, 'warn');
    }
  };

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  return (
    <div
      className={`
        relative border rounded-lg bg-white shadow-sm transition-all
        ${enabled ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-75'}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={handleClick}
      title={enabled ? undefined : description}
    >
      {/* Overlay when disabled */}
      {!enabled && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-90 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-gray-500 font-semibold mb-1">🚧 Coming Soon</div>
            <div className="text-xs text-gray-400 max-w-xs">{description}</div>
          </div>
        </div>
      )}

      {/* Normal content */}
      <div className={enabled ? '' : 'pointer-events-none'}>
        {icon && <div className="mb-2">{icon}</div>}
        <div className="font-semibold text-gray-800 mb-1">{title}</div>
        {children ? (
          children
        ) : (
          <button
            className={`
              mt-2 px-4 py-2 rounded font-medium transition-colors
              ${enabled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500'}
            `}
            disabled={!enabled}
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
};
