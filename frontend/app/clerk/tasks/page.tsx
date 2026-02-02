"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/lib/userContext';
import { getDashboardPath } from '@/lib/roleAccess';

type TaskItem = {
  requestId: string;
  title?: string;
  status: string;
  assignedAt?: string;
  startedAt?: string; // backend start timestamp for SLA
  allowedDurationSeconds?: number; // backend-provided SLA duration
  currentRole?: string;
  assigneeId?: string;
};

function formatCountdown(startedAt?: string, allowed?: number) {
  if (!startedAt || !allowed) return '—';
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000);
  const remaining = allowed - elapsed;
  const abs = Math.abs(remaining);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return remaining >= 0 ? `${hh}:${mm}:${ss}` : `Overdue by ${hh}:${mm}:${ss}`;
}

function slaClass(startedAt?: string, allowed?: number) {
  if (!startedAt || !allowed) return 'text-subtext';
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000);
  const remaining = allowed - elapsed;
  if (remaining < 0) return 'text-red-600';
  const ratio = remaining / allowed; // remaining fraction
  if (ratio > 0.5) return 'text-green-600';
  if (ratio > 0.2) return 'text-yellow-600';
  return 'text-orange-600';
}

function slaPercent(startedAt?: string, allowed?: number) {
  if (!startedAt || !allowed) return null;
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000);
  const pct = Math.max(0, Math.min(100, Math.floor((elapsed / allowed) * 100)));
  return pct;
}

const widthClassMap: Record<number, string> = {
  0: 'w-0',
  10: 'w-[10%]',
  20: 'w-[20%]',
  30: 'w-[30%]',
  40: 'w-[40%]',
  50: 'w-[50%]',
  60: 'w-[60%]',
  70: 'w-[70%]',
  80: 'w-[80%]',
  90: 'w-[90%]',
  100: 'w-[100%]',
};

function widthClassFromPercent(pct: number) {
  const decile = Math.min(100, Math.max(0, Math.round(pct / 10) * 10));
  return widthClassMap[decile] || 'w-0';
}

