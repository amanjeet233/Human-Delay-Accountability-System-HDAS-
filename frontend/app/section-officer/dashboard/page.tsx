"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getDashboardPath } from '@/lib/roleAccess';

type SORequest = {
  id: string;
  title?: string;
  status: string;
  citizenName?: string;
  submittedAt?: string;
  startedAt?: string; // for SLA countdown
  allowedDurationSeconds?: number; // SLA window
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
  const ratio = remaining / allowed;
  if (ratio > 0.5) return 'text-green-600';
  if (ratio > 0.2) return 'text-yellow-600';
  return 'text-orange-600';
}

export default function SectionOfficerDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [items, setItems] = useState<SORequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesByReq, setNotesByReq] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const user = await api.getMe();
        if (!user?.role || user.role !== 'SECTION_OFFICER') {
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
        // Prefer review queue (forwarded by clerks), fallback to general requests
        let res: any;
        try {
          res = await api.get('/so/review-queue');
        } catch (e) {
          res = await api.get('/so/requests');
        }
        const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
        setItems(list as SORequest[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    })();
  }, [me]);

  // Tick for SLA countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function forwardToHOD(reqId: string) {
    try {
      const notes = notesByReq[reqId] || '';
      await api.put(`/so/requests/${reqId}/forward`, { to: 'HOD', notes });
      const res = await api.get('/so/review-queue');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
      setItems(list as SORequest[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to forward to HOD');
    }
  }

  async function sendBackToClerk(reqId: string) {
    try {
      const notes = notesByReq[reqId] || '';
      await api.put(`/so/requests/${reqId}/forward`, { to: 'CLERK', notes });
      const res = await api.get('/so/review-queue');
      const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
      setItems(list as SORequest[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to send back to Clerk');
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">Section Officer Dashboard</h1>
        <button
          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
          title="Export current queue to CSV"
          onClick={() => {
            try {
              const headers = ['id','title','citizenName','status','submittedAt'];
              const rows = items.map(r => [
                (r.id ?? '').toString(),
                (r.title ?? '').toString(),
                (r.citizenName ?? '').toString(),
                (r.status ?? '').toString(),
                r.submittedAt ? new Date(r.submittedAt).toISOString() : ''
              ]);
              const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${(v || '').replace(/"/g,'""')}"`).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'so-review-queue.csv';
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
      <div className="glass-card p-6">
        {loading && <div className="text-subtext">Loading...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-subtext border-b border-border">
                  <th className="py-3 pr-4">Request</th>
                  <th className="py-3 pr-4">Citizen</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Submitted</th>
                  <th className="py-3 pr-4">SLA</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-border hover:bg-muted/40">
                    <td className="py-3 pr-4 text-heading">
                      <button className="underline hover:text-primary" onClick={() => router.push(`/requests/${it.id}/timeline`)}>
                        {it.title || it.id}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-subtext">{it.citizenName || '—'}</td>
                    <td className="py-3 pr-4 text-subtext">{it.status}</td>
                    <td className="py-3 pr-4 text-subtext">{it.submittedAt ? new Date(it.submittedAt).toLocaleString() : '—'}</td>
                    <td className="py-3 pr-4"><span className={`${slaClass(it.startedAt, it.allowedDurationSeconds)} font-medium`}>{formatCountdown(it.startedAt, it.allowedDurationSeconds)}</span></td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <input
                          className="border border-border rounded-md text-xs bg-background px-2 py-1"
                          placeholder="Notes"
                          value={notesByReq[it.id] || ''}
                          onChange={(e) => setNotesByReq((m) => ({ ...m, [it.id]: e.target.value }))}
                        />
                        <button
                          className="px-3 py-1.5 rounded-md bg-primary text-white text-xs hover:bg-primary/90"
                          onClick={() => forwardToHOD(it.id)}
                        >Forward to HOD</button>
                        <button
                          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                          onClick={() => sendBackToClerk(it.id)}
                        >Send back to Clerk</button>
                        <button
                          className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                          onClick={() => router.push(`/requests/${it.id}/timeline`)}
                        >View Timeline</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-subtext">No requests in review queue.</td>
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
