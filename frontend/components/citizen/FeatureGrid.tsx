'use client';

import React from 'react';
import { FeatureCard } from '../FeatureCard';

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        flag="citizenRequestFilters"
        title="Request Filters"
        description="Advanced search and filters for your submitted requests."
        icon={<span className="text-2xl">🔍</span>}
      />
      <FeatureCard
        flag="citizenRequestDetail"
        title="Request Detail View"
        description="Detailed view of request progress and documents."
        icon={<span className="text-2xl">📄</span>}
      />
      <FeatureCard
        flag="citizenNotificationSystem"
        title="Notifications"
        description="Receive updates and alerts for your requests."
        icon={<span className="text-2xl">🔔</span>}
      />
    </div>
  );
};
