'use client'

import React from 'react'
import { 
  FileText, 
  Clock, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

interface ClerkKPICardsProps {
  assignedCount: number
  pendingCount: number
  delayedCount: number
  loading?: boolean
}

interface ClerkKPICardProps {
  title: string
  count: number
  icon: React.ReactNode
  color: 'blue' | 'amber' | 'red'
  subtitle?: string
  loading?: boolean
}

const ClerkKPICard: React.FC<ClerkKPICardProps> = ({ 
  title, 
  count, 
  icon, 
  color,
  subtitle,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
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
      
      <p className="text-3xl font-bold text-slate-900 mb-2">
        {count.toLocaleString()}
      </p>
      
      {subtitle && (
        <p className="text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  )
}

export default function ClerkKPICards({ 
  assignedCount, 
  pendingCount, 
  delayedCount,
  loading = false 
}: ClerkKPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <ClerkKPICard
        title="Assigned Tasks"
        count={assignedCount}
        icon={<FileText className="h-5 w-5" />}
        color="blue"
        subtitle="Total assigned to you"
        loading={loading}
      />
      
      <ClerkKPICard
        title="Pending Review"
        count={pendingCount}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
        subtitle="Awaiting your action"
        loading={loading}
      />
      
      <ClerkKPICard
        title="Delayed Tasks"
        count={delayedCount}
        icon={<AlertTriangle className="h-5 w-5" />}
        color="red"
        subtitle="Beyond SLA timeline"
        loading={loading}
      />
    </div>
  )
}
