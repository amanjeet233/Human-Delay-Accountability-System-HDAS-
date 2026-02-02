'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MyRequestsTable from '@/components/tables/MyRequestsTable';
import { api } from '@/lib/api';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [processId, setProcessId] = useState('');

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const current = await api.getMe();
        if (!current?.role) {
          router.replace('/login');
          return;
        }
        if ((current.role || '').toLowerCase() !== 'citizen') {
          // Non-citizen users should not access this route
          router.replace('/dashboard');
          return;
        }
        setMe(current);
      } catch {
        router.replace('/login');
      }
    })();
  }, [router]);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      if (!title.trim() || !processId.trim()) {
        setError('Title and Service Type (Process ID) are required');
        return;
      }
      const payload = { title: title.trim(), description: description.trim(), processId: processId.trim() };
      await api.post('/citizen/requests', payload);
      setOpenCreate(false);
      setTitle('');
      setDescription('');
      setProcessId('');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to create request');
    } finally {
      setCreating(false);
    }
  };

  if (!mounted || !me) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-heading">Citizen Dashboard</h1>
                <p className="text-subtext mt-1">Welcome, {me?.username}</p>
              </div>
              <button
                className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary/90"
                onClick={() => setOpenCreate(true)}
              >Create New Request</button>
            </div>

            {/* My Requests Table */}
            <MyRequestsTable refreshKey={refreshKey} />

            {/* Create Request Modal */}
            {openCreate && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="glass-card w-full max-w-lg p-6">
                  <h3 className="text-lg font-semibold text-heading mb-4">Create New Request</h3>
                  {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
                  <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm text-subtext mb-1">Service Type (Process ID)</label>
                      <input
                        type="text"
                        className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm"
                        placeholder="e.g., 00000000-0000-0000-0000-000000000001"
                        value={processId}
                        onChange={(e) => setProcessId(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-subtext mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm"
                        placeholder="Enter request title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-subtext mb-1">Description</label>
                      <textarea
                        className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm"
                        placeholder="Optional details"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md border border-border text-sm hover:bg-muted"
                        onClick={() => { setOpenCreate(false); setError(null); }}
                      >Cancel</button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary/90"
                        disabled={creating}
                      >{creating ? 'Creating...' : 'Create'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
