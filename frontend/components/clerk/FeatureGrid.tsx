'use client';

import React from 'react';
import { FeatureCard } from '../FeatureCard';

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        flag="clerkDelayReasonUI"
        title="Advanced Delay Reason UI"
        description="Rich UI for capturing and categorizing delay reasons."
        icon={<span className="text-2xl">📝</span>}
      />
    </div>
  );
};
