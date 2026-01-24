'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, SystemRole } from '@/lib';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminKPICards from '@/components/admin/AdminKPICards';
import AdminCharts from '@/components/admin/AdminCharts';
import RequestSlider from '@/components/admin/RequestSlider';
import AllTasksTable from '@/components/admin/AllTasksTable';
import QuickActionCards from '@/components/admin/QuickActionCards';
import { FeatureGrid } from '@/components/admin/FeatureGrid';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    delayedRequests: 0,
    escalatedRequests: 0,
    onTimePercentage: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.ADMIN)) {
      router.replace('/unauthorized');
      return;
    }
  }, [isAuthenticated, canAccessDashboard, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadDashboardData = async () => {
      try {
        // TODO: Wire real API calls once endpoints are ready
        setTimeout(() => {
          setKpiData({
            totalRequests: 1247,
            pendingRequests: 89,
            inProgressRequests: 156,
            delayedRequests: 23,
            escalatedRequests: 8,
            onTimePercentage: 92.4,
          });
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated]);

  if (!isAuthenticated || !canAccessDashboard(SystemRole.ADMIN)) {
    return null;
  }

  return (
    <AdminLayout
      userId={user?.username ?? 'ADMIN'}
      userName={user?.username ?? 'Administrator'}
      department="District Collector Office"
      currentPage="Dashboard"
    >
      <div className="space-y-8">
        {/* KPI Cards Section */}
        <section>
          <AdminKPICards
            totalRequests={kpiData.totalRequests}
            pendingRequests={kpiData.pendingRequests}
            inProgressRequests={kpiData.inProgressRequests}
            delayedRequests={kpiData.delayedRequests}
            escalatedRequests={kpiData.escalatedRequests}
            onTimePercentage={kpiData.onTimePercentage}
            loading={loading}
          />
        </section>

        {/* Charts Section */}
        <section>
          <AdminCharts loading={loading} />
        </section>

        {/* Request Slider Section */}
        <section>
          <RequestSlider requests={[]} loading={loading} />
        </section>

        {/* All Tasks Table Section */}
        <section>
          <AllTasksTable tasks={[]} loading={loading} />
        </section>

        {/* Quick Actions Section */}
        <section>
          <QuickActionCards loading={loading} />
        </section>

        {/* Future Features Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Future Features</h2>
          <FeatureGrid />
        </section>
      </div>
    </AdminLayout>
  );
}
