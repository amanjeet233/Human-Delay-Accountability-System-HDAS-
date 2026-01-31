'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, hasRole } from './auth';

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/dashboard');
    }
  }, [router, requiredRole]);
}
