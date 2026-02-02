"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getDashboardPath } from '@/lib/roleAccess';
import LineChartComponent from '@/components/charts/LineChartComponent';

type HODRequest = {
  id: string;
  title?: string;
  status: string;
  citizenName?: string;
  department?: string;
  createdAt?: string;
};

type BreachSummary = {
  totalBreaches: number;
  criticalBreaches: number;
  majorBreaches: number;
  minorBreaches: number;
  monthlyTrend?: any[];
};

export default function HODDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [requests, setRequests] = useState<HODRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<'createdAt' | 'status'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [finalQueue, setFinalQueue] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [breach, setBreach] = useState<BreachSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesByReq, setNotesByReq] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const user = await api.getMe();
        if (!user?.role || user.role !== 'HOD') {
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
        const sortParam = sortKey && sortDir ? `&sort=${encodeURIComponent(`${sortKey},${sortDir}`)}` : '';
        const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}&page=${page}&size=${size}${sortParam}` : `?page=${page}&size=${size}${sortParam}`;
        const [reqRes, breachRes, escRes, finalRes] = await Promise.all([
          api.get(`/hod/requests${qs}`),
          api.get('/hod/sla/breach-summary'),
          api.get('/hod/escalations'),
          api.get('/hod/final-approval-queue'),
        ]);
        const reqList = Array.isArray(reqRes) ? reqRes : (Array.isArray(reqRes?.content) ? reqRes.content : []);
        setRequests(reqList as HODRequest[]);
        if (reqRes && typeof reqRes === 'object') {
          setTotalPages(reqRes.totalPages ?? 0);
          setTotalElements(reqRes.totalElements ?? (Array.isArray(reqList) ? reqList.length : 0));
        } else {
          setTotalElements(Array.isArray(reqList) ? reqList.length : 0);
          setTotalPages(1);
        }
        setBreach(breachRes || null);
        setEscalations(Array.isArray(escRes) ? escRes : (Array.isArray(escRes?.content) ? escRes.content : []));
        setFinalQueue(Array.isArray(finalRes) ? finalRes : (Array.isArray(finalRes?.content) ? finalRes.content : []));
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [me, statusFilter, page, size]);

  async function approve(reqId: string) {
    try {
      const notes = notesByReq[reqId] || '';
      await api.put(`/hod/requests/${reqId}/approve`, { notes });
      const finalRes = await api.get('/hod/final-approval-queue');
      setFinalQueue(Array.isArray(finalRes) ? finalRes : (Array.isArray(finalRes?.content) ? finalRes.content : []));
    } catch (e: any) {
      setError(e?.message || 'Failed to approve request');
    }
  }

  async function reject(reqId: string) {
    try {
      const notes = notesByReq[reqId] || '';
      await api.put(`/hod/requests/${reqId}/reject`, { notes });
      const finalRes = await api.get('/hod/final-approval-queue');
      setFinalQueue(Array.isArray(finalRes) ? finalRes : (Array.isArray(finalRes?.content) ? finalRes.content : []));
    } catch (e: any) {
      setError(e?.message || 'Failed to reject request');
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">HOD Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="text-subtext text-xs">Total Breaches</div>
          <div className="text-2xl font-semibold text-heading">{breach?.totalBreaches ?? '—'}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-subtext text-xs">Critical</div>
          <div className="text-2xl font-semibold text-heading">{breach?.criticalBreaches ?? '—'}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-subtext text-xs">Major / Minor</div>
          <div className="text-2xl font-semibold text-heading">{breach ? `${breach.majorBreaches} / ${breach.minorBreaches}` : '—'}</div>
        </div>
      </div>
      {/* Trend chart */}
      <div className="glass-card p-4 mb-6">
        <h2 className="text-heading font-semibold mb-3 text-sm">Monthly Breach Trend</h2>
        <div className="h-40">
          <LineChartComponent
            data={
              (breach?.monthlyTrend || []).map((x: any) => ({
                month: (x.month ?? x.label ?? '').toString(),
                value: Number(x.value ?? x.count ?? 0),
              }))
            }
          />
        </div>
      </div>

      {loading && <div className="text-subtext">Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Department-wide request list */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-heading font-semibold mb-3 text-sm">Department Requests</h2>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-subtext">Status:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={statusFilter}
              title="Filter by status"
              onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </label>
          <label className="text-sm text-subtext">Sort by:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={sortKey}
              title="Sort key"
              onChange={(e) => { setPage(0); setSortKey(e.target.value as 'createdAt' | 'status'); }}
            >
              <option value="createdAt">Created</option>
              <option value="status">Status</option>
            </select>
          </label>
          <label className="text-sm text-subtext">Direction:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={sortDir}
              title="Sort direction"
              onChange={(e) => { setPage(0); setSortDir(e.target.value as 'asc' | 'desc'); }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>
          <label className="text-sm text-subtext">Page size:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={size}
              title="Page size"
              onChange={(e) => { setPage(0); setSize(parseInt(e.target.value, 10)); }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button
            className="ml-auto px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
            title="Export current page to CSV"
            onClick={() => {
              try {
                const headers = ['id','title','citizenName','status','createdAt'];
                const rows = requests.map(r => [
                  (r.id ?? '').toString(),
                  (r.title ?? '').toString(),
                  (r.citizenName ?? '').toString(),
                  (r.status ?? '').toString(),
                  r.createdAt ? new Date(r.createdAt).toISOString() : ''
                ]);
                const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${(v || '').replace(/"/g,'""')}"`).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'hod-requests.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (e) {
                // ignore
              }
            }}
          >Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-subtext border-b border-border">
                <th className="py-3 pr-4">Request</th>
                <th className="py-3 pr-4">Citizen</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Created</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((it) => (
                <tr key={it.id} className="border-b border-border hover:bg-muted/40">
                  <td className="py-3 pr-4 text-heading">
                    <button className="underline hover:text-primary" onClick={() => router.push(`/requests/${it.id}/timeline`)}>
                      {it.title || it.id}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-subtext">{it.citizenName || '—'}</td>
                  <td className="py-3 pr-4 text-subtext">{it.status}</td>
                  <td className="py-3 pr-4 text-subtext">{it.createdAt ? new Date(it.createdAt).toLocaleString() : '—'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                        onClick={() => router.push(`/requests/${it.id}/timeline`)}
                      >View Timeline</button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-subtext">No department requests.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="text-subtext">Total: {totalElements}</div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >Prev</button>
              <span className="text-subtext">Page {page + 1} / {Math.max(1, totalPages)}</span>
              <button
                className="px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Escalated requests */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-heading font-semibold mb-3 text-sm">Escalated Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-subtext border-b border-border">
                <th className="py-3 pr-4">Request</th>
                <th className="py-3 pr-4">Level</th>
                <th className="py-3 pr-4">Reason</th>
                <th className="py-3 pr-4">Raised At</th>
              </tr>
            </thead>
            <tbody>
              {escalations.map((e: any) => (
                <tr key={e.id} className="border-b border-border hover:bg-muted/40">
                  <td className="py-3 pr-4 text-heading">
                    <button className="underline hover:text-primary" onClick={() => router.push(`/requests/${e.requestId}/timeline`)}>
                      {e.requestId}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-subtext">{e.level || '—'}</td>
                  <td className="py-3 pr-4 text-subtext">{e.reason || '—'}</td>
                  <td className="py-3 pr-4 text-subtext">{e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {escalations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-subtext">No escalations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final approval queue */}
      <div className="glass-card p-6">
        <h2 className="text-heading font-semibold mb-3 text-sm">Final Approval Queue</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-subtext border-b border-border">
                <th className="py-3 pr-4">Request</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Notes</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {finalQueue.map((it: any) => (
                <tr key={it.id || it.requestId} className="border-b border-border hover:bg-muted/40">
                  <td className="py-3 pr-4 text-heading">
                    <button className="underline hover:text-primary" onClick={() => router.push(`/requests/${(it.id || it.requestId)}/timeline`)}>
                      {it.title || it.id || it.requestId}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-subtext">{it.status || 'PENDING'}</td>
                  <td className="py-3 pr-4">
                    <input
                      className="border border-border rounded-md text-xs bg-background px-2 py-1"
                      placeholder="Notes"
                      value={notesByReq[it.id || it.requestId] || ''}
                      onChange={(e) => setNotesByReq((m) => ({ ...m, [it.id || it.requestId]: e.target.value }))}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md bg-primary text-white text-xs hover:bg-primary/90"
                        onClick={() => approve(it.id || it.requestId)}
                      >Approve</button>
                      <button
                        className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                        onClick={() => reject(it.id || it.requestId)}
                      >Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {finalQueue.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-subtext">No requests awaiting final approval.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
