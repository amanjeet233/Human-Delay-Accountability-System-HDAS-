"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import RequestTimeline from '@/components/requests/RequestTimeline';
import { useAuthGuard } from '@/lib/guards';

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

export default function TimelinePage({ params }: { params: { id: string } }) {
  useAuthGuard('CITIZEN');
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/requests/${id}/timeline`);
        setData(res);
      } catch (e: any) {
        setError(e?.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">Request Timeline</h1>
        <button className="text-sm text-subtext hover:text-heading underline" onClick={() => router.push('/citizen')}>Back to Dashboard</button>
      </div>
      <div className="glass-card p-6">
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
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
