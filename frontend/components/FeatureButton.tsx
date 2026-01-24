'use client';

import React from 'react';
import { ComingSoonButton } from './ComingSoonButton';

interface FeatureButtonProps {
  /** Feature flag name in backend */
  flag: string;
  /** Human-readable title for tooltip */
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
 * Reusable button for future features.
 * When disabled: shows “Coming Soon” tooltip and toast on click.
 * When enabled: behaves like a normal button.
 */
export const FeatureButton: React.FC<FeatureButtonProps> = ({
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
  return (
    <ComingSoonButton
      flag={flag}
      title={title}
      description={description}
      icon={icon}
      className={className}
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </ComingSoonButton>
  );
};