export default function ClerkTasksPage() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [items, setItems] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [forwardTargetByReq, setForwardTargetByReq] = useState<Record<string, string>>({});
  const [forwardNotesByReq, setForwardNotesByReq] = useState<Record<string, string>>({});
  const [delayReasonByReq, setDelayReasonByReq] = useState<Record<string, string>>({});

  useEffect(() => {
    // Enforce role using context; no refetch
    const u = currentUser;
    if (!u?.role) {
      router.replace('/login');
      return;
    }
    if (u.role !== 'CLERK') {
      router.replace(getDashboardPath(u.role));
      return;
    }
    setMe({ id: u.id, role: u.role });
  }, [router, currentUser]);

  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tasks/my${statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : ''}`);
        const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
        setItems(list as TaskItem[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, [me, statusFilter]);

  // Update countdown each second
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function forwardRequest(reqId: string) {
    const to = forwardTargetByReq[reqId] || '';
    const notes = forwardNotesByReq[reqId] || '';
    try {
      await api.post(`/requests/${reqId}/forward`, { to, notes });
      // Refresh
      const res = await api.get('/tasks/my');
      const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
      setItems(list as TaskItem[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to forward request');
    }
  }

  async function completeRequest(reqId: string) {
    try {
      // Clerk verify/complete per contract
      await api.put(`/clerk/${reqId}/verify`, { verification: {} });
      const res = await api.get('/tasks/my');
      const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
      setItems(list as TaskItem[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to complete request');
    }
  }

  async function addDelayReason(reqId: string) {
    const reason = delayReasonByReq[reqId] || '';
    try {
      await api.post(`/clerk/${reqId}/delay-reason`, { reason });
      setDelayReasonByReq((m) => ({ ...m, [reqId]: '' }));
    } catch (e: any) {
      setError(e?.message || 'Failed to add delay reason');
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">Clerk Task Dashboard</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-subtext">Status:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={statusFilter}
              title="Filter by status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </label>
          <button
            className="ml-2 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
            title="Export current tasks to CSV"
            onClick={() => {
              try {
                const headers = ['requestId','title','currentRole','status','assignedAt','startedAt','allowedDurationSeconds'];
                const rows = items.map(r => [
                  (r.requestId ?? '').toString(),
                  (r.title ?? '').toString(),
                  (r.currentRole ?? '').toString(),
                  (r.status ?? '').toString(),
                  r.assignedAt ? new Date(r.assignedAt).toISOString() : '',
                  r.startedAt ? new Date(r.startedAt).toISOString() : '',
                  (r.allowedDurationSeconds ?? '').toString(),
                ]);
                const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${(v || '').replace(/"/g,'""')}"`).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'clerk-tasks.csv';
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
      </div>
      <div className="glass-card p-6">
        {loading && <div className="text-subtext">Loading...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-subtext border-b border-border">
                  <th className="py-3 pr-4">Request</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Assigned</th>
                  <th className="py-3 pr-4">SLA</th>
                  <th className="py-3 pr-4">Progress</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.requestId} className="border-b border-border hover:bg-muted/40">
                    <td className="py-3 pr-4 text-heading">
                      <button className="underline hover:text-primary" onClick={() => router.push(`/requests/${it.requestId}/timeline`)}>
                        {it.title || it.requestId}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-subtext">{it.currentRole || 'CLERK'}</td>
                    <td className="py-3 pr-4 text-subtext">{it.status}</td>
                    <td className="py-3 pr-4 text-subtext">{it.assignedAt ? new Date(it.assignedAt).toLocaleString() : '—'}</td>
                    <td className="py-3 pr-4"><span className={`${slaClass(it.startedAt, it.allowedDurationSeconds)} font-medium`}>{formatCountdown(it.startedAt, it.allowedDurationSeconds)}</span></td>
                    <td className="py-3 pr-4">
                      {slaPercent(it.startedAt, it.allowedDurationSeconds) !== null && (
                        <div className="w-40 h-2 bg-muted rounded">
                          <div
                            className={`h-2 rounded ${slaClass(it.startedAt, it.allowedDurationSeconds).replace('text-','bg-')} ${widthClassFromPercent(slaPercent(it.startedAt, it.allowedDurationSeconds)!)}`}
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {/** Guard: only allow actions if assigned to current clerk (backend should already enforce) */}
                        {/** If assigneeId present and differs from me.id, disable action buttons */}
                        {/** Compute canAct inline */}
                        {/** Forward controls */}
                        <select
                          className="border border-border rounded-md text-xs bg-background px-2 py-1"
                          value={forwardTargetByReq[it.requestId] || ''}
                          title="Forward to role"
                          onChange={(e) => setForwardTargetByReq((m) => ({ ...m, [it.requestId]: e.target.value }))}
                        >
                          <option value="">Select role</option>
                          <option value="SECTION_OFFICER">Section Officer</option>
                          <option value="HOD">HOD</option>
                        </select>
                        <input
                          className="border border-border rounded-md text-xs bg-background px-2 py-1"
                          placeholder="Notes"
                          value={forwardNotesByReq[it.requestId] || ''}
                          onChange={(e) => setForwardNotesByReq((m) => ({ ...m, [it.requestId]: e.target.value }))}
                        />
                        <button
                          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                          disabled={!!(me && it.assigneeId && it.assigneeId !== me.id)}
                          onClick={() => forwardRequest(it.requestId)}
                        >Forward</button>
                        <button
                          className="px-3 py-1.5 rounded-md bg-primary text-white text-xs hover:bg-primary/90"
                          disabled={!!(me && it.assigneeId && it.assigneeId !== me.id)}
                          onClick={() => completeRequest(it.requestId)}
                        >Complete</button>
                        <input
                          className="border border-border rounded-md text-xs bg-background px-2 py-1"
                          placeholder="Delay reason"
                          value={delayReasonByReq[it.requestId] || ''}
                          onChange={(e) => setDelayReasonByReq((m) => ({ ...m, [it.requestId]: e.target.value }))}
                        />
                        <button
                          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                          disabled={!!(me && it.assigneeId && it.assigneeId !== me.id)}
                          onClick={() => addDelayReason(it.requestId)}
                        >Add Reason</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-subtext">No tasks assigned.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
