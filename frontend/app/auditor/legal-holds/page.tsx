'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Unlock, Search, Filter } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import AuditorLayout from '@/components/layout/AuditorLayout';

interface LegalHold {
  id: string;
  auditLogId: string;
  reason: string;
  placedBy: string;
  placedAt: string;
  releasedBy?: string;
  releasedAt?: string;
  isActive: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export default function AuditorLegalHolds() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [holds, setHolds] = useState<LegalHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'released'>('all');

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.AUDITOR)) {
      router.replace('/unauthorized');
      return;
    }
    loadLegalHolds();
  }, [isAuthenticated, canAccessDashboard, router]);

  const loadLegalHolds = async () => {
    try {
      const response = await apiClient.get('/auditor/legal-holds');
      setHolds(response.data || []);
    } catch (error) {
      console.error('Failed to load legal holds:', error);
      setHolds([]);
    } finally {
      setLoading(false);
    }
  };

  const placeLegalHold = async (auditLogId: string, reason: string) => {
    try {
      await apiClient.post(`/auditor/audit-logs/${auditLogId}/legal-hold`, { reason });
      loadLegalHolds();
    } catch (error) {
      console.error('Failed to place legal hold:', error);
    }
  };

  const releaseLegalHold = async (auditLogId: string) => {
    try {
      await apiClient.delete(`/auditor/audit-logs/${auditLogId}/legal-hold`);
      loadLegalHolds();
    } catch (error) {
      console.error('Failed to release legal hold:', error);
    }
  };

  const filteredHolds = holds.filter(h => {
    const matchesSearch = h.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         h.placedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && h.isActive) ||
                         (filterStatus === 'released' && !h.isActive);
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated || !canAccessDashboard(SystemRole.AUDITOR)) {
    return null;
  }

  return (
    <AuditorLayout
      userId={user?.username ?? 'AUDITOR'}
      userName={user?.username ?? 'Auditor'}
      department="Audit & Compliance"
      currentPage="Legal Holds"
    >
      <div className="space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-2xl font-bold text-slate-900">Legal Holds</h1>
          <p className="text-slate-600">Manage legal holds on audit logs for compliance and litigation.</p>
        </section>

        {/* Filters */}
        <section>
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by reason or placed by..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Holds</option>
                <option value="active">Active Only</option>
                <option value="released">Released Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* Legal Holds Table */}
        <section>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Audit Log ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Reason</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Placed By</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Placed At</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Severity</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredHolds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No legal holds found.
                      </td>
                    </tr>
                  ) : (
                    filteredHolds.map((hold) => (
                      <tr key={hold.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{hold.auditLogId}</td>
                        <td className="py-3 px-4 text-slate-700">{hold.reason}</td>
                        <td className="py-3 px-4 text-slate-700">{hold.placedBy}</td>
                        <td className="py-3 px-4 text-slate-700">{new Date(hold.placedAt).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            hold.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            hold.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            hold.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {hold.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hold.isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {hold.isActive ? 'Active' : 'Released'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {hold.isActive ? (
                            <button
                              onClick={() => releaseLegalHold(hold.auditLogId)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Release Legal Hold"
                            >
                              <Unlock className="w-3 h-3" />
                              Release
                            </button>
                          ) : (
                            <div className="text-sm text-slate-500">
                              Released by {hold.releasedBy} on {new Date(hold.releasedAt!).toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AuditorLayout>
  );
}
