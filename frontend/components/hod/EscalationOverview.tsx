'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock,
  Calendar,
  ArrowUpRight,
  CheckCircle,
  Eye
} from 'lucide-react'

interface EscalationStats {
  totalEscalations: number
  pendingEscalations: number
  resolvedEscalations: number
  avgResolutionTime: number
  escalationRate: number
  trendPercentage: number
}

interface EscalationOverviewProps {
  stats?: EscalationStats
  loading?: boolean
}

const mockStats: EscalationStats = {
  totalEscalations: 24,
  pendingEscalations: 8,
  resolvedEscalations: 16,
  avgResolutionTime: 2.5,
  escalationRate: 12.5,
  trendPercentage: -15.2
}

interface EscalationTrend {
  period: string
  escalations: number
  resolved: number
  avgTime: number
}

const mockTrendData: EscalationTrend[] = [
  { period: 'Week 1', escalations: 8, resolved: 6, avgTime: 3.2 },
  { period: 'Week 2', escalations: 12, resolved: 10, avgTime: 2.8 },
  { period: 'Week 3', escalations: 6, resolved: 8, avgTime: 2.1 },
  { period: 'Week 4', escalations: 10, resolved: 12, avgTime: 2.5 }
]

interface RecentEscalation {
  id: string
  requestId: string
  citizenName: string
  requestType: string
  escalationLevel: 1 | 2 | 3
  escalatedDate: string
  status: 'pending' | 'resolved'
  resolutionTime?: number
}

const mockRecentEscalations: RecentEscalation[] = [
  {
    id: 'ESC-001',
    requestId: 'REQ-2024-018',
    citizenName: 'Priya Sharma',
    requestType: 'Building Permit',
    escalationLevel: 2,
    escalatedDate: '2024-01-16',
    status: 'pending'
  },
  {
    id: 'ESC-002',
    requestId: 'REQ-2024-019',
    citizenName: 'Amit Kumar',
    requestType: 'Business License',
    escalationLevel: 1,
    escalatedDate: '2024-01-15',
    status: 'resolved',
    resolutionTime: 1.5
  },
  {
    id: 'ESC-003',
    requestId: 'REQ-2024-020',
    citizenName: 'Sunita Devi',
    requestType: 'Land Registration',
    escalationLevel: 3,
    escalatedDate: '2024-01-14',
    status: 'resolved',
    resolutionTime: 4.2
  }
]

const StatCard: React.FC<{
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'emerald' | 'amber' | 'red' | 'blue'
  trend?: number
  loading?: boolean
}> = ({ title, value, subtitle, icon, color, trend, loading = false }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200'
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <div className="animate-pulse">
          <div className="skeleton h-4 w-24 rounded mb-4"></div>
          <div className="skeleton h-8 w-16 rounded mb-2"></div>
          <div className="skeleton h-3 w-20 rounded"></div>
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
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
        
        {trend !== undefined && (
          <div className="flex items-center space-x-1">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-red-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-emerald-500" />
            )}
            <span className={`text-sm font-medium ${
              trend > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-slate-500">vs last period</span>
          </div>
        )}
      </div>
    </div>
  )
}

const RecentEscalationCard: React.FC<{ escalation: RecentEscalation }> = ({ escalation }) => {
  const levelColors = {
    1: 'bg-amber-50 text-amber-700 border-amber-200',
    2: 'bg-orange-50 text-orange-700 border-orange-200',
    3: 'bg-red-50 text-red-700 border-red-200'
  }

  const statusColors = {
    pending: 'bg-red-50 text-red-700 border-red-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-8 rounded-full ${
          escalation.escalationLevel === 3 ? 'bg-red-500' :
          escalation.escalationLevel === 2 ? 'bg-orange-500' : 'bg-amber-500'
        }`}></div>
        <div>
          <p className="font-medium text-slate-900">{escalation.requestId}</p>
          <p className="text-sm text-slate-600">{escalation.citizenName} • {escalation.requestType}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className={`px-2 py-1 rounded text-xs font-medium border ${levelColors[escalation.escalationLevel]}`}>
            Level {escalation.escalationLevel}
          </div>
          <p className="text-xs text-slate-500 mt-1">{escalation.escalatedDate}</p>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[escalation.status]}`}>
          {escalation.status === 'resolved' ? (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Resolved</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Pending</span>
            </div>
          )}
        </div>
        
        {escalation.resolutionTime && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Resolution Time</p>
            <p className="text-sm font-medium text-slate-700">{escalation.resolutionTime} days</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EscalationOverview({ 
  stats = mockStats,
  loading = false 
}: EscalationOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Escalation Statistics */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Escalations"
            value={stats.totalEscalations}
            subtitle="This month"
            icon={<AlertTriangle className="h-5 w-5" />}
            color="red"
            trend={stats.trendPercentage}
            loading={loading}
          />
          
          <StatCard
            title="Pending Escalations"
            value={stats.pendingEscalations}
            subtitle="Awaiting resolution"
            icon={<Clock className="h-5 w-5" />}
            color="amber"
            loading={loading}
          />
          
          <StatCard
            title="Resolved Escalations"
            value={stats.resolvedEscalations}
            subtitle="Successfully handled"
            icon={<CheckCircle className="h-5 w-5" />}
            color="emerald"
            loading={loading}
          />
          
          <StatCard
            title="Avg Resolution Time"
            value={`${stats.avgResolutionTime} days`}
            subtitle="Time to resolve"
            icon={<TrendingDown className="h-5 w-5" />}
            color="blue"
            loading={loading}
          />
        </div>
      </section>

      {/* Escalation Rate */}
      <section>
        <div className="surface-card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Department Escalation Rate</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Current Rate:</span>
              <span className={`text-lg font-bold ${
                stats.escalationRate > 15 ? 'text-red-600' : 
                stats.escalationRate > 10 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {stats.escalationRate}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Requests Processed</p>
                  <p className="text-xl font-bold text-slate-900">192</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Escalated Requests</p>
                  <p className="text-xl font-bold text-red-600">{stats.totalEscalations}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Monthly Target</p>
                  <p className="text-xs text-slate-500">Keep escalation rate below 10%</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats.escalationRate <= 10 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {stats.escalationRate <= 10 ? 'On Target' : 'Above Target'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Escalations */}
      <section>
        <div className="surface-card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Escalations</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {mockRecentEscalations.map((escalation) => (
              <RecentEscalationCard key={escalation.id} escalation={escalation} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
