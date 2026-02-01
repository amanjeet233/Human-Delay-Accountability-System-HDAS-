"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/guards';
import { hasRole } from '@/lib/auth';

type AssignmentItem = {
  assignmentId: string;
  requestId: string;
  requestTitle: string;
  role?: string;
  status: string;
  assignedAt?: string;
  startedAt?: string;
  allowedDurationSeconds?: number;
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

export default function TasksPage() {
  // Role guard: require any staff role
  useAuthGuard();
  const router = useRouter();
  const [items, setItems] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionByAssignment, setActionByAssignment] = useState<Record<string, 'APPROVE' | 'REJECT'>>({});
  const [notesByAssignment, setNotesByAssignment] = useState<Record<string, string>>({});

  useEffect(() => {
    // If user lacks staff role, redirect to dashboard
    if (!(hasRole('CLERK') || hasRole('SECTION_OFFICER') || hasRole('HOD'))) {
      router.push('/dashboard');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams({ status: statusFilter || '', page: String(page), size: String(size) }).toString();
        const res = await api.get(`/requests/assignments/my?${qs}`);
        setItems((res?.content || []) as AssignmentItem[]);
        setTotalPages(res?.totalPages || 0);
        setTotalElements(res?.totalElements || 0);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, [router, statusFilter, page, size]);

  // Small ticker to update countdowns every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">My Assigned Tasks</h1>
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
                  <tr key={it.assignmentId} className="border-b border-border hover:bg-muted/40">
                    <td className="py-3 pr-4 text-heading">
                      <button className="underline hover:text-primary" onClick={() => router.push(`/requests/${it.requestId}/timeline`)}>
                        {it.requestTitle}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-subtext">{it.role || '-'}</td>
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
                        {it.status === 'PENDING' && (
                          <button
                            className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                            onClick={async () => { try { await api.post(`/requests/assignments/${it.assignmentId}/start`, {}); setStatusFilter(statusFilter); } catch {} }}
                          >Start</button>
                        )}
                        {it.status === 'IN_PROGRESS' && (
                          <>
                            <select
                              className="border border-border rounded-md text-xs bg-background px-2 py-1"
                              value={actionByAssignment[it.assignmentId] || 'APPROVE'}
                              title="Completion action"
                              onChange={(e) => setActionByAssignment((m) => ({ ...m, [it.assignmentId]: (e.target.value as any) }))}
                            >
                              <option value="APPROVE">Approve</option>
                              <option value="REJECT">Reject</option>
                            </select>
                            <input
                              className="border border-border rounded-md text-xs bg-background px-2 py-1"
                              placeholder="Notes"
                              value={notesByAssignment[it.assignmentId] || ''}
                              onChange={(e) => setNotesByAssignment((m) => ({ ...m, [it.assignmentId]: e.target.value }))}
                            />
                            <button
                              className="px-3 py-1.5 rounded-md bg-primary text-white text-xs hover:bg-primary/90"
                              onClick={async () => {
                                const action = actionByAssignment[it.assignmentId] || 'APPROVE';
                                const notes = notesByAssignment[it.assignmentId] || (action === 'APPROVE' ? 'Completed' : 'Rejected');
                                try {
                                  await api.post(`/requests/assignments/${it.assignmentId}/complete`, { action, notes });
                                  setStatusFilter(statusFilter);
                                } catch {}
                              }}
                            >Complete</button>
                          </>
                        )}
                        <button
                          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                          onClick={() => router.push(`/requests/${it.requestId}/forward`)}
                        >Forward</button>
                        {hasRole('AUDITOR') && <DelayJustifyButton assignmentId={it.assignmentId} />}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-subtext">No assignments found.</td>
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
        )}
      </div>
    </div>
  );
}

function DelayJustifyButton({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delays, setDelays] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/requests/assignments/${assignmentId}/delays`);
        setDelays(res || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load delays');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, assignmentId]);

  async function submitJustification() {
    try {
      setLoading(true);
      if (!delays || delays.length === 0) {
        setError('No delay found to justify yet.');
        setLoading(false);
        return;
      }
      const delayId = delays[0]?.id;
      await api.post(`/compliance/delays/${delayId}/justify`, { justificationText: text });
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit justification');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
        onClick={() => setOpen(true)}
      >Justify Delay</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="glass-card w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-heading font-semibold text-sm">Delay Justification</h3>
              <button className="text-subtext hover:text-heading" onClick={() => setOpen(false)}>Close</button>
            </div>
            {loading && <div className="text-subtext text-xs">Loading...</div>}
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            {!loading && (
              <>
                <textarea
                  className="w-full border border-border rounded-md text-sm bg-background px-2 py-1 mb-2"
                  placeholder="Enter justification"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="px-3 py-1.5 rounded-md bg-primary text-white text-xs hover:bg-primary/90"
                  onClick={submitJustification}
                >Submit</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
