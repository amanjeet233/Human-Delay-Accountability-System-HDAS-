'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import NetWorthChart from '@/components/charts/NetWorthChart';
import RadialGauge from '@/components/charts/RadialGauge';
import DonutChart from '@/components/charts/DonutChart';
import LineChartComponent from '@/components/charts/LineChartComponent';
import { isAuthenticated, getUser } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">Dashboard</h1>
              <p className="text-subtext mt-1">Welcome back, {user?.username}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card-stat">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">+12%</span>
                </div>
                <h3 className="text-2xl font-bold text-heading">1,284</h3>
                <p className="text-sm text-subtext mt-1">Total Requests</p>
              </div>

              <div className="card-stat">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">+8%</span>
                </div>
                <h3 className="text-2xl font-bold text-heading">842</h3>
                <p className="text-sm text-subtext mt-1">Active Tasks</p>
              </div>

              <div className="card-stat">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">+18%</span>
                </div>
                <h3 className="text-2xl font-bold text-heading">567</h3>
                <p className="text-sm text-subtext mt-1">Completed</p>
              </div>

              <div className="card-stat">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs text-red-600 font-medium">-5%</span>
                </div>
                <h3 className="text-2xl font-bold text-heading">23</h3>
                <p className="text-sm text-subtext mt-1">Delayed</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">Performance Trend</h3>
                    <p className="text-sm text-subtext">Monthly overview</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="h-64">
                  <NetWorthChart />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">System Health</h3>
                    <p className="text-sm text-subtext">Overall status</p>
                  </div>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="h-64">
                  <RadialGauge value={72} label="Health Score" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">Request Distribution</h3>
                    <p className="text-sm text-subtext">By category</p>
                  </div>
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="h-64">
                  <DonutChart />
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">Growth Metrics</h3>
                    <p className="text-sm text-subtext">6 month trend</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="h-64">
                  <LineChartComponent />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
