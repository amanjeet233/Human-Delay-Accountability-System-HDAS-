'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, SystemRole, apiClient } from '@/lib';
import AdminLayout from '@/components/layout/AdminLayout';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

export default function AdminFeatures() {
  const router = useRouter();
  const { isAuthenticated, canAccessDashboard } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.ADMIN)) {
      router.replace('/unauthorized');
      return;
    }
    loadFlags();
  }, [isAuthenticated, canAccessDashboard, router]);

  const loadFlags = async () => {
    try {
      const response = await apiClient.get('/admin/feature-flags');
      setFlags(response.data || []);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (name: string, enabled: boolean) => {
    try {
      await apiClient.put(`/admin/feature-flags/${name}/${enabled ? 'enable' : 'disable'}`);
      loadFlags();
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  if (!isAuthenticated || !canAccessDashboard(SystemRole.ADMIN)) {
    return null;
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Feature Flags"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Feature Flags</h1>
        <p className="text-slate-600">Enable/disable system features and modules.</p>

        {loading ? (
          <div className="surface-card-elevated p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mx-auto"></div>
          </div>
        ) : (
          <div className="surface-card-elevated p-6">
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="font-medium text-slate-900">{flag.name}</div>
                    {flag.description && <div className="text-sm text-slate-600">{flag.description}</div>}
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.name, !flag.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      flag.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        flag.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
