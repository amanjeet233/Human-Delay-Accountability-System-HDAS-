"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthGuard } from '@/lib/guards';
import { hasRole } from '@/lib/auth';

export default function ForwardPage({ params }: { params: { id: string } }) {
  useAuthGuard();
  const router = useRouter();
  const { id } = params;

  // Restrict to staff/admin
  if (!(hasRole('CLERK') || hasRole('SECTION_OFFICER') || hasRole('HOD') || hasRole('ADMIN'))) {
    router.push('/dashboard');
  }

  const [targetRole, setTargetRole] = useState('SECTION_OFFICER');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>(['SECTION_OFFICER','HOD','ADMIN']);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/requests/${id}/forward/options`);
        const fetched = (res?.roles || []) as string[];
        if (fetched.length > 0) {
          setRoles(fetched);
          setTargetRole(fetched[0]);
        }
      } catch {}
    })();
  }, [id]);

  async function submitForward() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await api.post(`/requests/${id}/forward`, { targetRole, remarks });
      setSuccess('Request forwarded successfully');
      setTimeout(() => router.push('/tasks'), 800);
    } catch (e: any) {
      setError(e?.message || 'Failed to forward request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-heading">Forward Request</h1>
        <button className="text-sm text-subtext hover:text-heading underline" onClick={() => router.back()}>Back</button>
      </div>
      <div className="glass-card p-6 max-w-xl">
        <label className="block text-sm text-subtext mb-2">Target Role</label>
            <select
          className="w-full border border-border rounded-md text-sm bg-background px-2 py-2 mb-3"
          value={targetRole}
              title="Target role"
          onChange={(e) => setTargetRole(e.target.value)}
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r.replace('_',' ')}</option>
          ))}
        </select>
        <label className="block text-sm text-subtext mb-2">Remarks</label>
        <textarea
          className="w-full border border-border rounded-md text-sm bg-background px-2 py-2 mb-4"
          placeholder="Add remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-3">{success}</div>}
        <button
          className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary/90"
          disabled={loading}
          onClick={submitForward}
        >{loading ? 'Forwarding...' : 'Forward'}</button>
      </div>
    </div>
  );
}
