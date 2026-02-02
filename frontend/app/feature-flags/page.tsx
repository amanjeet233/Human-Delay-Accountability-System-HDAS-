'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { isAuthenticated, hasRole } from '@/lib/auth';

export default function FeatureFlagsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [flagKey, setFlagKey] = useState('');
  const [enableState, setEnableState] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    // Listing of flags is not part of the frozen contract; provide toggle form only.
  }, [router]);

  const submitToggle = async () => {
    try {
      setToggling(true);
      setError(null);
      setResultMessage(null);
      if (!flagKey.trim()) {
        setError('Please enter a feature flag key');
        setToggling(false);
        return;
      }
      const res = await api.toggleFeatureFlag(flagKey.trim(), enableState);
      setResultMessage(res?.message || 'Toggle request submitted');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to toggle flag');
    } finally {
      setToggling(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-8">
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

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-heading mb-4">Toggle Feature Flag</h3>
              <p className="text-sm text-subtext mb-4">Enter a flag key from governance (e.g., <em>slaBreachAnalytics</em>) and choose enable/disable. Disabled flags return 403 on access.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-sm text-subtext">Flag Key</label>
                  <input className="input w-full" value={flagKey} onChange={(e) => setFlagKey(e.target.value)} placeholder="e.g., slaBreachAnalytics" />
                </div>
                <div>
                  <label className="text-sm text-subtext">State</label>
                  <select className="input w-full" value={enableState ? 'enabled' : 'disabled'} onChange={(e) => setEnableState(e.target.value === 'enabled')}>
                    <option value="enabled">Enable</option>
                    <option value="disabled">Disable</option>
                  </select>
                </div>
                <div>
                  <button onClick={submitToggle} disabled={toggling} className="btn-primary w-full">{toggling ? 'Submitting...' : 'Submit'}</button>
                </div>
              </div>
              {error ? <p className="text-red-500 text-sm mt-3">{error}</p> : null}
              {resultMessage ? <p className="text-green-600 text-sm mt-3">{resultMessage}</p> : null}
            </div>
      </div>
    </div>
  );
}
