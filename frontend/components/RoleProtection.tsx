'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SystemRole, Permission, RoleAccessControl } from '@/lib/roleAccess';

interface RoleProtectionProps {
  children: React.ReactNode;
  requiredRole?: SystemRole;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function RoleProtection({ 
  children, 
  requiredRole, 
  requiredPermissions, 
  fallback,
  redirectTo 
}: RoleProtectionProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      const user = RoleAccessControl.getCurrentUser();
      
      // Check if user is logged in
      if (!user) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/login');
        }
        return;
      }

      // Check role-based access
      if (requiredRole) {
        if (!RoleAccessControl.canAccessDashboard(requiredRole)) {
          console.warn(`Access denied: User ${user.role} cannot access ${requiredRole} dashboard`);
          if (fallback) {
            setIsAuthorized(false);
          } else {
            router.push('/unauthorized');
          }
          return;
        }
      }

      // Check permission-based access
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasAllPermissions = RoleAccessControl.hasAnyPermission(requiredPermissions);
        if (!hasAllPermissions) {
          console.warn(`Access denied: User ${user.role} lacks required permissions`);
          if (fallback) {
            setIsAuthorized(false);
          } else {
            router.push('/unauthorized');
          }
          return;
        }
      }

      setIsAuthorized(true);
    };

    checkAuthorization();
    setIsLoading(false);
  }, [requiredRole, requiredPermissions, fallback, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-body text-slate-600">Validating access...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false && fallback) {
    return <>{fallback}</>;
  }

  if (isAuthorized === true) {
    return <>{children}</>;
  }

  return null;
}

// Permission-based component for conditional rendering
export function PermissionGate({ 
  children, 
  permissions, 
  fallback 
}: { 
  children: React.ReactNode; 
  permissions: Permission[]; 
  fallback?: React.ReactNode; 
}) {
  const hasPermission = RoleAccessControl.hasAnyPermission(permissions);
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}

// Role-based component for conditional rendering (single-role only)
export function RoleGate({ 
  children, 
  role, 
  fallback 
}: { 
  children: React.ReactNode; 
  role: SystemRole; 
  fallback?: React.ReactNode; 
}) {
  const currentRole = RoleAccessControl.getCurrentRole();
  const hasRole = currentRole === role;
  
  if (hasRole) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}
