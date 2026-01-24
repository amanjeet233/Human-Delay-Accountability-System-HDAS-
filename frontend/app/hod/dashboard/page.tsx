'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, AlertTriangle, Eye, CheckSquare, XSquare } from 'lucide-react'
import HODLayout from '@/components/layout/HODLayout'
import { useAuth, SystemRole, apiClient } from '@/lib'

function HODDashboardContent() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showFinalApproveModal, setShowFinalApproveModal] = useState(false)
  const [showFinalRejectModal, setShowFinalRejectModal] = useState(false)
  const [finalApprovalNotes, setFinalApprovalNotes] = useState('')
  const [finalRejectionReason, setFinalRejectionReason] = useState('')
  const [finalRejectionNotes, setFinalRejectionNotes] = useState('')

  const loadRequests = async () => {
    try {
      const response = await apiClient.get('/hod/requests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.HOD)) {
      router.replace('/unauthorized');
      return;
    }

    loadRequests();
  }, [isAuthenticated, canAccessDashboard, router]);

  const handleApprove = async (requestId: string) => {
    try {
      await apiClient.put(`/hod/requests/${requestId}/approve`, { notes: finalApprovalNotes || '' });
      loadRequests();
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await apiClient.put(`/hod/requests/${requestId}/reject`, { reason: finalRejectionReason || '', notes: finalRejectionNotes || '' });
      loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleView = (requestId: string) => {
    console.log(`Viewing request details: ${requestId}`)
    // In a real implementation, this would navigate to request details
  }

  const handleEscalate = (requestId: string) => {
    console.log(`Escalating request: ${requestId}`)
  }

  const handleFinalApprove = async (requestId: string) => {
    try {
      await apiClient.post(`/hod/requests/${requestId}/final-approve`, { notes: finalApprovalNotes || '' });
      setShowFinalApproveModal(false)
      setFinalApprovalNotes('')
      setSelectedRequest(null)
      loadRequests();
    } catch (error) {
      console.error('Failed to final approve request:', error)
    }
  }

  const handleFinalReject = async () => {
    if (!selectedRequest) return
    try {
      await apiClient.post(`/hod/requests/${selectedRequest.id}/final-reject`, { reason: finalRejectionReason || '', notes: finalRejectionNotes || '' });
      setShowFinalRejectModal(false)
      setFinalRejectionReason('')
      setFinalRejectionNotes('')
      setSelectedRequest(null)
      loadRequests();
    } catch (error) {
      console.error('Failed to final reject request:', error)
    }
  }

  const getSLAStatus = (timeSpent: number, slaHours: number) => {
    const percentage = (timeSpent / slaHours) * 100
    if (percentage > 100) return { status: 'Overdue', color: 'text-red-600' }
    if (percentage > 80) return { status: 'Critical', color: 'text-orange-600' }
    if (percentage > 60) return { status: 'Warning', color: 'text-yellow-600' }
    return { status: 'On Track', color: 'text-green-600' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_HOD_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'FINAL_APPROVED': return 'bg-green-100 text-green-800'
      case 'FINAL_REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <HODLayout
      userId={user?.username ?? 'HOD'}
      userName={user?.username ?? 'Head of Department'}
      department="Processing Department"
      currentPage="Dashboard"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">HOD Dashboard</h1>
            <p className="text-slate-600">Final approval and completion of escalated requests.</p>
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
                <div className="text-sm text-slate-600">Total Requests</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'PENDING_HOD_REVIEW').length}
                </div>
                <div className="text-sm text-slate-600">Pending Final Review</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'FINAL_APPROVED').length}
                </div>
                <div className="text-sm text-slate-600">Final Approved</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'FINAL_REJECTED').length}
                </div>
                <div className="text-sm text-slate-600">Final Rejected</div>
              </div>
            </div>

            {/* Final Queue Table */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Final Approval Queue</h2>
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
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Workflow</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {requests.map((request) => {
                        const slaStatus = getSLAStatus(request.timeSpent, request.slaHours)
                        return (
                          <tr key={request.id} className="hover:bg-slate-50">
                            <td className="py-3 px-6">
                              <div>
                                <h3 className="text-lg font-medium text-slate-900 mb-1">{request.title}</h3>
                                <p className="text-sm text-slate-600">{request.description}</p>
                                {request.slaWarning && (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <div className="flex items-center space-x-2">
                                      <AlertTriangle className="w-4 h-4 text-red-600" />
                                      <span className="text-sm font-medium text-red-800">{request.slaWarningMessage}</span>
                                    </div>
                                  </div>
                                )}
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
                            <td className="py-3 px-6 text-sm text-slate-900">
                              <div className="space-y-1">
                                <div>Verified: {request.verifiedBy}</div>
                                <div>Approved: {request.approvedBy}</div>
                                {request.escalationReason && (
                                  <div className="text-orange-600">Escalated: {request.escalationReason.replace('_', ' ')}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedRequest(request)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {request.status === 'PENDING_HOD_REVIEW' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(request)
                                        setShowFinalApproveModal(true)
                                      }}
                                      className="text-green-600 hover:text-green-800 ml-2"
                                      title="Final Approve Request"
                                    >
                                      <CheckSquare className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(request)
                                        setShowFinalRejectModal(true)
                                      }}
                                      className="text-red-600 hover:text-red-800 ml-2"
                                      title="Final Reject Request"
                                    >
                                      <XSquare className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Approve Modal */}
        {showFinalApproveModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Final Approval</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                  <p className="text-sm text-slate-600">This will complete the request lifecycle.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Final Approval Notes:</label>
                  <textarea
                    value={finalApprovalNotes}
                    onChange={(e) => setFinalApprovalNotes(e.target.value)}
                    placeholder="Add final completion notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowFinalApproveModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleFinalApprove(selectedRequest.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Final Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Reject Modal */}
        {showFinalRejectModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Final Rejection</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                  <p className="text-sm text-slate-600">This will complete the request lifecycle with rejection.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Final Rejection Reason:</label>
                  <select
                    value={finalRejectionReason}
                    onChange={(e) => setFinalRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="INCOMPLETE_DOCUMENTATION">Incomplete Documentation</option>
                    <option value="INVALID_INFORMATION">Invalid Information</option>
                    <option value="NOT_ELIGIBLE">Not Eligible</option>
                    <option value="POLICY_VIOLATION">Policy Violation</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Final Rejection Notes:</label>
                  <textarea
                    value={finalRejectionNotes}
                    onChange={(e) => setFinalRejectionNotes(e.target.value)}
                    placeholder="Provide detailed explanation for final rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowFinalRejectModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Final Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HODLayout>
  )
}

export default function HODDashboard() {
  return <HODDashboardContent />;
}
