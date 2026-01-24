import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { featureFlagsApi } from '@/lib/api';

interface FeatureFlags {
  escalation: boolean;
  auditCompliance: boolean;
  advancedAccountability: boolean;
  governanceAnalysis: boolean;
  transparency: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
}

export function useCapabilities() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Load feature flags from API
        const flags = await featureFlagsApi.getFlags();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Failed to load capabilities:', error);
        // Fallback to disabled features on error
        setFeatureFlags({
          escalation: false,
          auditCompliance: false,
          advancedAccountability: false,
          governanceAnalysis: false,
          transparency: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const canAccessFeature = (feature: keyof FeatureFlags) => {
    return featureFlags?.[feature] === true;
  };

  const hasRole = (role: string) => {
    return user?.role === role || user?.roles?.includes(role);
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => hasRole(role));
  };

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission);
  };

  const enforceFeatureAccess = (feature: keyof FeatureFlags, fallbackPath: string = '/login') => {
    if (!loading && !canAccessFeature(feature)) {
      router.push(fallbackPath);
      return false;
    }
    return true;
  };

  const enforceRoleAccess = (allowedRoles: string[], fallbackPath: string = '/login') => {
    if (!loading && !hasAnyRole(allowedRoles)) {
      router.push(fallbackPath);
      return false;
    }
    return true;
  };

  const enforceAccess = (
    feature: keyof FeatureFlags | null,
    allowedRoles: string[] = [],
    fallbackPath: string = '/login'
  ) => {
    if (loading) return true;
    
    if (feature && !canAccessFeature(feature)) {
      router.push(fallbackPath);
      return false;
    }
    
    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      router.push(fallbackPath);
      return false;
    }
    
    return true;
  };

  return {
    featureFlags,
    user,
    loading,
    canAccessFeature,
    hasRole,
    hasAnyRole,
    hasPermission,
    enforceFeatureAccess,
    enforceRoleAccess,
    enforceAccess,
  };
}
