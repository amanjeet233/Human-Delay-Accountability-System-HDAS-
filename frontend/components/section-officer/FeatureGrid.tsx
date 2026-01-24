'use client';

import React from 'react';
import { FeatureCard } from '../FeatureCard';

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        flag="soQueueEnhancements"
        title="Enhanced Review Queue"
        description="Advanced sorting, filtering, and bulk actions for the review queue."
        icon={<span className="text-2xl">📋</span>}
      />
      <FeatureCard
        flag="soEscalationAlerts"
        title="Escalation Alerts"
        description="Real-time alerts for SLA breaches and escalations."
        icon={<span className="text-2xl">⚠️</span>}
      />
    </div>
  );
};
