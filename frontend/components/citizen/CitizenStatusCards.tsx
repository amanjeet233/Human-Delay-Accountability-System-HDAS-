'use client'

import React from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle
} from 'lucide-react'

interface CitizenStatusCardsProps {
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  loading?: boolean
}

interface StatusCardProps {
  title: string
  count: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red'
  loading?: boolean
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  count, 
  icon, 
  color,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-4 w-20 rounded"></div>
            <div className="skeleton h-8 w-8 rounded-lg"></div>
          </div>
          <div className="skeleton h-8 w-12 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <p className="text-3xl font-bold text-slate-900">
        {count.toLocaleString()}
      </p>
      
      <p className="text-sm text-slate-500 mt-1">
        {count === 1 ? 'request' : 'requests'}
      </p>
    </div>
  )
}

export default function CitizenStatusCards({ 
  pendingCount, 
  approvedCount, 
  rejectedCount,
  loading = false 
}: CitizenStatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatusCard
        title="Pending"
        count={pendingCount}
        icon={<Clock className="h-5 w-5" />}
        color="blue"
        loading={loading}
      />
      
      <StatusCard
        title="Approved"
        count={approvedCount}
        icon={<CheckCircle className="h-5 w-5" />}
        color="green"
        loading={loading}
      />
      
      <StatusCard
        title="Rejected"
        count={rejectedCount}
        icon={<XCircle className="h-5 w-5" />}
        color="red"
        loading={loading}
      />
    </div>
  )
}
