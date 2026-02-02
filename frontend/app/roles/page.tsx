'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { isAuthenticated, hasRole } from '@/lib/auth';

export default function RolesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    // Role listing is not part of frozen contracts; show governance guidance.
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">Roles & Permissions</h1>
              <p className="text-subtext mt-1">View system roles and their permissions</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-heading">Roles & Permissions</h3>
                  <p className="text-xs text-subtext">Governed by backend contracts</p>
                </div>
              </div>
              <p className="text-sm text-subtext">Role listing is not exposed via API. Manage user roles in the Users page using the role assignment endpoint. Audit logs capture changes.</p>
              <div className="mt-4">
                <button onClick={() => router.push('/users')} className="btn-secondary">Go to Users</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
