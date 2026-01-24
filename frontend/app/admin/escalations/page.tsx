'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, TrendingUp, User, ArrowUp, Calendar } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

interface Escalation {
  id: string
  requestId: string
  requestTitle: string
  requestDescription: string
  slaBreached: boolean
  slaHours: number
  slaDays: number
  actualHours: number
  actualDays: number
  delayHours: number
  delayDays: number
  status: string
  escalatedAt: string
  assignedRole: string
  escalatedTo: string
}

export default function AdminEscalations() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEscalations()
  }, [])

  const loadEscalations = async () => {
    try {
      const response = await api.get('/admin/escalations')
      console.log('Escalations API response:', response.data)
      setEscalations(response.data || [])
    } catch (error) {
      console.error('Failed to load escalations:', error)
      setEscalations([])
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (delayDays: number) => {
    if (delayDays >= 7) return 'bg-red-100 text-red-800'
    if (delayDays >= 3) return 'bg-orange-100 text-orange-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getSeverityText = (delayDays: number) => {
    if (delayDays >= 7) return 'Critical'
    if (delayDays >= 3) return 'High'
    return 'Medium'
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Escalations"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Escalations</h1>
            <p className="text-slate-600">SLA-based automatic escalations.</p>
          </div>
        </div>

        {loading ? (
          <div className="surface-card-elevated p-8">
            <div className="animate-pulse space-y-4">
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-red-600">{escalations.length}</div>
                <div className="text-sm text-slate-600">Total Escalations</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {escalations.filter(e => e.slaBreached).length}
                </div>
                <div className="text-sm text-slate-600">SLA Breaches</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {escalations.reduce((sum, e) => sum + e.delayHours, 0)}
                </div>
                <div className="text-sm text-slate-600">Total Delay Hours</div>
              </div>
              <div className="surface-card-elevated p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(escalations.reduce((sum, e) => sum + e.delayDays, 0) / escalations.length * 10) / 10}
                </div>
                <div className="text-sm text-slate-600">Avg Delay Days</div>
              </div>
            </div>

            {/* Escalations List */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Escalations</h2>
              {escalations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No escalations found. SLAs are being met!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escalations.map((escalation) => (
                    <div key={escalation.id} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-slate-900 mb-2">
                            {escalation.requestTitle}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {escalation.requestDescription}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Escalated: {new Date(escalation.escalatedAt).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              Request ID: {escalation.requestId}
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityColor(escalation.delayDays)}`}>
                          {getSeverityText(escalation.delayDays)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-900">SLA Time</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {escalation.slaHours}h / {escalation.slaDays}d
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-900">Actual Time</span>
                          </div>
                          <div className="text-2xl font-bold text-red-600">
                            {escalation.actualHours}h / {escalation.actualDays}d
                          </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ArrowUp className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-slate-900">Delay</span>
                          </div>
                          <div className="text-2xl font-bold text-red-600">
                            +{escalation.delayHours}h / +{escalation.delayDays}d
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-600">
                            From: <span className="font-medium text-slate-900">{escalation.assignedRole}</span>
                          </span>
                          <span className="text-sm text-slate-600">
                            To: <span className="font-medium text-slate-900">{escalation.escalatedTo}</span>
                          </span>
                        </div>
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          escalation.slaBreached 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {escalation.slaBreached ? 'SLA Breached' : 'SLA Monitor'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
