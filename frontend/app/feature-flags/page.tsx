'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Lock, Unlock, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { isAuthenticated, hasRole } from '@/lib/auth';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export default function FeatureFlagsPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    loadFlags();
  }, [router]);

  const loadFlags = async () => {
    try {
      const data = await api.getFeatureFlags();
      setFlags(data);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagId: string, currentState: boolean) => {
    setToggling(flagId);
    try {
      await api.toggleFeatureFlag(flagId, !currentState);
      setFlags(flags.map(flag => 
        flag.id === flagId ? { ...flag, enabled: !currentState } : flag
      ));
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    } finally {
      setToggling(null);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">Feature Flags</h1>
              <p className="text-subtext mt-1">Control system features and capabilities</p>
            </div>

            <div className="glass-card p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-heading">Feature Flag Management</p>
                <p className="text-xs text-subtext mt-1">
                  Enabling or disabling flags will affect all users immediately. Changes are logged for audit purposes.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-subtext">Loading feature flags...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div key={flag.id} className="glass-card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          flag.enabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {flag.enabled ? (
                            <Unlock className="w-6 h-6 text-green-600" />
                          ) : (
                            <Lock className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-heading">{flag.name}</h3>
                            <span className={`badge ${
                              flag.enabled ? 'badge-success' : 'badge-error'
                            }`}>
                              {flag.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            {flag.category && (
                              <span className="badge badge-info">{flag.category}</span>
                            )}
                          </div>
                          <p className="text-sm text-subtext">{flag.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFlag(flag.id, flag.enabled)}
                        disabled={toggling === flag.id}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                          flag.enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {toggling === flag.id ? 'Updating...' : flag.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && flags.length === 0 && (
              <div className="text-center py-12 glass-card">
                <Flag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-subtext">No feature flags configured</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
