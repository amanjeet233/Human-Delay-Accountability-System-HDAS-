import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FileText, TrendingUp, Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const NetWorthChart = dynamic(() => import('@/components/charts/NetWorthChart'), { ssr: false });
const DonutChart = dynamic(() => import('@/components/charts/DonutChart'), { ssr: false });
const LineChartComponent = dynamic(() => import('@/components/charts/LineChartComponent'), { ssr: false });

async function fetchApi(path: string) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${API_URL}/api${path}`,
    {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

export default async function ReportsPage() {
  // Determine role from backend using session cookie
  let me: any = null;
  try {
    me = await fetchApi('/auth/me');
  } catch {
    return redirect('/login');
  }
  const role = (me?.role || '').toLowerCase();

  let summary: any | null = null;
  let monthlyTrends: any[] | null = null;
  let roleDistribution: any[] | null = null;
  let hodSlaSummary: any | null = null;
  let auditLogs: any[] | null = null;

  try {
    if (role === 'admin') {
      const data = await fetchApi('/admin/analytics');
      summary = data?.summary || null;
      monthlyTrends = data?.monthlyTrends || null;
      roleDistribution = data?.roleDistribution || null;
    } else if (role === 'hod') {
      const data = await fetchApi('/hod/sla/breach-summary');
      hodSlaSummary = data || null;
      monthlyTrends = data?.monthlyTrend || null;
    } else if (role === 'auditor') {
      const logs = await fetchApi('/auditor/audit-logs');
      auditLogs = Array.isArray(logs) ? logs : null;
    } else {
      // Other roles: show empty states
    }
  } catch (e) {
    // Render error card inline; no client-side redirect in server component
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-6 border border-red-500/30">
            <p className="text-red-500">Failed to load reports</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading">Reports & Analytics</h1>
          <p className="text-subtext mt-1">Backend-driven insights by role</p>
        </div>

        <div className="space-y-8">
          {/* ADMIN analytics */}
          {summary || monthlyTrends || roleDistribution ? (
            <div className="space-y-6">
              {summary ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card p-6">
                    <p className="text-subtext text-sm">Total Requests</p>
                    <p className="text-2xl font-bold text-heading">{summary.totalRequests ?? '—'}</p>
                  </div>
                  <div className="glass-card p-6">
                    <p className="text-subtext text-sm">Delayed</p>
                    <p className="text-2xl font-bold text-heading">{summary.delayed ?? '—'}</p>
                  </div>
                  <div className="glass-card p-6">
                    <p className="text-subtext text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-heading">{summary.inProgress ?? '—'}</p>
                  </div>
                  <div className="glass-card p-6">
                    <p className="text-subtext text-sm">Pending</p>
                    <p className="text-2xl font-bold text-heading">{summary.pending ?? '—'}</p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-heading">Monthly Trends</h3>
                      <p className="text-sm text-subtext">Requests trend</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="h-64">
                    <NetWorthChart data={monthlyTrends || []} />
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-heading">Role Distribution</h3>
                      <p className="text-sm text-subtext">Share by role</p>
                    </div>
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="h-64">
                    <DonutChart data={roleDistribution || []} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* HOD SLA breach summary */}
          {hodSlaSummary ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                  <p className="text-subtext text-sm">Total Breaches</p>
                  <p className="text-2xl font-bold text-heading">{hodSlaSummary.totalBreaches ?? '—'}</p>
                </div>
                <div className="glass-card p-6">
                  <p className="text-subtext text-sm">Critical</p>
                  <p className="text-2xl font-bold text-heading">{hodSlaSummary.criticalBreaches ?? '—'}</p>
                </div>
                <div className="glass-card p-6">
                  <p className="text-subtext text-sm">Major</p>
                  <p className="text-2xl font-bold text-heading">{hodSlaSummary.majorBreaches ?? '—'}</p>
                </div>
                <div className="glass-card p-6">
                  <p className="text-subtext text-sm">Minor</p>
                  <p className="text-2xl font-bold text-heading">{hodSlaSummary.minorBreaches ?? '—'}</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">Monthly SLA Breach Trend</h3>
                    <p className="text-sm text-subtext">Trend overview</p>
                  </div>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="h-64">
                  <LineChartComponent data={monthlyTrends || []} />
                </div>
              </div>
            </div>
          ) : null}

          {/* Auditor audit logs summary */}
          {auditLogs ? (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-heading mb-4">Audit Logs</h3>
              {auditLogs.length === 0 ? (
                <p className="text-subtext text-sm">No audit logs available</p>
              ) : (
                <p className="text-subtext text-sm">Total logs: {auditLogs.length}</p>
              )}
            </div>
          ) : null}

          {/* Fallback for roles without reports */}
          {!summary && !hodSlaSummary && !auditLogs ? (
            <div className="glass-card p-6">
              <p className="text-subtext text-sm">No reports available for your role</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
