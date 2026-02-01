"use client";
import React, { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/common/StatusBadge';
import TimelineModal from '@/components/requests/TimelineModal';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

type RequestItem = {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  processId: string;
  assignedRole?: string;
};

export default function MyRequestsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineFor, setTimelineFor] = useState<string | null>(null);
  const [assignedRoles, setAssignedRoles] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<'createdAt,desc' | 'createdAt,asc' | 'status,asc' | 'status,desc'>('createdAt,desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  const ALLOWED_SIZES = [5, 10, 20];
  const ALLOWED_SORTS = ['createdAt,desc', 'createdAt,asc', 'status,asc', 'status,desc'];
  const ALLOWED_STATUSES = ['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
  const ALLOWED_ROLES = ['', 'CLERK', 'SECTION_OFFICER', 'HOD'];

  // Initialize state from URL query once
  useEffect(() => {
    try {
      const qpPage = parseInt(searchParams.get('page') || '0', 10);
      const qpSize = parseInt(searchParams.get('size') || '10', 10);
      const qpSort = (searchParams.get('sort') || 'createdAt,desc');
      const qpStatus = (searchParams.get('status') || '').toUpperCase();
      const qpRole = (searchParams.get('role') || '').toUpperCase();
      const qpTimeline = searchParams.get('timeline') || '';

      setPage(Number.isFinite(qpPage) && qpPage >= 0 ? qpPage : 0);
      setSize(ALLOWED_SIZES.includes(qpSize) ? qpSize : 10);
      setSort(ALLOWED_SORTS.includes(qpSort) ? (qpSort as any) : 'createdAt,desc');
      setStatusFilter(ALLOWED_STATUSES.includes(qpStatus) ? qpStatus : '');
      setRoleFilter(ALLOWED_ROLES.includes(qpRole) ? qpRole : '');
      setTimelineFor(qpTimeline || null);
    } catch {}
    setInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selections to URL for deep-linking
  useEffect(() => {
    if (!initialized) return;
    const qs = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
      status: statusFilter || '',
      role: roleFilter || '',
      timeline: timelineFor || ''
    }).toString();
    router.replace(`?${qs}`, { scroll: false });
  }, [initialized, page, size, sort, statusFilter, roleFilter, timelineFor, router]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams({
          page: String(page),
          size: String(size),
          sort,
          status: statusFilter || '',
          role: roleFilter || ''
        }).toString();
        const data = await api.get(`/requests/page?${qs}`);
        setItems((data?.items || []) as RequestItem[]);
        setTotal(data?.total || 0);
        // Fetch assigned role (best-effort) in parallel but limited
        // If backend provided assignedRole, skip timeline fetching
        if ((data?.items || []).some((d: any) => !!d.assignedRole)) {
          const roles: Record<string, string> = {};
          (data?.items || []).forEach((d: any) => {
            roles[d.id] = d.assignedRole || '-';
          });
          setAssignedRoles(roles);
          return;
        }
        const ids: string[] = (data?.items || []).map((d: any) => d.id);
        const concurrency = 3;
        let index = 0;
        const roles: Record<string, string> = {};
        async function nextBatch() {
          const batch = ids.slice(index, index + concurrency);
          index += concurrency;
          await Promise.all(batch.map(async (id) => {
            try {
              const tl = await api.get(`/requests/${id}/timeline`);
              let role = '-';
              if (tl?.items && Array.isArray(tl.items)) {
                // Find last ASSIGNED event or infer from description
                const assigned = [...tl.items].reverse().find((it: any) => (it.eventType || '').toUpperCase() === 'ASSIGNED');
                if (assigned?.description) {
                  // Try to parse role mentioned in description
                  const match = assigned.description.match(/role[:\s]+([A-Z_]+)/i);
                  role = match?.[1] || role;
                }
              }
              roles[id] = role;
            } catch {}
          }));
          if (index < ids.length) await nextBatch();
        }
        await nextBatch();
        setAssignedRoles(roles);
      } catch (e: any) {
        setError(e?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, size, sort, statusFilter, roleFilter]);

  const rows = useMemo(() => items.map((it) => {
    const created = new Date(it.createdAt);
    const now = new Date();
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
    const assignedRole = assignedRoles[it.id] || '-';
    return { ...it, daysElapsed, assignedRole };
  }), [items, assignedRoles]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-heading">My Requests</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-subtext">Status:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
          <label className="text-sm text-subtext">Role:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="CLERK">Clerk</option>
              <option value="SECTION_OFFICER">Section Officer</option>
              <option value="HOD">HOD</option>
            </select>
          </label>
          <label className="text-sm text-subtext">Sort:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="createdAt,desc">Newest</option>
              <option value="createdAt,asc">Oldest</option>
              <option value="status,asc">Status A→Z</option>
              <option value="status,desc">Status Z→A</option>
            </select>
          </label>
          <label className="text-sm text-subtext">Page Size:
            <select
              className="ml-2 border border-border rounded-md text-sm bg-background px-2 py-1"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>
      </div>
      {(statusFilter || roleFilter) && (
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {statusFilter && (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-subtext text-xs border border-border">
              Status: {statusFilter}
              <button className="hover:text-heading" onClick={() => setStatusFilter('')}>×</button>
            </span>
          )}
          {roleFilter && (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-subtext text-xs border border-border">
              Role: {roleFilter}
              <button className="hover:text-heading" onClick={() => setRoleFilter('')}>×</button>
            </span>
          )}
          <button
            className="ml-2 text-xs text-subtext hover:text-heading underline"
            onClick={() => { setStatusFilter(''); setRoleFilter(''); }}
          >Clear all</button>
        </div>
      )}
      {loading && <div className="text-subtext">Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-subtext border-b border-border">
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Assigned Role</th>
                <th className="py-3 pr-4">Days Elapsed</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-muted/40">
                  <td className="py-3 pr-4 text-heading">{row.title}</td>
                  <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                  <td className="py-3 pr-4 text-subtext">{row.assignedRole}</td>
                  <td className="py-3 pr-4 text-heading">{row.daysElapsed}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md bg-primary text-white text-xs hover:bg-primary/90"
                        onClick={() => setTimelineFor(row.id)}
                      >View Timeline</button>
                      <button
                        className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                        onClick={() => router.push(`/requests/${row.id}/timeline`)}
                      >Open Full Page</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-subtext">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-subtext">Total: {total}</div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-md border border-border text-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >Prev</button>
              <span className="text-sm text-subtext">Page {page + 1}</span>
              <button
                className="px-3 py-1.5 rounded-md border border-border text-sm"
                disabled={(page + 1) * size >= total}
                onClick={() => setPage((p) => p + 1)}
              >Next</button>
            </div>
          </div>
        </div>
      )}
      <TimelineModal requestId={timelineFor || ''} open={!!timelineFor} onClose={() => setTimelineFor(null)} />
    </div>
  );
}
