'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, User, Calendar, Timer } from 'lucide-react'

interface NearSLARequest {
  id: string
  citizenName: string
  requestType: string
  submittedDate: string
  timeElapsed: number
  slaHours: number
  department: string
  clerkName: string
  priority: 'low' | 'medium' | 'high'
}

interface NearSLABreachSliderProps {
  requests: NearSLARequest[]
  loading?: boolean
  onView?: (requestId: string) => void
}


const NearSLACard: React.FC<{ 
  request: NearSLARequest
  onView?: (requestId: string) => void 
}> = ({ request, onView }) => {
  const slaProgress = (request.timeElapsed / request.slaHours) * 100
  const hoursRemaining = request.slaHours - request.timeElapsed
  const isCritical = slaProgress > 90
  const isUrgent = slaProgress > 75

  const priorityColors = {
    low: 'bg-slate-50 text-slate-600 border-slate-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    high: 'bg-red-50 text-red-600 border-red-200'
  }

  const urgencyColors = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200'
  }

  const getUrgencyLevel = () => {
    if (isCritical) return { level: 'critical', color: urgencyColors.critical, label: 'Critical' }
    if (isUrgent) return { level: 'urgent', color: urgencyColors.urgent, label: 'Urgent' }
    return { level: 'normal', color: urgencyColors.normal, label: 'Near SLA' }
  }

  const urgency = getUrgencyLevel()

  return (
    <div className={`surface-card-elevated p-6 hover-lift cursor-pointer group border-l-4 ${
      isCritical ? 'border-l-red-500' : isUrgent ? 'border-l-amber-500' : 'border-l-blue-500'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {request.id}
          </h4>
          <p className="text-sm text-slate-600 mt-1">{request.requestType}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${urgency.color}`}>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{urgency.label}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[request.priority]}`}>
            {request.priority.toUpperCase()}
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
            <span className="text-xs font-medium text-slate-600">JS</span>
          </div>
          <span className="text-sm text-slate-600">{request.clerkName}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Submitted: {request.submittedDate}</span>
        </div>

        {/* SLA Progress */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">SLA Status</span>
            </div>
            <span className={`text-sm font-semibold ${
              isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'
            }`}>
              {hoursRemaining > 0 ? `${hoursRemaining}h left` : 'Overdue'}
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCritical ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(slaProgress, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">
              {request.timeElapsed}h / {request.slaHours}h
            </span>
            <span className={`text-xs font-medium ${
              isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'
            }`}>
              {slaProgress.toFixed(1)}% used
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() => onView?.(request.id)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Review Request →
          </button>
          
          {isCritical && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-red-600">Immediate Action Required</span>
            </div>
          )}
          
          {isUrgent && !isCritical && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-medium text-amber-600">Priority Review</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NearSLABreachSlider({ 
  requests = [],
  loading = false,
  onView
}: NearSLABreachSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const visibleCards = 3
  const maxIndex = Math.max(0, requests.length - visibleCards)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const criticalCount = requests.filter(req => (req.timeElapsed / req.slaHours) > 0.9).length
  const urgentCount = requests.filter(req => (req.timeElapsed / req.slaHours) > 0.75).length

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Requests Near SLA Breach</h3>
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
          <h3 className="text-lg font-semibold text-slate-900">Requests Near SLA Breach</h3>
        </div>
        <div className="surface-card-elevated p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Timer className="h-8 w-8 text-emerald-500" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">All requests within SLA</h4>
          <p className="text-sm text-slate-600">
            No requests are currently approaching their SLA deadline.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Requests Near SLA Breach</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600">{criticalCount} critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-slate-600">{urgentCount} urgent</span>
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
              <NearSLACard request={request} onView={onView} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
