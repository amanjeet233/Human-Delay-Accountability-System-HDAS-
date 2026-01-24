'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { RoleAccessControl } from '@/lib/roleAccess';

export default function Unauthorized() {
  const router = useRouter();

  useEffect(() => {
    // Log the unauthorized access attempt
    const user = RoleAccessControl.getCurrentUser();
    console.warn(`Unauthorized access attempt by user: ${user?.username} with role: ${user?.role}`);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    const dashboardUrl = RoleAccessControl.getDashboardUrl();
    if (dashboardUrl !== '/login') {
      router.push(dashboardUrl);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Error Card */}
        <div className="surface-card-elevated p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h1>
            <p className="text-body text-slate-600 mb-2">
              You don't have permission to access this resource.
            </p>
            <p className="text-sm text-slate-500">
              Please contact your administrator if you believe this is an error.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="btn-primary w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Go to Your Dashboard
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoBack}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={handleGoToLogin}
                className="btn-ghost"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Security Notice
                </p>
                <p className="text-sm text-amber-800">
                  This access attempt has been logged. Unauthorized access to government systems may result in disciplinary action.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-caption text-slate-500">
            HDAS - Human Delay Accountability System
          </p>
          <p className="text-caption text-slate-400 mt-1">
            Secure Government System
          </p>
        </div>
      </div>
    </div>
  );
}
