'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { isAuthenticated, getUser, hasRole } from '@/lib/auth';
import MyRequestsTable from '@/components/tables/MyRequestsTable';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const user = getUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    // Restrict to citizens; admins can also view for testing
    if (!(hasRole('CITIZEN') || hasRole('ADMIN'))) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-heading">Citizen Dashboard</h1>
              <p className="text-subtext mt-1">Welcome, {user?.username}</p>
            </div>
            <MyRequestsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
