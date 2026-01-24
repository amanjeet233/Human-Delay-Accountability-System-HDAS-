'use client'

import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Eye
} from 'lucide-react'

interface ReviewRequest {
  id: string
  citizenName: string
  requestType: string
  submittedDate: string
  clerkName: string
  timeInQueue: string
  slaStatus: 'on-time' | 'urgent' | 'breached'
  priority: 'low' | 'medium' | 'high'
  department: string
  documentsVerified: boolean
}

interface ReviewQueueTableProps {
  requests: ReviewRequest[]
  loading?: boolean
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onForward?: (requestId: string) => void
  onView?: (requestId: string) => void
}


const RequestRow: React.FC<{
  request: ReviewRequest
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onForward?: (requestId: string) => void
  onView?: (requestId: string) => void
}> = ({ request, onApprove, onReject, onForward, onView }) => {
  const slaStatusColors = {
    'on-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'urgent': 'bg-amber-50 text-amber-700 border-amber-200',
    'breached': 'bg-red-50 text-red-700 border-red-200'
  }

  const priorityColors = {
    low: 'bg-slate-50 text-slate-600 border-slate-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    high: 'bg-red-50 text-red-600 border-red-200'
  }

  const slaIcons = {
    'on-time': <CheckCircle className="h-3 w-3" />,
    'urgent': <Clock className="h-3 w-3" />,
    'breached': <AlertTriangle className="h-3 w-3" />
  }

  return (
    <tr className="table-row hover:bg-slate-50 transition-colors">
      <td className="table-cell">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onView?.(request.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <span className="font-medium text-slate-900">{request.id}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700">{request.citizenName}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <span className="text-slate-700">{request.requestType}</span>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700">{request.submittedDate}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600">JS</span>
          </div>
          <span className="text-slate-600">{request.clerkName}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700">{request.timeInQueue}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${slaStatusColors[request.slaStatus]}`}>
          {slaIcons[request.slaStatus]}
          <span className="capitalize">{request.slaStatus.replace('-', ' ')}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[request.priority]}`}>
          {request.priority.toUpperCase()}
        </div>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          {request.documentsVerified ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" title="Documents Verified" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" title="Documents Pending" />
          )}
          <span className="text-xs text-slate-600">
            {request.documentsVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onApprove?.(request.id)}
            className="btn-success text-xs px-3 py-1.5 flex items-center space-x-1"
            title="Approve Request"
          >
            <CheckCircle className="h-3 w-3" />
            <span>Approve</span>
          </button>
          
          <button
            onClick={() => onReject?.(request.id)}
            className="btn-danger text-xs px-3 py-1.5 flex items-center space-x-1"
            title="Reject Request"
          >
            <XCircle className="h-3 w-3" />
            <span>Reject</span>
          </button>
          
          <button
            onClick={() => onForward?.(request.id)}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1"
            title="Forward to HOD"
          >
            <ArrowRight className="h-3 w-3" />
            <span>Forward</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function ReviewQueueTable({ 
  requests = [],
  loading = false,
  onApprove,
  onReject,
  onForward,
  onView
}: ReviewQueueTableProps) {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(requests.map(req => req.id))
    }
  }

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const handleBulkApprove = () => {
    selectedRequests.forEach(id => onApprove?.(id))
    setSelectedRequests([])
  }

  const handleBulkReject = () => {
    selectedRequests.forEach(id => onReject?.(id))
    setSelectedRequests([])
  }

  const handleBulkForward = () => {
    selectedRequests.forEach(id => onForward?.(id))
    setSelectedRequests([])
  }

  if (loading) {
    return (
      <div className="surface-card-elevated overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Queue</h3>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="skeleton h-4 w-24 rounded"></div>
                  <div className="skeleton h-4 w-32 rounded"></div>
                  <div className="skeleton h-4 w-28 rounded"></div>
                  <div className="skeleton h-4 w-24 rounded"></div>
                  <div className="skeleton h-4 w-20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Review Queue</h3>
            <p className="text-sm text-slate-600 mt-1">
              {requests.length} requests awaiting your review
            </p>
          </div>
          
          {selectedRequests.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">
                {selectedRequests.length} selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="btn-success text-xs px-3 py-1.5"
              >
                Approve Selected
              </button>
              <button
                onClick={handleBulkReject}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Reject Selected
              </button>
              <button
                onClick={handleBulkForward}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Forward Selected
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === requests.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="table-header-cell">Request ID</th>
                <th className="table-header-cell">Citizen Name</th>
                <th className="table-header-cell">Request Type</th>
                <th className="table-header-cell">Submitted</th>
                <th className="table-header-cell">Clerk</th>
                <th className="table-header-cell">Time in Queue</th>
                <th className="table-header-cell">SLA Status</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Documents</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="table-row hover:bg-slate-50">
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                  </td>
                  <RequestRow
                    request={request}
                    onApprove={onApprove}
                    onReject={onReject}
                    onForward={onForward}
                    onView={onView}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
