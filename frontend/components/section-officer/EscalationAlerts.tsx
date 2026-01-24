'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight,
  Eye,
  MessageSquare,
  CheckCircle
} from 'lucide-react'

interface EscalationAlert {
  id: string
  requestId: string
  citizenName: string
  requestType: string
  escalationLevel: 1 | 2 | 3
  reason: string
  escalatedBy: string
  escalatedDate: string
  timeSinceEscalation: string
  department: string
  status: 'pending' | 'acknowledged' | 'resolved'
}

interface EscalationAlertsProps {
  alerts: EscalationAlert[]
  loading?: boolean
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
  onView?: (alertId: string) => void
}


const EscalationCard: React.FC<{
  alert: EscalationAlert
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
  onView?: (alertId: string) => void
}> = ({ alert, onAcknowledge, onResolve, onView }) => {
  const levelColors = {
    1: 'bg-amber-50 text-amber-700 border-amber-200',
    2: 'bg-orange-50 text-orange-700 border-orange-200',
    3: 'bg-red-50 text-red-700 border-red-200'
  }

  const statusColors = {
    pending: 'bg-red-50 text-red-700 border-red-200',
    acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  const levelIcons = {
    1: <AlertTriangle className="h-4 w-4" />,
    2: <AlertTriangle className="h-4 w-4" />,
    3: <AlertTriangle className="h-4 w-4" />
  }

  const statusIcons = {
    pending: <Clock className="h-3 w-3" />,
    acknowledged: <Eye className="h-3 w-3" />,
    resolved: <CheckCircle className="h-3 w-3" />
  }

  return (
    <div className="surface-card-elevated p-6 hover-lift border-l-4 border-l-red-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${levelColors[alert.escalationLevel]}`}>
            {levelIcons[alert.escalationLevel]}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{alert.requestId}</h4>
            <p className="text-sm text-slate-600">{alert.requestType}</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${levelColors[alert.escalationLevel]}`}>
            Level {alert.escalationLevel}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[alert.status]}`}>
            <div className="flex items-center space-x-1">
              {statusIcons[alert.status]}
              <span className="capitalize">{alert.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-700">{alert.citizenName}</span>
          <span className="text-xs text-slate-500">• {alert.department}</span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Escalation Reason</span>
          </div>
          <p className="text-sm text-slate-600">{alert.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-slate-500">Escalated by</p>
              <p className="text-slate-700">{alert.escalatedBy}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-slate-500">Time since escalation</p>
              <p className="text-slate-700">{alert.timeSinceEscalation}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Escalated on:</span>
            <span className="text-sm text-slate-700">{alert.escalatedDate}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView?.(alert.id)}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center space-x-1"
            >
              <Eye className="h-3 w-3" />
              <span>View</span>
            </button>
            
            {alert.status === 'pending' && (
              <button
                onClick={() => onAcknowledge?.(alert.id)}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1"
              >
                <Eye className="h-3 w-3" />
                <span>Acknowledge</span>
              </button>
            )}
            
            {alert.status !== 'resolved' && (
              <button
                onClick={() => onResolve?.(alert.id)}
                className="btn-success text-xs px-3 py-1.5 flex items-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Resolve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EscalationAlerts({ 
  alerts = [],
  loading = false,
  onAcknowledge,
  onResolve,
  onView
}: EscalationAlertsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged' | 'resolved'>('all')

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.status === filter
  })

  const pendingCount = alerts.filter(a => a.status === 'pending').length
  const criticalCount = alerts.filter(a => a.escalationLevel === 3).length

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Escalation Alerts</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card-elevated p-6">
              <div className="animate-pulse">
                <div className="skeleton h-4 w-32 rounded mb-4"></div>
                <div className="skeleton h-3 w-48 rounded mb-2"></div>
                <div className="skeleton h-3 w-40 rounded"></div>
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
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Escalation Alerts</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600">{pendingCount} pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-sm text-slate-600">{criticalCount} critical</span>
            </div>
          </div>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="input text-sm w-32"
        >
          <option value="all">All Alerts</option>
          <option value="pending">Pending</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">No {filter === 'all' ? '' : filter} escalations</h4>
          <p className="text-sm text-slate-600">
            {filter === 'all' 
              ? "No escalation alerts at the moment."
              : `No ${filter} escalations found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <EscalationCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}
