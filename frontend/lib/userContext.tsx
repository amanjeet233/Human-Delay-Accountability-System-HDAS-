"use client";
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { api } from './api';

export type CurrentUser = {
  id: string;
  username: string;
  role: string;
  permissions?: Set<string> | string[];
  departmentId?: string | null;
};

type UserContextValue = {
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;
  ready: boolean;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await api.getMe();
        if (!mounted) return;
        if (me?.username && me?.role) {
          setUser({ id: me.id, username: me.username, role: me.role, permissions: me.permissions, departmentId: me.departmentId });
        } else {
          setUser(null);
        }
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({ user, setUser, ready }), [user, ready]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
