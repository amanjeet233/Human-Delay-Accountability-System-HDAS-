'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, AlertTriangle, FileText, Users, TrendingUp, Eye, Send } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import ClerkLayout from '@/components/layout/ClerkLayout';
import { FeatureGrid } from '@/components/clerk/FeatureGrid';

interface ClerkRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  assignedAt: string;
  slaHours: number;
  slaDays: number;
  timeSpent: number;
  priority: string;
}

function ClerkDashboardContent() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [requests, setRequests] = useState<ClerkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ClerkRequest | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardNotes, setForwardNotes] = useState('');
  const [targetRole, setTargetRole] = useState('SECTION_OFFICER');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING_CLERK_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getSLAStatus = (timeSpent: number, slaHours: number) => {
    const percentage = Math.min((timeSpent / slaHours) * 100, 100);
    if (percentage >= 90) return { status: 'On Track', color: 'text-green-600' };
    if (percentage >= 75) return { status: 'At Risk', color: 'text-yellow-600' };
    return { status: 'Delayed', color: 'text-red-600' };
  };

  const handleVerify = async (requestId: string) => {
    try {
      await apiClient.put(`/clerk/${requestId}/verify`, {});
      setShowVerifyModal(false);
      loadRequests();
    } catch (error) {
      console.error('Failed to verify request:', error);
    }
  };

  const handleForward = async () => {
    if (!selectedRequest || !targetRole) return;

    try {
      await apiClient.put(`/clerk/${selectedRequest.id}/forward`, {
        to: targetRole,
        notes: forwardNotes,
      });
      setShowForwardModal(false);
      setSelectedRequest(null);
      setForwardNotes('');
      setTargetRole('SECTION_OFFICER');
      loadRequests();
    } catch (error) {
      console.error('Failed to forward request:', error);
    }
  };

  return (
    <ClerkLayout
      userId={user?.username ?? 'CLERK'}
      userName={user?.username ?? 'Clerk'}
      department="Clerical Office"
      currentPage="Dashboard"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clerk Dashboard</h1>
            <p className="text-slate-600">Process assigned requests and track SLA compliance.</p>
          </div>
        </div>

        {loading ? (
          <div className="surface-card-elevated p-8">
            <div className="animate-pulse space-y-4">
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                <div className="text-sm text-slate-600">Assigned Requests</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'PENDING_CLERK_REVIEW').length}
                </div>
                <div className="text-sm text-slate-600">Pending Review</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'VERIFIED').length}
                </div>
                <div className="text-sm text-slate-600">Verified</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {requests.filter(r => r.status === 'IN_PROGRESS').length}
                </div>
                <div className="text-sm text-slate-600">In Progress</div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">My Assigned Requests</h2>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No requests assigned to you</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Request</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Status</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Priority</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">SLA</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Assigned</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {requests.map((request) => {
                        const slaStatus = getSLAStatus(request.timeSpent, request.slaHours);
                        return (
                          <tr key={request.id} className="hover:bg-slate-50">
                            <td className="py-3 px-6">
                              <div>
                                <h3 className="text-lg font-medium text-slate-900 mb-1">{request.title}</h3>
                                <p className="text-sm text-slate-600">{request.description}</p>
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                {request.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm text-slate-600">
                                  <div>{request.timeSpent}h / {request.slaDays}d</div>
                                  <div className={`font-medium ${slaStatus.color}`}>
                                    {slaStatus.status}
                                  </div>
                                </div>
                                <div className="w-16 bg-slate-200 rounded-full h-2">
                                  <div 
                                    className="h-2 bg-green-500 rounded-full"
                                    style={{ width: `${Math.min((request.timeSpent / request.slaHours) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-6 text-sm text-slate-900">{request.assignedTo}</td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedRequest(request)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {request.status === 'PENDING_CLERK_REVIEW' && (
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowVerifyModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-800 ml-2"
                                    title="Verify Request"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                                {request.status === 'VERIFIED' && (
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowForwardModal(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 ml-2"
                                    title="Forward Request"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Future Features Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Future Features</h2>
              <FeatureGrid />
            </div>
          </div>
        )}

        {/* Verify Modal */}
        {showVerifyModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Verify Request</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleVerify(selectedRequest.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forward Modal */}
        {showForwardModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Forward Request</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Forward To:</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select Role</option>
                    <option value="SECTION_OFFICER">Section Officer</option>
                    <option value="HOD">Head of Department</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes:</label>
                  <textarea
                    value={forwardNotes}
                    onChange={(e) => setForwardNotes(e.target.value)}
                    placeholder="Add any notes for forwarding..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowForwardModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForward}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Forward Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClerkLayout>
  );
}

export default function ClerkDashboard() {
  const { isAuthenticated, canAccessDashboard } = useAuth();

  if (!isAuthenticated || !canAccessDashboard(SystemRole.CLERK)) {
    return null;
  }

  return <ClerkDashboardContent />;
}
