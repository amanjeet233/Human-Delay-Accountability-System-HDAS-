'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

function decodeJwtRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64Url = parts[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64 + '='.repeat((4 - (payloadBase64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json);
    const role = payload?.role;
    return typeof role === 'string' && role.trim().length > 0 ? role : null;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ username, password });

      localStorage.setItem('token', response.token);

      const resolvedRole = response.role || decodeJwtRole(response.token);
      if (!resolvedRole) {
        setError('Invalid authentication response - no role assigned');
        return;
      }

      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        email: response.email,
        role: resolvedRole,
      }));

      const roleRoutes: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        CITIZEN: '/citizen/dashboard',
        CLERK: '/clerk/dashboard',
        SO: '/so/dashboard',
        SECTION_OFFICER: '/so/dashboard',
        HOD: '/hod/dashboard',
        AUDITOR: '/auditor/dashboard',
      };

      const target = roleRoutes[resolvedRole];
      if (!target) {
        setError(`Unknown role: ${resolvedRole}`);
        return;
      }

      router.push(target);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-2xl mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-display text-balance mb-2">HDAS</h1>
            <p className="text-body text-balance">Human Delay Accountability System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-caption text-slate-500">
            Enterprise Governance Platform
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-caption text-slate-400">
            <span>© 2024 HDAS</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-caption font-medium text-slate-700 mb-2">Government Role Access</p>
          <div className="space-y-1 text-caption text-slate-600">
            <div><span className="font-medium">Admin:</span> admin / admin123</div>
            <div><span className="font-medium">HOD:</span> hod / password</div>
            <div><span className="font-medium">Section Officer:</span> so / password</div>
            <div><span className="font-medium">Clerk:</span> clerk / password</div>
            <div><span className="font-medium">Citizen:</span> citizen / password</div>
            <div><span className="font-medium">Auditor:</span> auditor / password</div>
          </div>
        </div>
      </div>
    </div>
  );
}
