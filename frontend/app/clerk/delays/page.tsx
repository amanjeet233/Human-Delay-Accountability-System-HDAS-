'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, Filter, Search } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import ClerkLayout from '@/components/layout/ClerkLayout';
import { FeatureCard } from '@/components/FeatureCard';

export default function ClerkDelays() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'justified'>('all');

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.CLERK)) {
      router.replace('/unauthorized');
      return;
    }
    loadRequests();
  }, [isAuthenticated, canAccessDashboard, router]);

  const loadRequests = async () => {
    try {
      const response = await apiClient.get('/clerk/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJustify = async (requestId: string, reason: string, category: string) => {
    try {
      await apiClient.post(`/clerk/${requestId}/delay-reason`, { reason, category });
      loadRequests();
    } catch (error) {
      console.error('Failed to justify delay:', error);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(r.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'pending' && r.status !== 'VERIFIED') ||
                         (filterStatus === 'justified' && r.status === 'VERIFIED');
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated || !canAccessDashboard(SystemRole.CLERK)) {
    return null;
  }

  return (
    <ClerkLayout
      userId={user?.username ?? 'CLERK'}
      userName={user?.username ?? 'Clerk'}
      department="Clerical Office"
      currentPage="Delay Management"
    >
      <div className="space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-2xl font-bold text-slate-900">Delay Management</h1>
          <p className="text-slate-600">Track and justify delays for assigned tasks.</p>
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
                    placeholder="Search by reason or request ID..."
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
                <option value="all">All Delays</option>
                <option value="pending">Pending Justification</option>
                <option value="justified">Justified</option>
              </select>
            </div>
          </div>
        </section>

        {/* Delays Table */}
        <section>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Request ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Request Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Justification</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{request.id}</td>
                        <td className="py-3 px-4 text-slate-700">{request.title}</td>
                        <td className="py-3 px-4 text-slate-700">{request.status}</td>
                        <td className="py-3 px-4 text-slate-700">{request.priority}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {request.status === 'VERIFIED' ? 'Justified' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {request.status !== 'VERIFIED' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter justification reason:');
                                const category = prompt('Enter category (INTERNAL/EXTERNAL):', 'EXTERNAL');
                                if (reason && category) {
                                  handleJustify(request.id, reason, category);
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              Justify
                            </button>
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

        {/* Future Features */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Future Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              flag="clerkDelayReasonUI"
              title="Advanced Delay Reason UI"
              description="Rich UI for capturing and categorizing delay reasons."
              icon={<Clock className="text-2xl" />}
            />
          </div>
        </section>
      </div>
    </ClerkLayout>
  );
}
