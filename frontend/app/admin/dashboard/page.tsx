"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getDashboardPath } from '@/lib/roleAccess';

type SystemOverview = {
  totalRequests?: number;
  activeDelayed?: number;
  averageDelayByRole?: Array<{ role: string; avgDays: number }>;
  slaBreachCount?: number;
  escalationsToday?: number;
  trend?: Array<{ month: string; value: number }>; // optional
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await api.getMe();
        if (!user?.role || user.role !== 'ADMIN') {
          const target = getDashboardPath(user?.role);
          router.replace(target);
          return;
        }
        setMe({ id: user.id, role: user.role });
      } catch {
        router.replace('/login');
        return;
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/system-overview');
        setOverview(res || {});
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin overview');
      } finally {
        setLoading(false);
      }
    })();
  }, [me]);

  const avgDelay = useMemo(() => overview?.averageDelayByRole || [], [overview]);
  const maxAvg = useMemo(() => (avgDelay.length > 0 ? Math.max(...avgDelay.map((x) => Number(x.avgDays || 0))) : 0), [avgDelay]);

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">Admin Dashboard</h1>
      </div>
      {loading && <div className="glass-card p-6 text-subtext">Loading...</div>}
      {error && <div className="glass-card p-6 text-red-600 text-sm">{error}</div>}
      {!loading && !error && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="glass-card p-4">
              <div className="text-subtext text-xs">Total Requests</div>
              <div className="text-2xl font-semibold text-heading">{overview?.totalRequests ?? '—'}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-subtext text-xs">Active Delayed</div>
              <div className="text-2xl font-semibold text-heading">{overview?.activeDelayed ?? '—'}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-subtext text-xs">SLA Breaches</div>
              <div className="text-2xl font-semibold text-heading">{overview?.slaBreachCount ?? '—'}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-subtext text-xs">Escalations Today</div>
              <div className="text-2xl font-semibold text-heading">{overview?.escalationsToday ?? '—'}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-subtext text-xs">Avg Delay Roles</div>
              <div className="text-2xl font-semibold text-heading">{avgDelay.length > 0 ? avgDelay.length : '—'}</div>
            </div>
          </div>

          {/* Average delay per role chart (renders only if data exists) */}
          {avgDelay.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h2 className="text-heading font-semibold mb-3 text-sm">Average Delay by Role (days)</h2>
              <div className="space-y-2">
                {avgDelay.map((x) => {
                  const v = Number(x.avgDays || 0);
                  const ratio = maxAvg > 0 ? v / maxAvg : 0;
                  const width = Math.max(0.1, Math.min(1, ratio)) * 100; // percent
                  const color = v >= 10 ? 'bg-red-600' : v >= 5 ? 'bg-orange-500' : 'bg-green-600';
                  return (
                    <div key={x.role} className="flex items-center gap-3">
                      <div className="w-36 text-subtext text-xs">{x.role}</div>
                      <div className="flex-1 h-3 bg-muted rounded">
                        <div className={`h-3 rounded ${color}`} style={{ width: `${width}%` }} />
                      </div>
                      <div className="w-12 text-heading text-xs text-right">{v.toFixed(1)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
