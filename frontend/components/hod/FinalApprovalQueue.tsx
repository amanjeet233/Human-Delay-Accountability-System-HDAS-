'use client'

import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Calendar,
  FileText,
  Eye,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'

interface FinalApprovalRequest {
  id: string
  citizenName: string
  requestType: string
  submittedDate: string
  sectionOfficerName: string
  timeInQueue: string
  totalProcessingTime: string
  priority: 'low' | 'medium' | 'high'
  department: string
  slaStatus: 'on-time' | 'urgent' | 'breached'
  recommendation: 'approve' | 'reject' | 'no-recommendation'
  delayReason?: string
}

interface FinalApprovalQueueProps {
  requests: FinalApprovalRequest[]
  loading?: boolean
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onView?: (requestId: string) => void
}

const mockRequests: FinalApprovalRequest[] = [
  {
    id: 'REQ-2024-014',
    citizenName: 'Anjali Sharma',
    requestType: 'Land Registration',
    submittedDate: '2024-01-10',
    sectionOfficerName: 'Robert Johnson',
    timeInQueue: '12 hours',
    totalProcessingTime: '5 days',
    priority: 'high',
    department: 'Revenue',
    slaStatus: 'on-time',
    recommendation: 'approve'
  },
  {
    id: 'REQ-2024-015',
    citizenName: 'Vikram Singh',
    requestType: 'Building Permit',
    submittedDate: '2024-01-08',
    sectionOfficerName: 'Sarah Williams',
    timeInQueue: '48 hours',
    totalProcessingTime: '8 days',
    priority: 'medium',
    department: 'Urban Development',
    slaStatus: 'urgent',
    recommendation: 'approve'
  },
  {
    id: 'REQ-2024-016',
    citizenName: 'Meera Patel',
    requestType: 'Business License',
    submittedDate: '2024-01-05',
    sectionOfficerName: 'Michael Chen',
    timeInQueue: '72 hours',
    totalProcessingTime: '12 days',
    priority: 'high',
    department: 'Commerce',
    slaStatus: 'breached',
    recommendation: 'reject',
    delayReason: 'Incomplete documentation - missing tax clearance'
  },
  {
    id: 'REQ-2024-017',
    citizenName: 'Rahul Kumar',
    requestType: 'Property Tax Assessment',
    submittedDate: '2024-01-12',
    sectionOfficerName: 'Emily Davis',
    timeInQueue: '6 hours',
    totalProcessingTime: '4 days',
    priority: 'low',
    department: 'Revenue',
    slaStatus: 'on-time',
    recommendation: 'no-recommendation'
  }
]

const FinalApprovalRow: React.FC<{
  request: FinalApprovalRequest
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onView?: (requestId: string) => void
}> = ({ request, onApprove, onReject, onView }) => {
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

  const recommendationColors = {
    approve: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reject: 'bg-red-50 text-red-700 border-red-200',
    'no-recommendation': 'bg-slate-50 text-slate-600 border-slate-200'
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
          <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-emerald-700">RJ</span>
          </div>
          <span className="text-slate-600">{request.sectionOfficerName}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="text-center">
          <div className="text-sm text-slate-700">{request.timeInQueue}</div>
          <div className="text-xs text-slate-500">Total: {request.totalProcessingTime}</div>
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[request.priority]}`}>
          {request.priority.toUpperCase()}
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${slaStatusColors[request.slaStatus]}`}>
          <Clock className="h-3 w-3" />
          <span className="capitalize">{request.slaStatus.replace('-', ' ')}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${recommendationColors[request.recommendation]}`}>
          {request.recommendation === 'approve' && '✓ Approve'}
          {request.recommendation === 'reject' && '✗ Reject'}
          {request.recommendation === 'no-recommendation' && 'No Rec.'}
        </div>
      </td>
      
      <td className="table-cell">
        {request.delayReason && (
          <div className="max-w-xs">
            <p className="text-xs text-red-600 truncate" title={request.delayReason}>
              {request.delayReason}
            </p>
          </div>
        )}
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onApprove?.(request.id)}
            className="btn-success text-xs px-3 py-1.5 flex items-center space-x-1"
            title="Final Approval"
          >
            <CheckCircle className="h-3 w-3" />
            <span>Approve</span>
          </button>
          
          <button
            onClick={() => onReject?.(request.id)}
            className="btn-danger text-xs px-3 py-1.5 flex items-center space-x-1"
            title="Final Rejection"
          >
            <XCircle className="h-3 w-3" />
            <span>Reject</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function FinalApprovalQueue({ 
  requests = mockRequests,
  loading = false,
  onApprove,
  onReject,
  onView
}: FinalApprovalQueueProps) {
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

  const urgentCount = requests.filter(req => req.slaStatus === 'urgent').length
  const breachedCount = requests.filter(req => req.slaStatus === 'breached').length

  if (loading) {
    return (
      <div className="surface-card-elevated overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Final Approval Queue</h3>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
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
            <h3 className="text-lg font-semibold text-slate-900">Final Approval Queue</h3>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-slate-600">
                {requests.length} requests awaiting final approval
              </span>
              {urgentCount > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-amber-600">{urgentCount} urgent</span>
                </div>
              )}
              {breachedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">{breachedCount} breached</span>
                </div>
              )}
            </div>
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
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="table-header-cell">Request ID</th>
                <th className="table-header-cell">Citizen Name</th>
                <th className="table-header-cell">Request Type</th>
                <th className="table-header-cell">Submitted</th>
                <th className="table-header-cell">Section Officer</th>
                <th className="table-header-cell">Processing Time</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">SLA Status</th>
                <th className="table-header-cell">Recommendation</th>
                <th className="table-header-cell">Delay Reason</th>
                <th className="table-header-cell">Final Action</th>
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
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <FinalApprovalRow
                    request={request}
                    onApprove={onApprove}
                    onReject={onReject}
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
