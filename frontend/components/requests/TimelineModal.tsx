"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RequestTimeline from '@/components/requests/RequestTimeline';

type TimelineItem = {
  timestamp: string;
  eventType: string;
  description: string;
  user: string;
};

type TimelineResponse = {
  requestId: string;
  totalDaysDelayed?: number;
  daysByRole?: Record<string, number>;
  items?: TimelineItem[];
};

type Props = {
  requestId: string;
  open: boolean;
  onClose: () => void;
};

export default function TimelineModal({ requestId, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/requests/${requestId}/timeline`);
        setData(res);
      } catch (e: any) {
        setError(e?.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, requestId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="glass-card w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-heading">Request Timeline</h3>
          <button className="text-subtext hover:text-heading" onClick={onClose}>Close</button>
        </div>
        {loading && <div className="text-subtext">Loading timeline...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {!loading && !error && data && (
          <div className="space-y-4">
            {typeof (data as any).totalDaysDelayed === 'number' && (
              <div className="text-sm text-subtext">Total delayed days: <span className="font-medium text-heading">{(data as any).totalDaysDelayed}</span></div>
            )}
            <RequestTimeline
              data={{
                items: (data as any).items || [],
                delays: (data as any).delays || [],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
