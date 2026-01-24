'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle, Clock, User, Calendar, Send, Eye, FileText, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import SectionOfficerLayout from '@/components/layout/SectionOfficerLayout'
import { apiClient } from '@/lib'
import { useAuth, SystemRole } from '@/lib'

interface SORequest {
  id: string
  title: string
  description: string
  status: string
  assignedTo: string
  assignedAt: string
  slaHours: number
  slaDays: number
  timeSpent: number
  priority: string
  verifiedBy: string
  verifiedAt: string
  slaWarning: boolean
  slaWarningMessage: string
}

export default function SectionOfficerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, canAccessDashboard } = useAuth()
  const [requests, setRequests] = useState<SORequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<SORequest | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [forwardNotes, setForwardNotes] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.SECTION_OFFICER)) {
      router.replace('/unauthorized')
      return
    }
    loadRequests()
  }, [isAuthenticated, canAccessDashboard, router])

  const loadRequests = async () => {
    try {
      const response = await apiClient.get('/so/requests')
      console.log('SO requests API response:', response.data)
      setRequests(response.data || [])
    } catch (error) {
      console.error('Failed to load requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_SO_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getSLAStatus = (timeSpent: number, slaHours: number) => {
    const percentage = Math.min((timeSpent / slaHours) * 100, 100)
    if (percentage >= 90) return { status: 'Critical', color: 'text-red-600' }
    if (percentage >= 75) return { status: 'At Risk', color: 'text-yellow-600' }
    return { status: 'On Track', color: 'text-green-600' }
  }

  const handleApprove = async (requestId: string) => {
    try {
      console.log('Approving request:', requestId)
      const response = await apiClient.put(`/so/requests/${requestId}/approve`, {
        notes: approvalNotes
      })
      console.log('Approve response:', response.data)
      setShowApproveModal(false)
      setApprovalNotes('')
      loadRequests()
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return

    try {
      console.log('Rejecting request:', selectedRequest.id)
      const response = await apiClient.put(`/so/requests/${selectedRequest.id}/reject`, {
        reason: rejectionReason,
        notes: rejectionNotes
      })
      console.log('Reject response:', response.data)
      setShowRejectModal(false)
      setSelectedRequest(null)
      setRejectionReason('')
      setRejectionNotes('')
      loadRequests()
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleForward = async () => {
    if (!selectedRequest || !escalationReason) return

    try {
      console.log('Forwarding request:', selectedRequest.id, 'escalation reason:', escalationReason)
      const response = await apiClient.put(`/so/requests/${selectedRequest.id}/forward`, {
        escalationReason,
        notes: forwardNotes
      })
      console.log('Forward response:', response.data)
      setShowForwardModal(false)
      setSelectedRequest(null)
      setEscalationReason('')
      setForwardNotes('')
      loadRequests()
    } catch (error) {
      console.error('Failed to forward request:', error)
    }
  }

  return (
    <SectionOfficerLayout
      userId={user?.username ?? 'SECTION_OFFICER'}
      userName={user?.username ?? 'Section Officer'}
      department="Processing Department"
      currentPage="Dashboard"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Section Officer Dashboard</h1>
            <p className="text-slate-600">Review and approve/reject verified requests.</p>
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
                  {requests.filter(r => r.status === 'PENDING_SO_REVIEW').length}
                </div>
                <div className="text-sm text-slate-600">Pending Review</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'APPROVED').length}
                </div>
                <div className="text-sm text-slate-600">Approved</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'REJECTED').length}
                </div>
                <div className="text-sm text-slate-600">Rejected</div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Review Queue</h2>
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
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Verified By</th>
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
                            <td className="py-3 px-6 text-sm text-slate-900">{request.verifiedBy}</td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedRequest(request)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {request.status === 'PENDING_SO_REVIEW' && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(request)
                                        setShowApproveModal(true)
                                      }}
                                      className="text-green-600 hover:text-green-800 ml-2"
                                      title="Approve Request"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(request)
                                        setShowRejectModal(true)
                                      }}
                                      className="text-red-600 hover:text-red-800 ml-2"
                                      title="Reject Request"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                {request.status === 'IN_PROGRESS' && (
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request)
                                      setShowForwardModal(true)
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 ml-2"
                                    title="Escalate to HOD"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
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

        {/* Approve Modal */}
        {showApproveModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Approve Request</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Approval Notes:</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes for approval..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Request</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rejection Reason:</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="INCOMPLETE_DOCUMENTATION">Incomplete Documentation</option>
                    <option value="INVALID_INFORMATION">Invalid Information</option>
                    <option value="NOT_ELIGIBLE">Not Eligible</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rejection Notes:</label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Provide detailed explanation for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forward/Escalate Modal */}
        {showForwardModal && selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Escalate to HOD</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Request: <span className="font-medium">{selectedRequest.title}</span></p>
                  <p className="text-sm text-slate-600">ID: <span className="font-medium">{selectedRequest.id}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Escalation Reason:</label>
                  <select
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Select Reason</option>
                    <option value="COMPLEX_CASE">Complex Case</option>
                    <option value="REQUIRES_HIGHER_AUTHORITY">Requires Higher Authority</option>
                    <option value="POLICY_EXCEPTION">Policy Exception</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes:</label>
                  <textarea
                    value={forwardNotes}
                    onChange={(e) => setForwardNotes(e.target.value)}
                    placeholder="Add any notes for escalation..."
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
                    Escalate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionOfficerLayout>
  )
}
