'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, FileText, CheckCircle, XCircle, User, Calendar } from 'lucide-react'

interface CitizenRequest {
  id: string
  type: string
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  submittedDate: string
  currentStatus?: string
  estimatedCompletion?: string
}

interface CitizenRequestSliderProps {
  title: string
  requests: CitizenRequest[]
  loading?: boolean
}

const mockPendingRequests: CitizenRequest[] = [
  {
    id: 'REQ-2024-001',
    type: 'Land Registration',
    status: 'pending',
    submittedDate: '2024-01-15',
    currentStatus: 'Under Review',
    estimatedCompletion: '2024-01-25'
  },
  {
    id: 'REQ-2024-002',
    type: 'Building Permit',
    status: 'pending',
    submittedDate: '2024-01-14',
    currentStatus: 'Document Verification',
    estimatedCompletion: '2024-01-24'
  },
  {
    id: 'REQ-2024-003',
    type: 'Business License',
    status: 'pending',
    submittedDate: '2024-01-13',
    currentStatus: 'Initial Review',
    estimatedCompletion: '2024-01-23'
  }
]

const mockInProgressRequests: CitizenRequest[] = [
  {
    id: 'REQ-2024-004',
    type: 'Property Tax',
    status: 'in-progress',
    submittedDate: '2024-01-10',
    currentStatus: 'Processing',
    estimatedCompletion: '2024-01-20'
  },
  {
    id: 'REQ-2024-005',
    type: 'Water Connection',
    status: 'in-progress',
    submittedDate: '2024-01-08',
    currentStatus: 'Field Verification',
    estimatedCompletion: '2024-01-18'
  },
  {
    id: 'REQ-2024-006',
    type: 'Trade License',
    status: 'in-progress',
    submittedDate: '2024-01-05',
    currentStatus: 'Final Approval',
    estimatedCompletion: '2024-01-15'
  }
]

const CitizenRequestCard: React.FC<{ request: CitizenRequest }> = ({ request }) => {
  const statusColors = {
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200'
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    'in-progress': <FileText className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />
  }

  return (
    <div className="surface-card-elevated p-6 hover-lift cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {request.id}
          </h4>
          <p className="text-sm text-slate-600 mt-1">{request.type}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
          <div className="flex items-center space-x-1">
            {statusIcons[request.status]}
            <span className="capitalize">
              {request.status === 'in-progress' ? 'In Progress' : request.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Submitted: {request.submittedDate}</span>
        </div>

        {request.currentStatus && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
            <span className="text-sm text-slate-700">Status: {request.currentStatus}</span>
          </div>
        )}

        {request.estimatedCompletion && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              Est. Completion: {request.estimatedCompletion}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CitizenRequestSlider({ 
  title, 
  requests, 
  loading = false 
}: CitizenRequestSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const visibleCards = 3
  const maxIndex = Math.max(0, requests.length - visibleCards)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card-elevated p-6">
              <div className="animate-pulse">
                <div className="skeleton h-4 w-24 rounded mb-4"></div>
                <div className="skeleton h-3 w-32 rounded mb-2"></div>
                <div className="skeleton h-3 w-28 rounded mb-2"></div>
                <div className="skeleton h-3 w-20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="surface-card-elevated p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">No {title.toLowerCase()}</h4>
          <p className="text-sm text-slate-600">
            {title === 'My Pending Requests' 
              ? "You don't have any pending requests at the moment."
              : "You don't have any requests in progress right now."
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {requests.length > visibleCards && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-500">
              {currentIndex + 1}-{Math.min(currentIndex + visibleCards, requests.length)} of {requests.length}
            </span>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` }}
        >
          {requests.map((request) => (
            <div key={request.id} className="flex-none w-full md:w-1/3">
              <CitizenRequestCard request={request} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Pre-configured sliders for specific use cases
export const PendingRequestsSlider: React.FC<{ loading?: boolean }> = ({ loading = false }) => (
  <CitizenRequestSlider 
    title="My Pending Requests" 
    requests={mockPendingRequests} 
    loading={loading}
  />
)

export const InProgressRequestsSlider: React.FC<{ loading?: boolean }> = ({ loading = false }) => (
  <CitizenRequestSlider 
    title="In-Progress Requests" 
    requests={mockInProgressRequests} 
    loading={loading}
  />
)
