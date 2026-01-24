'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, FileText, User, Calendar } from 'lucide-react'

interface Request {
  id: string
  citizenName: string
  type: string
  status: 'pending' | 'working' | 'escalated'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  timeInStatus: string
  slaStatus: 'on-time' | 'delayed' | 'critical'
}

interface RequestSliderProps {
  requests: Request[]
  loading?: boolean
}

const mockRequests: Request[] = [
  {
    id: 'REQ-2024-001',
    citizenName: 'Rajesh Kumar',
    type: 'Land Registration',
    status: 'pending',
    priority: 'high',
    timeInStatus: '2 days',
    slaStatus: 'on-time'
  },
  {
    id: 'REQ-2024-002',
    citizenName: 'Priya Sharma',
    type: 'Building Permit',
    status: 'working',
    priority: 'medium',
    assignedTo: 'Clerk John',
    timeInStatus: '5 days',
    slaStatus: 'delayed'
  },
  {
    id: 'REQ-2024-003',
    citizenName: 'Amit Patel',
    type: 'Business License',
    status: 'escalated',
    priority: 'high',
    assignedTo: 'Section Officer',
    timeInStatus: '8 days',
    slaStatus: 'critical'
  },
  {
    id: 'REQ-2024-004',
    citizenName: 'Sunita Devi',
    type: 'Property Tax',
    status: 'pending',
    priority: 'low',
    timeInStatus: '1 day',
    slaStatus: 'on-time'
  },
  {
    id: 'REQ-2024-005',
    citizenName: 'Mohammed Ali',
    type: 'Water Connection',
    status: 'working',
    priority: 'medium',
    assignedTo: 'Clerk Sarah',
    timeInStatus: '3 days',
    slaStatus: 'on-time'
  }
]

const RequestCard: React.FC<{ request: Request }> = ({ request }) => {
  const statusColors = {
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    working: 'bg-amber-50 text-amber-700 border-amber-200',
    escalated: 'bg-red-50 text-red-700 border-red-200'
  }

  const priorityColors = {
    low: 'bg-gray-50 text-gray-600 border-gray-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    high: 'bg-red-50 text-red-600 border-red-200'
  }

  const slaColors = {
    'on-time': 'text-emerald-600',
    'delayed': 'text-amber-600',
    'critical': 'text-red-600'
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    working: <FileText className="h-4 w-4" />,
    escalated: <AlertTriangle className="h-4 w-4" />
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
            <span className="capitalize">{request.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">{request.citizenName}</span>
        </div>

        {request.assignedTo && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
            <span className="text-sm text-slate-600">Assigned to: {request.assignedTo}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">{request.timeInStatus}</span>
          </div>
          
          <div className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[request.priority]}`}>
            {request.priority.toUpperCase()}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium">SLA Status:</span>
          <span className={`text-sm font-semibold ${slaColors[request.slaStatus]}`}>
            {request.slaStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function RequestSlider({ requests = mockRequests, loading = false }: RequestSliderProps) {
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
          <h3 className="text-lg font-semibold text-slate-900">Request Overview</h3>
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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Request Overview</h3>
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
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` }}
        >
          {requests.map((request) => (
            <div key={request.id} className="flex-none w-full md:w-1/3">
              <RequestCard request={request} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
