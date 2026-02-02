'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { getDashboardPath } from '@/lib/roleAccess';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Developer convenience: quick login with default admin in non-production
  const quickDevLogin = async () => {
    if (process.env.NODE_ENV === 'production') return;
    setError('');
    setLoading(true);
    try {
      const auth = await api.login('admin', 'admin123');
      const role = auth?.role || 'ADMIN';
      const target = getDashboardPath(role);
      router.replace(target);
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[login] quickDevLogin error', err?.response?.status, err?.response?.data);
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Perform login (sets session cookie)
      const u = username.trim();
      const p = password; // do not trim password; respect exact input
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[login] submitting', { username: u });
      }
      const auth = await api.login(u, p);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[login] /auth/login response', auth);
      }
      // Prefer role from login response to route immediately
      if (auth?.role) {
        const target = getDashboardPath(auth.role);
        router.replace(target);
        return;
      }
      // Fallback: fetch current user from backend to get role
      const me = await api.getMe();
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[login] /auth/me response', me);
      }
      if (!me?.role) {
        setError('Unable to retrieve user session');
      } else {
        const target = getDashboardPath(me.role);
        router.replace(target);
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[login] error', err?.response?.status, err?.response?.data);
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sidebar rounded-2xl mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-heading mb-2">Welcome Back</h1>
            <p className="text-subtext">Sign in to HDAS Platform</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-heading mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-heading mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-subtext">
            <p>Secure access to accountability platform</p>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={quickDevLogin}
                className="btn-primary w-full"
                disabled={loading}
              >
                Use default admin (dev)
              </button>
              <p className="mt-2 text-xs text-subtext">Username: admin · Password: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
