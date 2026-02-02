"use client";
import React, { useMemo } from 'react';

type TimelineEvent = {
  timestamp: string; // ISO
  eventType?: string;
  description?: string;
  role?: string; // Role name
  officerName?: string; // Human-readable officer name
  assignedRole?: string; // Fallback
  assignedUserId?: string; // Fallback UUID
  daysSpent?: number;
  delayReason?: string;
  escalated?: boolean;
  slaStatus?: 'WITHIN' | 'NEAR' | 'BREACHED';
};

export type RequestTimelineData = {
  items?: TimelineEvent[];
};

type Props = {
  data: RequestTimelineData;
  resolveUserName?: (userId?: string) => string | undefined;
  roleLabel?: (role?: string) => string;
};

function statusColorClass(ev: TimelineEvent): string {
  // Prefer explicit SLA status from backend
  switch (ev.slaStatus) {
    case 'WITHIN':
      return 'bg-green-500';
    case 'NEAR':
      return 'bg-yellow-400';
    case 'BREACHED':
      return 'bg-red-500';
  }
  const type = (ev.eventType || '').toUpperCase();
  if (type.includes('SLA_BREACHED')) return 'bg-red-500';
  if (type.includes('SLA_WARNING') || type.includes('SLA_NEAR')) return 'bg-yellow-400';
  return 'bg-green-500';
}

export default function RequestTimeline({ data, resolveUserName, roleLabel }: Props) {
  const entries = useMemo(() => {
    const statusEntries = (data.items || []).map((s) => ({
      ts: new Date(s.timestamp).getTime(),
      payload: s,
    }));
    return statusEntries.sort((a, b) => a.ts - b.ts);
  }, [data]);

  const roleText = (r?: string) => {
    if (!r) return '-';
    return roleLabel ? roleLabel(r) : r.replace('_', ' ');
  };

  const officerText = (ev: TimelineEvent) => {
    if (ev.officerName) return ev.officerName;
    const id = ev.assignedUserId;
    return resolveUserName?.(id) || (id ? `${id.substring(0, 8)}…` : '-');
  };

  const stepTitle = (ev: TimelineEvent) => {
    // Use description or eventType as the title
    return ev.description || ev.eventType || 'Status Update';
  };

  const isEscalated = (ev: TimelineEvent) => {
    if (typeof ev.escalated === 'boolean') return ev.escalated;
    const type = (ev.eventType || '').toUpperCase();
    const desc = (ev.description || '').toUpperCase();
    return type.includes('ESCALATE') || desc.includes('ESCALATE');
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" aria-hidden />
      <ul className="space-y-4">
        {entries.map((e, idx) => {
          const s = e.payload as TimelineEvent;
          const color = statusColorClass(s);
          return (
            <li key={idx} className="flex items-start gap-3">
              <span className={`mt-1 w-2 h-2 rounded-full ${color} relative left-2`} />
              <div className="flex-1">
                <div className="text-xs text-subtext">{new Date(s.timestamp).toLocaleString()}</div>
                <div className="text-sm text-heading">
                  <span className="font-medium">{stepTitle(s)}</span>
                  {isEscalated(s) && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-red-100 text-red-700 border border-red-200">Escalated</span>
                  )}
                </div>
                <div className="text-xs text-subtext">
                  Role: <span className="font-medium">{roleText(s.role || s.assignedRole)}</span> · Officer: <span className="font-medium">{officerText(s)}</span>
                </div>
                {typeof s.daysSpent === 'number' && (
                  <div className="text-xs text-subtext">Days spent: <span className="font-medium text-heading">{s.daysSpent}</span></div>
                )}
                {s.delayReason && (
                  <div className="text-xs text-subtext">Delay reason: <span className="font-medium text-heading">{s.delayReason}</span></div>
                )}
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
