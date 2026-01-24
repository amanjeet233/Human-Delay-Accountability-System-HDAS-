'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Edit } from 'lucide-react';
import api from '@/lib/api';

interface RoleData {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  permissions: string[];
}

export default function AdminRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadRoles();
  }, [router]);

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
                <p className="text-gray-600">Configure roles and permissions</p>
              </div>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="glass-card hover:bg-white/80 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    )}
                  </div>
                  {!role.active && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Inactive</span>
                  )}
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Permissions ({role.permissions.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <button className="btn-secondary text-sm w-full">Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
