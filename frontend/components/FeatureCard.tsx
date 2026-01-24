'use client';

import React from 'react';
import { ComingSoonCard } from './ComingSoonCard';

interface FeatureCardProps {
  /** Feature flag name in backend */
  flag: string;
  /** Human-readable title */
  title: string;
  /** Short description */
  description: string;
  /** Optional icon (ReactNode) */
  icon?: React.ReactNode;
  /** Optional custom className */
  className?: string;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom children (e.g., chart preview) */
  children?: React.ReactNode;
}

/**
 * Reusable placeholder for future features.
 * When disabled: shows “Coming Soon” overlay and tooltip.
 * When enabled: renders children or a simple “Open” button.
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  flag,
  title,
  description,
  icon,
  className = '',
  size = 'md',
  children,
}) => {
  return (
    <ComingSoonCard
      flag={flag}
      title={title}
      description={description}
      icon={icon}
      className={className}
      size={size}
    >
      {children ?? (
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      )}
    </ComingSoonCard>
  );
};
