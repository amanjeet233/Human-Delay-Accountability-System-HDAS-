'use client'

import React from 'react'
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Flag,
  BarChart3
} from 'lucide-react'

interface AdminKPICardsProps {
  totalRequests: number
  pendingRequests: number
  inProgressRequests: number
  delayedRequests: number
  escalatedRequests: number
  onTimePercentage: number
  loading?: boolean
}

interface AdminKPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  color: 'blue' | 'green' | 'yellow' | 'red' | 'slate' | 'purple'
  loading?: boolean
  subtitle?: string
}

const AdminKPICard: React.FC<AdminKPICardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'neutral',
  color,
  loading = false,
  subtitle
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  }

  const changeColorClasses = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-600'
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-8 w-8 rounded-lg"></div>
          </div>
          <div className="skeleton h-8 w-16 rounded mb-2"></div>
          <div className="skeleton h-3 w-20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated p-6 hover-lift group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
          {value}
        </p>
        
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
        
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            <span className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-slate-500">from last period</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminKPICards({ 
  totalRequests, 
  pendingRequests, 
  inProgressRequests, 
  delayedRequests, 
  escalatedRequests,
  onTimePercentage,
  loading = false 
}: AdminKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      <AdminKPICard
        title="Total Requests"
        value={totalRequests.toLocaleString()}
        icon={<FileText className="h-4 w-4" />}
        color="slate"
        loading={loading}
      />
      
      <AdminKPICard
        title="Pending"
        value={pendingRequests.toLocaleString()}
        icon={<Clock className="h-4 w-4" />}
        change={pendingRequests > 0 ? 8 : -12}
        changeType={pendingRequests > 0 ? 'negative' : 'positive'}
        color="blue"
        loading={loading}
      />
      
      <AdminKPICard
        title="In Progress"
        value={inProgressRequests.toLocaleString()}
        icon={<TrendingUp className="h-4 w-4" />}
        change={inProgressRequests > 0 ? 5 : -3}
        changeType={inProgressRequests > 0 ? 'positive' : 'negative'}
        color="yellow"
        loading={loading}
      />
      
      <AdminKPICard
        title="Delayed"
        value={delayedRequests.toLocaleString()}
        icon={<AlertTriangle className="h-4 w-4" />}
        change={delayedRequests > 0 ? -15 : 0}
        changeType={delayedRequests > 0 ? 'negative' : 'positive'}
        color="red"
        loading={loading}
      />
      
      <AdminKPICard
        title="Escalated"
        value={escalatedRequests.toLocaleString()}
        icon={<Flag className="h-4 w-4" />}
        change={escalatedRequests > 0 ? -5 : 0}
        changeType={escalatedRequests > 0 ? 'negative' : 'positive'}
        color="purple"
        loading={loading}
      />
      
      <AdminKPICard
        title="On-Time %"
        value={`${onTimePercentage}%`}
        icon={<CheckCircle className="h-4 w-4" />}
        change={onTimePercentage >= 90 ? 3 : -2}
        changeType={onTimePercentage >= 90 ? 'positive' : 'negative'}
        color={onTimePercentage >= 90 ? 'green' : 'yellow'}
        loading={loading}
        subtitle="Performance Rate"
      />
    </div>
  )
}
