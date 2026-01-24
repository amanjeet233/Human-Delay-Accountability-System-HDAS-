'use client';

import React from 'react';
import { useFeatureFlags } from '../lib/featureFlagContext';
import { useToast } from '../components/Toast';

interface ComingSoonButtonProps {
  /** Feature flag name in backend */
  flag: string;
  /** Human-readable feature title for tooltip */
  title: string;
  /** Short description for tooltip/coming soon */
  description?: string;
  /** Optional icon (ReactNode) */
  icon?: React.ReactNode;
  /** Optional custom className */
  className?: string;
  /** Optional variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Optional size */
  size?: 'sm' | 'md' | 'lg';
  /** Optional disabled state independent of flag */
  disabled?: boolean;
  /** Click handler (only fires when enabled) */
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

/**
 * Renders a button that is disabled when the feature flag is off.
 * When disabled: shows “Coming Soon” tooltip, disables clicks, shows toast on click.
 * When enabled: behaves like a normal button.
 */
export const ComingSoonButton: React.FC<ComingSoonButtonProps> = ({
  flag,
  title,
  description = 'This feature is coming soon.',
  icon,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  const { isEnabled, isLoading } = useFeatureFlags();
  const { showToast } = useToast();

  const enabled = !isLoading && isEnabled(flag) && !disabled;

  const handleClick = (e: React.MouseEvent) => {
    if (!enabled) {
      e.preventDefault();
      e.stopPropagation();
      showToast(description, 'warn');
    } else {
      onClick?.(e);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: enabled ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    secondary: enabled ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    outline: enabled ? 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500' : 'border border-gray-300 text-gray-500 cursor-not-allowed',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      disabled={!enabled}
      title={enabled ? undefined : `${title}\n${description}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
