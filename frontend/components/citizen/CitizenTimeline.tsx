'use client'

import React from 'react'
import { CheckCircle, Clock, FileText, AlertTriangle, XCircle } from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  status: 'completed' | 'current' | 'pending' | 'delayed' | 'rejected'
  role?: string
}

interface CitizenTimelineProps {
  requestId: string
  events: TimelineEvent[]
  loading?: boolean
}

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'Request Submitted',
    description: 'Land registration application submitted with all required documents',
    date: '2024-01-15',
    time: '10:30 AM',
    status: 'completed',
    role: 'Citizen'
  },
  {
    id: '2',
    title: 'Document Verification',
    description: 'Documents verified by clerk. All documents found to be in order.',
    date: '2024-01-16',
    time: '02:15 PM',
    status: 'completed',
    role: 'Clerk'
  },
  {
    id: '3',
    title: 'Initial Review',
    description: 'Application under review by Section Officer for preliminary approval',
    date: '2024-01-17',
    time: '11:00 AM',
    status: 'current',
    role: 'Section Officer'
  },
  {
    id: '4',
    title: 'Field Verification',
    description: 'Scheduled field verification of property location and boundaries',
    date: '2024-01-19',
    time: '09:00 AM',
    status: 'pending',
    role: 'Field Officer'
  },
  {
    id: '5',
    title: 'Final Approval',
    description: 'Final approval from Head of Department after all verifications',
    date: '2024-01-22',
    time: '03:00 PM',
    status: 'pending',
    role: 'HOD'
  }
]

const TimelineEventCard: React.FC<{ event: TimelineEvent; isLast: boolean }> = ({ event, isLast }) => {
  const statusConfig = {
    completed: {
      icon: <CheckCircle className="h-4 w-4" />,
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-700',
      iconBg: 'bg-emerald-500'
    },
    current: {
      icon: <Clock className="h-4 w-4" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500'
    },
    pending: {
      icon: <Clock className="h-4 w-4" />,
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-300',
      textColor: 'text-slate-600',
      iconBg: 'bg-slate-300'
    },
    delayed: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      iconBg: 'bg-red-500'
    },
    rejected: {
      icon: <XCircle className="h-4 w-4" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      iconBg: 'bg-red-500'
    }
  }

  const config = statusConfig[event.status]

  return (
    <div className="relative flex items-start space-x-4 pb-8">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-slate-200"></div>
      )}
      
      {/* Icon */}
      <div className={`relative z-10 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center border-4 border-white shadow-sm`}>
        <div className="text-white">
          {config.icon}
        </div>
      </div>
      
      {/* Content */}
      <div className={`flex-1 p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-slate-900">{event.title}</h4>
            {event.role && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.textColor} ${config.bgColor}`}>
                {event.role}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{event.date}</p>
            <p className="text-xs text-slate-500">{event.time}</p>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 leading-relaxed">
          {event.description}
        </p>
        
        {event.status === 'current' && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">Currently in progress</span>
          </div>
        )}
        
        {event.status === 'delayed' && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs font-medium text-red-700">Delayed</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CitizenTimeline({ 
  requestId = 'REQ-2024-001',
  events = mockTimelineEvents,
  loading = false 
}: CitizenTimelineProps) {
  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Request Timeline</h3>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="skeleton h-12 w-12 rounded-full"></div>
              <div className="flex-1">
                <div className="skeleton h-4 w-32 rounded mb-2"></div>
                <div className="skeleton h-3 w-48 rounded mb-2"></div>
                <div className="skeleton h-3 w-24 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Request Timeline</h3>
        <div className="text-sm text-slate-500">
          Request ID: {requestId}
        </div>
      </div>
      
      <div className="space-y-0">
        {events.map((event, index) => (
          <TimelineEventCard 
            key={event.id} 
            event={event} 
            isLast={index === events.length - 1}
          />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Transparency Note</h4>
            <p className="text-sm text-blue-700">
              This timeline shows the complete progress of your request. Each step is updated in real-time by the responsible department.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
