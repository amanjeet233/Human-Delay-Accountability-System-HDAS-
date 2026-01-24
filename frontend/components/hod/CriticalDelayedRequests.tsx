'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, User, Calendar, Timer, ArrowRight } from 'lucide-react'

interface CriticalDelayedRequest {
  id: string
  citizenName: string
  requestType: string
  submittedDate: string
  delayDays: number
  originalSLA: number
  currentSLA: number
  department: string
  sectionOfficerName: string
  escalationLevel: 1 | 2 | 3
  lastAction: string
  lastActionDate: string
  delayReason?: string
}

interface CriticalDelayedRequestsProps {
  requests: CriticalDelayedRequest[]
  loading?: boolean
  onView?: (requestId: string) => void
  onEscalate?: (requestId: string) => void
}

const mockCriticalRequests: CriticalDelayedRequest[] = [
  {
    id: 'REQ-2024-021',
    citizenName: 'Ramesh Kumar',
    requestType: 'Land Registration',
    submittedDate: '2024-01-05',
    delayDays: 12,
    originalSLA: 7,
    currentSLA: 19,
    department: 'Revenue',
    sectionOfficerName: 'Robert Johnson',
    escalationLevel: 2,
    lastAction: 'Escalated to HOD',
    lastActionDate: '2024-01-14',
    delayReason: 'Missing ownership documents'
  },
  {
    id: 'REQ-2024-022',
    citizenName: 'Anita Sharma',
    requestType: 'Building Permit',
    submittedDate: '2024-01-08',
    delayDays: 8,
    originalSLA: 10,
    currentSLA: 18,
    department: 'Urban Development',
    sectionOfficerName: 'Sarah Williams',
    escalationLevel: 1,
    lastAction: 'Document verification pending',
    lastActionDate: '2024-01-12',
    delayReason: 'Additional site inspection required'
  },
  {
    id: 'REQ-2024-023',
    citizenName: 'Vikram Singh',
    requestType: 'Business License',
    submittedDate: '2024-01-02',
    delayDays: 15,
    originalSLA: 5,
    currentSLA: 20,
    department: 'Commerce',
    sectionOfficerName: 'Michael Chen',
    escalationLevel: 3,
    lastAction: 'Citizen complaint received',
    lastActionDate: '2024-01-15',
    delayReason: 'Critical delay - citizen escalated to ministry'
  },
  {
    id: 'REQ-2024-024',
    citizenName: 'Meera Patel',
    requestType: 'Property Tax Assessment',
    submittedDate: '2024-01-10',
    delayDays: 6,
    originalSLA: 3,
    currentSLA: 9,
    department: 'Revenue',
    sectionOfficerName: 'Emily Davis',
    escalationLevel: 1,
    lastAction: 'Awaiting senior officer review',
    lastActionDate: '2024-01-13',
    delayReason: 'Complex property valuation required'
  },
  {
    id: 'REQ-2024-025',
    citizenName: 'Suresh Babu',
    requestType: 'Water Connection',
    submittedDate: '2024-01-12',
    delayDays: 4,
    originalSLA: 7,
    currentSLA: 11,
    department: 'Public Works',
    sectionOfficerName: 'David Wilson',
    escalationLevel: 1,
    lastAction: 'Technical team assigned',
    lastActionDate: '2024-01-14',
    delayReason: 'Infrastructure constraints'
  }
]

const CriticalDelayCard: React.FC<{ 
  request: CriticalDelayedRequest
  onView?: (requestId: string) => void
  onEscalate?: (requestId: string) => void
}> = ({ request, onView, onEscalate }) => {
  const levelColors = {
    1: 'bg-amber-50 text-amber-700 border-amber-200',
    2: 'bg-orange-50 text-orange-700 border-orange-200',
    3: 'bg-red-50 text-red-700 border-red-200'
  }

  const urgencyLevel = () => {
    if (request.delayDays > 14) return { level: 'critical', color: 'bg-red-500', label: 'CRITICAL' }
    if (request.delayDays > 7) return { level: 'severe', color: 'bg-orange-500', label: 'SEVERE' }
    return { level: 'high', color: 'bg-amber-500', label: 'HIGH' }
  }

  const urgency = urgencyLevel()

  return (
    <div className={`surface-card-elevated p-6 hover-lift cursor-pointer border-l-4 ${urgency.color} border-l-opacity-100`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {request.id}
          </h4>
          <p className="text-sm text-slate-600 mt-1">{request.requestType}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${levelColors[request.escalationLevel]}`}>
            Level {request.escalationLevel}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${urgency.color}`}>
            {urgency.label}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">{request.citizenName}</span>
          <span className="text-xs text-slate-500">• {request.department}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600">RJ</span>
          </div>
          <span className="text-sm text-slate-600">{request.sectionOfficerName}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Submitted: {request.submittedDate}</span>
        </div>

        {/* Delay Information */}
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Delay Information</span>
            </div>
            <span className="text-lg font-bold text-red-600">
              {request.delayDays} days
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-red-600">Original SLA: {request.originalSLA} days</p>
              <p className="text-red-700 font-medium">Current: {request.currentSLA} days</p>
            </div>
            <div>
              <p className="text-red-600">Overdue by: {request.delayDays - request.originalSLA} days</p>
              <p className="text-red-700 font-medium">{((request.delayDays / request.originalSLA) * 100).toFixed(0)}% delay</p>
            </div>
          </div>
        </div>

        {request.delayReason && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Delay Reason</span>
            </div>
            <p className="text-sm text-amber-700">{request.delayReason}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Last Action: {request.lastAction} ({request.lastActionDate})
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView?.(request.id)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Review Details →
            </button>
            
            {request.escalationLevel < 3 && (
              <button
                onClick={() => onEscalate?.(request.id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Escalate →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CriticalDelayedRequests({ 
  requests = mockCriticalRequests,
  loading = false,
  onView,
  onEscalate
}: CriticalDelayedRequestsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const visibleCards = 3
  const maxIndex = Math.max(0, requests.length - visibleCards)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const criticalCount = requests.filter(req => req.delayDays > 14).length
  const severeCount = requests.filter(req => req.delayDays > 7 && req.delayDays <= 14).length
  const highCount = requests.filter(req => req.delayDays <= 7).length

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Critical Delayed Requests</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card-elevated p-6">
              <div className="animate-pulse">
                <div className="skeleton h-4 w-24 rounded mb-4"></div>
                <div className="skeleton h-3 w-32 rounded mb-2"></div>
                <div className="skeleton h-3 w-28 rounded mb-2"></div>
                <div className="skeleton h-2 w-full rounded"></div>
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
          <h3 className="text-lg font-semibold text-slate-900">Critical Delayed Requests</h3>
        </div>
        <div className="surface-card-elevated p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">No critical delays</h4>
          <p className="text-sm text-slate-600">
            All requests are within acceptable delay limits.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Critical Delayed Requests</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-sm text-slate-600">{criticalCount} critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-slate-600">{severeCount} severe</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-slate-600">{highCount} high</span>
            </div>
          </div>
        </div>
        
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
              <CriticalDelayCard 
                request={request} 
                onView={onView}
                onEscalate={onEscalate}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
