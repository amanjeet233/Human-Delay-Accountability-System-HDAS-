'use client';

import React from 'react';
import { FeatureCard } from '../FeatureCard';

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        flag="slaBreachAnalytics"
        title="SLA Breach Analytics"
        description="View and analyze SLA breach trends across departments and processes."
        icon={<span className="text-2xl">📊</span>}
      />
      <FeatureCard
        flag="adminDashboardMetrics"
        title="Admin Dashboard Metrics"
        description="Real-time metrics and KPIs for system health and usage."
        icon={<span className="text-2xl">📈</span>}
      />
      <FeatureCard
        flag="aiAssistance"
        title="AI Delay Prediction"
        description="Machine-learning powered delay risk prediction and recommendations."
        icon={<span className="text-2xl">🤖</span>}
      />
      <FeatureCard
        flag="realTimeNotifications"
        title="Real-Time Notifications"
        description="Push notifications for critical events and escalations."
        icon={<span className="text-2xl">🔔</span>}
      />
      <FeatureCard
        flag="mobileApp"
        title="Mobile App"
        description="Native mobile app for field officers and citizens."
        icon={<span className="text-2xl">📱</span>}
      />
    </div>
  );
};
