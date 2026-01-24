'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, AuthResponse } from './apiClient';
import { SystemRole, RoleAccessControl } from './roleAccess';

export interface AuthUser {
  username: string;
  email: string;
  role: SystemRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessDashboard: (role: SystemRole) => boolean;
  redirectToDashboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore user from localStorage if token exists
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role && Object.values(SystemRole).includes(parsed.role as SystemRole)) {
          const restoredUser: AuthUser = { username: parsed.username, email: parsed.email, role: parsed.role as SystemRole };
          setUser(restoredUser);
          RoleAccessControl.setCurrentUser(restoredUser);
        }
      } catch {
        // Corrupt storage; clear
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    if (!token || !storedUser) {
      RoleAccessControl.setCurrentUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ username, password });
      const { token, email, role } = response;

      if (!Object.values(SystemRole).includes(role as SystemRole)) {
        throw new Error('Invalid role returned from server');
      }

      const authUser: AuthUser = { username, email, role: role as SystemRole };
      setUser(authUser);
      RoleAccessControl.setCurrentUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    RoleAccessControl.setCurrentUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Forward to RoleAccessControl for consistency
    return RoleAccessControl.hasPermission(permission as any);
  };

  const canAccessDashboard = (role: SystemRole): boolean => {
    return RoleAccessControl.canAccessDashboard(role);
  };

  const redirectToDashboard = () => {
    RoleAccessControl.redirectToDashboard();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated,
        hasPermission,
        canAccessDashboard,
        redirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
