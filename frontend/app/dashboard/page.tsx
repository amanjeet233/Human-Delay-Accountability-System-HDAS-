'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, FileText, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useUser } from '@/lib/userContext';

const NetWorthChart = dynamic(() => import('@/components/charts/NetWorthChart'), { ssr: false });
const RadialGauge = dynamic(() => import('@/components/charts/RadialGauge'), { ssr: false });
const DonutChart = dynamic(() => import('@/components/charts/DonutChart'), { ssr: false });
const LineChartComponent = dynamic(() => import('@/components/charts/LineChartComponent'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [me, setMe] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [trendData, setTrendData] = useState<Array<{ month: string; value: number }>>([]);
  const [distributionData, setDistributionData] = useState<Array<{ name: string; value: number }>>([]);
  const [healthScore, setHealthScore] = useState<number | undefined>(undefined);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  // Memoize chart props to avoid re-renders when unrelated state changes
  const trendChartData = useMemo(() => trendData, [trendData]);
  const distributionChartData = useMemo(() => distributionData, [distributionData]);
  const healthGaugeValue = useMemo(() => healthScore, [healthScore]);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        setLoading(true);
        const current = user;
        if (!current?.role) {
          router.replace('/login');
          return;
        }
        setMe(current);
        // Load dashboard data AFTER initial render.
        await loadDashboard(current.role.toLowerCase());
      } catch (e) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router, user]);

  const loadDashboard = async (role: string) => {
    try {
      setError('');
      if (role === 'admin') {
        const analytics = await api.get('/admin/analytics');
        if (analytics?.summary) {
          setSummary(analytics.summary);
        }
        if (Array.isArray(analytics?.monthlyTrends)) {
          const mapped = analytics.monthlyTrends.map((x: any) => ({ month: x.month, value: x.value }));
          setTrendData(mapped);
        }
        if (Array.isArray(analytics?.roleDistribution)) {
          const mapped = analytics.roleDistribution.map((x: any) => ({ name: x.role, value: x.count }));
          setDistributionData(mapped);
        }
        if (typeof analytics?.healthScore === 'number') {
          setHealthScore(analytics.healthScore);
        }
      } else if (role === 'section_officer') {
        const so = await api.get('/so/dashboard');
        setSummary(so);
        if (Array.isArray(so?.monthlyTrend)) {
          const mapped = so.monthlyTrend.map((x: any) => ({ month: x.month, value: x.value }));
          setTrendData(mapped);
        }
      } else if (role === 'hod') {
        const hod = await api.get('/hod/dashboard');
        setSummary(hod);
      } else if (role === 'auditor') {
        const auditor = await api.get('/auditor/dashboard');
        setPermissions(auditor?.permissions || []);
        setActions(auditor?.actions || []);
      } else if (role === 'clerk') {
        const clerk = await api.get('/clerk/dashboard');
        setPermissions(clerk?.permissions || []);
        setActions(clerk?.actions || []);
      } else if (role === 'citizen') {
        const citizen = await api.get('/citizen/dashboard');
        setPermissions(citizen?.permissions || []);
        setActions(citizen?.actions || []);
      }
    } catch (e: any) {
      setError('Failed to load dashboard');
      console.error(e);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">Dashboard</h1>
              <p className="text-subtext mt-1">Welcome back{me?.username ? `, ${me.username}` : ''}</p>
            </div>

            {loading ? (
              // Skeletons instead of spinner
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="card-stat animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-xl mb-4" />
                    <div className="h-6 w-24 bg-muted rounded-md" />
                    <div className="h-4 w-32 bg-muted rounded-md mt-2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="glass-card p-6 mb-8 text-red-700 bg-red-50">{error}</div>
            ) : (
              <>
                {summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {typeof summary.totalRequests === 'number' && (
                      <div className="card-stat">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-heading">{summary.totalRequests}</h3>
                        <p className="text-sm text-subtext mt-1">Total Requests</p>
                      </div>
                    )}
                    {typeof summary.pending === 'number' && (
                      <div className="card-stat">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-heading">{summary.pending}</h3>
                        <p className="text-sm text-subtext mt-1">Pending</p>
                      </div>
                    )}
                    {typeof summary.inProgress === 'number' && (
                      <div className="card-stat">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-heading">{summary.inProgress}</h3>
                        <p className="text-sm text-subtext mt-1">In Progress</p>
                      </div>
                    )}
                    {typeof summary.delayed === 'number' && (
                      <div className="card-stat">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-heading">{summary.delayed}</h3>
                        <p className="text-sm text-subtext mt-1">Delayed</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Admin-only analytics charts; render only when data is present */}
            {me?.role?.toLowerCase() === 'admin' && (
              <>
                {(trendData.length > 0 || typeof healthScore === 'number') && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {trendChartData.length > 0 && (
                      <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-heading">Performance Trend</h3>
                            <p className="text-sm text-subtext">Monthly overview</p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-64">
                          <NetWorthChart data={trendChartData} />
                        </div>
                      </div>
                    )}
                    {typeof healthGaugeValue === 'number' && (
                      <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-heading">System Health</h3>
                            <p className="text-sm text-subtext">Overall status</p>
                          </div>
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-64">
                          <RadialGauge value={healthGaugeValue} label="Health Score" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(distributionChartData.length > 0 || trendChartData.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {distributionChartData.length > 0 && (
                      <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-heading">Request Distribution</h3>
                            <p className="text-sm text-subtext">By category</p>
                          </div>
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-64">
                          <DonutChart data={distributionChartData} />
                        </div>
                      </div>
                    )}
                    {trendChartData.length > 0 && (
                      <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-heading">Growth Metrics</h3>
                            <p className="text-sm text-subtext">6 month trend</p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-64">
                          <LineChartComponent data={trendChartData} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Generic dashboard content for roles without numeric metrics */}
            {permissions.length > 0 || actions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-heading mb-4">Permissions</h3>
                  {permissions.length === 0 ? (
                    <p className="text-subtext text-sm">No permissions available</p>
                  ) : (
                    <ul className="space-y-2">
                      {permissions.map((p, i) => (
                        <li key={i} className="text-sm text-subtext">{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-heading mb-4">Quick Actions</h3>
                  {actions.length === 0 ? (
                    <p className="text-subtext text-sm">No actions available</p>
                  ) : (
                    <ul className="space-y-2">
                      {actions.map((a, i) => (
                        <li key={i} className="text-sm text-subtext">{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
      </div>
    </div>
  );
}
