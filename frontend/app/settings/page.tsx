'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { isAuthenticated, hasRole } from '@/lib/auth';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get('/admin/dashboard');
        setMessage(data?.message || null);
        setPermissions(Array.isArray(data?.permissions) ? data.permissions : []);
        setActions(Array.isArray(data?.actions) ? data.actions : []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">System Settings</h1>
              <p className="text-subtext mt-1">Admin dashboard configuration</p>
            </div>

            {loading ? (
              <p className="text-subtext">Loading settings...</p>
            ) : error ? (
              <div className="glass-card p-6 border border-red-500/30">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {message ? (
                  <div className="glass-card p-6">
                    <p className="text-sm text-subtext">Message</p>
                    <p className="text-heading font-medium">{message}</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-heading mb-4">Permissions</h3>
                    {permissions.length === 0 ? (
                      <p className="text-subtext text-sm">No permissions available</p>
                    ) : (
                      <ul className="space-y-2">
                        {permissions.map((p, i) => (
                          <li key={i} className="text-sm text-subtext">{p}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-heading mb-4">Actions</h3>
                    {actions.length === 0 ? (
                      <p className="text-subtext text-sm">No actions available</p>
                    ) : (
                      <ul className="space-y-2">
                        {actions.map((a, i) => (
                          <li key={i} className="text-sm text-subtext">{a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
