'use client';

import React from 'react';
import { FeatureCard } from '../FeatureCard';

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        flag="hodFinalDecisionWorkflow"
        title="Final Decision Workflow"
        description="Final approve/reject authority for departmental requests."
        icon={<span className="text-2xl">⚖️</span>}
      />
    </div>
  );
};
