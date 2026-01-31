'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { isAuthenticated, hasRole } from '@/lib/auth';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    loadRoles();
  }, [router]);

  const loadRoles = async () => {
    try {
      const data = await api.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

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

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-subtext">Loading roles...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <div key={role.id} className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-heading">{role.name}</h3>
                        <p className="text-xs text-subtext">{role.permissions.length} permissions</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {role.permissions.slice(0, 5).map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-subtext">
                          <Lock size={14} className="text-primary" />
                          <span>{permission}</span>
                        </div>
                      ))}
                      {role.permissions.length > 5 && (
                        <p className="text-xs text-subtext mt-2">
                          +{role.permissions.length - 5} more permissions
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && roles.length === 0 && (
              <div className="text-center py-12 glass-card">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-subtext">No roles configured</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
