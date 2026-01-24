'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, SystemRole } from '@/lib';

export default function SectionOfficerDashboardRedirect() {
  const router = useRouter();
  const { isAuthenticated, canAccessDashboard } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.SECTION_OFFICER)) {
      router.replace('/unauthorized');
      return;
    }
    router.replace('/so/dashboard');
  }, [isAuthenticated, canAccessDashboard, router]);

  return null;
}
