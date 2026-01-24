'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, FileText, AlertTriangle, User, Calendar, Timer } from 'lucide-react'

interface ClerkTask {
  id: string
  citizenName: string
  requestType: string
  status: 'assigned' | 'working'
  assignedDate: string
  slaHours: number
  hoursElapsed: number
  priority: 'low' | 'medium' | 'high'
  department?: string
}

interface ClerkTaskSliderProps {
  title: string
  tasks: ClerkTask[]
  loading?: boolean
}

const mockAssignedTasks: ClerkTask[] = [
  {
    id: 'REQ-2024-001',
    citizenName: 'Rajesh Kumar',
    requestType: 'Land Registration',
    status: 'assigned',
    assignedDate: '2024-01-15',
    slaHours: 48,
    hoursElapsed: 12,
    priority: 'high',
    department: 'Revenue'
  },
  {
    id: 'REQ-2024-002',
    citizenName: 'Priya Sharma',
    requestType: 'Building Permit',
    status: 'assigned',
    assignedDate: '2024-01-14',
    slaHours: 72,
    hoursElapsed: 24,
    priority: 'medium',
    department: 'Urban Development'
  },
  {
    id: 'REQ-2024-003',
    citizenName: 'Amit Patel',
    requestType: 'Business License',
    status: 'assigned',
    assignedDate: '2024-01-13',
    slaHours: 24,
    hoursElapsed: 8,
    priority: 'low',
    department: 'Commerce'
  }
]

const mockWorkingTasks: ClerkTask[] = [
  {
    id: 'REQ-2024-004',
    citizenName: 'Sunita Devi',
    requestType: 'Property Tax',
    status: 'working',
    assignedDate: '2024-01-10',
    slaHours: 48,
    hoursElapsed: 36,
    priority: 'medium',
    department: 'Revenue'
  },
  {
    id: 'REQ-2024-005',
    citizenName: 'Mohammed Ali',
    requestType: 'Water Connection',
    status: 'working',
    assignedDate: '2024-01-08',
    slaHours: 96,
    hoursElapsed: 72,
    priority: 'high',
    department: 'Public Works'
  },
  {
    id: 'REQ-2024-006',
    citizenName: 'Geeta Singh',
    requestType: 'Trade License',
    status: 'working',
    assignedDate: '2024-01-05',
    slaHours: 72,
    hoursElapsed: 48,
    priority: 'medium',
    department: 'Commerce'
  }
]

const ClerkTaskCard: React.FC<{ task: ClerkTask }> = ({ task }) => {
  const priorityColors = {
    low: 'bg-slate-50 text-slate-600 border-slate-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    high: 'bg-red-50 text-red-600 border-red-200'
  }

  const statusColors = {
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    working: 'bg-amber-50 text-amber-700 border-amber-200'
  }

  const statusIcons = {
    assigned: <FileText className="h-4 w-4" />,
    working: <Clock className="h-4 w-4" />
  }

  const slaProgress = (task.hoursElapsed / task.slaHours) * 100
  const isDelayed = slaProgress > 100
  const isUrgent = slaProgress > 75

  return (
    <div className="surface-card-elevated p-6 hover-lift cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
            {task.id}
          </h4>
          <p className="text-sm text-slate-600 mt-1">{task.requestType}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
            <div className="flex items-center space-x-1">
              {statusIcons[task.status]}
              <span className="capitalize">{task.status}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[task.priority]}`}>
            {task.priority.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">{task.citizenName}</span>
        </div>

        {task.department && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
            <span className="text-sm text-slate-600">{task.department}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-600">Assigned: {task.assignedDate}</span>
        </div>

        {/* SLA Countdown */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">SLA Progress</span>
            </div>
            <span className={`text-sm font-semibold ${
              isDelayed ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {task.hoursElapsed}h / {task.slaHours}h
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isDelayed ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(slaProgress, 100)}%` }}
            ></div>
          </div>
          
          {isDelayed && (
            <div className="mt-2 flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-xs font-medium text-red-600">
                Delayed by {task.hoursElapsed - task.slaHours} hours
              </span>
            </div>
          )}
          
          {isUrgent && !isDelayed && (
            <div className="mt-2 flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">
                {task.slaHours - task.hoursElapsed} hours remaining
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClerkTaskSlider({ 
  title, 
  tasks, 
  loading = false 
}: ClerkTaskSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const visibleCards = 3
  const maxIndex = Math.max(0, tasks.length - visibleCards)

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
                <div className="skeleton h-3 w-20 rounded mb-2"></div>
                <div className="skeleton h-2 w-full rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
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
            You don't have any {title.toLowerCase().replace(' tasks', '')} at the moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {tasks.length > visibleCards && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-500">
              {currentIndex + 1}-{Math.min(currentIndex + visibleCards, tasks.length)} of {tasks.length}
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
          {tasks.map((task) => (
            <div key={task.id} className="flex-none w-full md:w-1/3">
              <ClerkTaskCard task={task} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Pre-configured sliders for specific use cases
export const AssignedTasksSlider: React.FC<{ loading?: boolean }> = ({ loading = false }) => (
  <ClerkTaskSlider 
    title="Assigned Tasks" 
    tasks={mockAssignedTasks} 
    loading={loading}
  />
)

export const WorkingTasksSlider: React.FC<{ loading?: boolean }> = ({ loading = false }) => (
  <ClerkTaskSlider 
    title="Working Tasks" 
    tasks={mockWorkingTasks} 
    loading={loading}
  />
)
