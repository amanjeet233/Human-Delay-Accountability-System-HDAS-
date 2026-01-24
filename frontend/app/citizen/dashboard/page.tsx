'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import CitizenLayout from '@/components/layout/CitizenLayout';
import { FeatureGrid } from '@/components/citizen/FeatureGrid';

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    processId: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.CITIZEN)) {
      router.replace('/unauthorized');
      return;
    }
    loadRequests();
    loadProcesses();
  }, [isAuthenticated, canAccessDashboard, router]);

  const loadRequests = async () => {
    try {
      const response = await apiClient.get('/citizen/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProcesses = async () => {
    try {
      const response = await apiClient.get('/processes');
      setProcesses(response.data || []);
    } catch (error) {
      console.error('Failed to load processes:', error);
      setProcesses([]);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description || !newRequest.processId) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await apiClient.post('/citizen/requests', newRequest);
      setNewRequest({ title: '', description: '', processId: '' });
      setShowCreateModal(false);
      loadRequests();
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertTriangle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated || !canAccessDashboard(SystemRole.CITIZEN)) {
    return null;
  }

  return (
    <CitizenLayout
      userId={user?.username ?? 'CITIZEN'}
      userName={user?.username ?? 'Citizen'}
      department="Public Services"
      currentPage="Dashboard"
    >
      <div className="space-y-8">
        {/* Header */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
              <p className="text-slate-600">Submit and track your service requests.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </section>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="glass-card p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Brief description of your request"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Detailed description of your request"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Process Type</label>
                  <select
                    value={newRequest.processId}
                    onChange={(e) => setNewRequest({ ...newRequest, processId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select a process</option>
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>
                        {process.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRequest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Table */}
        <section>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Request ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Last Updated</th>
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
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No requests found. Create your first request!
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{request.id}</td>
                        <td className="py-3 px-4 text-slate-700">{request.title}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{new Date(request.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-700">{new Date(request.updatedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => router.push(`/citizen/requests/${request.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Future Features Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Future Features</h2>
          <FeatureGrid />
        </section>
      </div>
    </CitizenLayout>
  );
}
