"use client";
import React, { useMemo } from 'react';

type AssignedRole = 'CLERK' | 'SO' | 'HOD' | string;

type StatusHistoryItem = {
  timestamp: string; // ISO
  previousStatus?: string;
  newStatus?: string;
  assignedRole?: AssignedRole;
  assignedUserId?: string; // UUID
  remarks?: string;
  daysSpent?: number;
};

type DelaySummaryItem = {
  detectedAt: string; // ISO
  reason?: string;
  reasonCategory?: string;
  delayDays: number;
  justified?: boolean;
};

export type RequestTimelineData = {
  items?: StatusHistoryItem[];
  delays?: DelaySummaryItem[];
};

type Props = {
  data: RequestTimelineData;
  resolveUserName?: (userId?: string) => string | undefined;
  roleLabel?: (role?: string) => string;
};

function delayColorClass(days: number): string {
  if (days <= 0) return 'bg-green-500';
  if (days <= 2) return 'bg-yellow-400';
  return 'bg-red-500';
}

export default function RequestTimeline({ data, resolveUserName, roleLabel }: Props) {
  const entries = useMemo(() => {
    const statusEntries = (data.items || []).map((s) => ({
      ts: new Date(s.timestamp).getTime(),
      kind: 'status' as const,
      payload: s,
    }));
    const delayEntries = (data.delays || []).map((d) => ({
      ts: new Date(d.detectedAt).getTime(),
      kind: 'delay' as const,
      payload: d,
    }));
    const all = [...statusEntries, ...delayEntries].sort((a, b) => a.ts - b.ts);
    return all;
  }, [data]);

  const roleText = (r?: string) => {
    if (!r) return '-';
    return roleLabel ? roleLabel(r) : r.replace('_', ' ');
  };

  const userText = (id?: string) => {
    return resolveUserName?.(id) || (id ? `${id.substring(0, 8)}…` : '-');
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" aria-hidden />
      <ul className="space-y-4">
        {entries.map((e, idx) => {
          if (e.kind === 'status') {
            const s = e.payload as StatusHistoryItem;
            return (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary relative left-2" />
                <div className="flex-1">
                  <div className="text-xs text-subtext">{new Date(s.timestamp).toLocaleString()}</div>
                  <div className="text-sm text-heading">
                    Status: <span className="font-medium">{s.newStatus || '-'}</span>
                  </div>
                  <div className="text-xs text-subtext">
                    Role: <span className="font-medium">{roleText(s.assignedRole)}</span> · Officer: <span className="font-medium">{userText(s.assignedUserId)}</span>
                  </div>
                  {typeof s.daysSpent === 'number' && (
                    <div className="text-xs text-subtext">Days spent: <span className="font-medium text-heading">{s.daysSpent}</span></div>
                  )}
                  {s.remarks && <div className="text-xs text-subtext">{s.remarks}</div>}
                </div>
              </li>
            );
          }
          const d = e.payload as DelaySummaryItem;
          return (
            <li key={idx} className="flex items-start gap-3">
              <span className={`mt-1 w-2 h-2 rounded-full ${delayColorClass(d.delayDays)} relative left-2`} />
              <div className="flex-1">
                <div className="text-xs text-subtext">{new Date(d.detectedAt).toLocaleString()}</div>
                <div className="text-sm text-heading">
                  Delay: <span className="font-medium">{d.reason || d.reasonCategory || 'SLA Breach'}</span>
                </div>
                <div className="text-xs text-subtext">Days delayed: <span className="font-medium text-heading">{d.delayDays}</span></div>
                {d.justified && <div className="text-xs text-green-700">Justified</div>}
              </div>
            </li>
          );
        })}
        {entries.length === 0 && (
          <li className="text-sm text-subtext">No timeline entries.</li>
        )}
      </ul>
    </div>
  );
}
