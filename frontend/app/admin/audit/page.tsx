'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, Shield, Clock, User, AlertTriangle, CheckCircle, Settings, FileText, Key, UserCheck } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

interface AuditLog {
  id: string
  action: string
  entity: string
  description: string
  performedBy: string
  performedAt: string
  ipAddress: string
  userAgent: string
}

export default function AdminAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs')
      console.log('Admin audit logs API response:', response.data)
      setAuditLogs(response.data || [])
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'USER_CREATED': return 'bg-green-100 text-green-800'
      case 'USER_ROLE_UPDATED': return 'bg-blue-100 text-blue-800'
      case 'PASSWORD_RESET': return 'bg-yellow-100 text-yellow-800'
      case 'REQUEST_CREATED': return 'bg-purple-100 text-purple-800'
      case 'SLA_BREACH': return 'bg-red-100 text-red-800'
      case 'PROCESS_CONFIGURED': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_CREATED': return <UserCheck className="h-4 w-4" />
      case 'USER_ROLE_UPDATED': return <User className="h-4 w-4" />
      case 'PASSWORD_RESET': return <Key className="h-4 w-4" />
      case 'REQUEST_CREATED': return <FileText className="h-4 w-4" />
      case 'SLA_BREACH': return <AlertTriangle className="h-4 w-4" />
      case 'PROCESS_CONFIGURED': return <Settings className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === 'all' || log.action === filterAction
    const matchesEntity = filterEntity === 'all' || log.entity === filterEntity
    return matchesSearch && matchesAction && matchesEntity
  })

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Action', 'Entity', 'Description', 'Performed By', 'Performed At', 'IP Address', 'User Agent'],
      ...filteredLogs.map(log => [
        log.id,
        log.action,
        log.entity,
        log.description,
        log.performedBy,
        new Date(log.performedAt).toLocaleString(),
        log.ipAddress,
        log.userAgent
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Audit & Compliance"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
            <p className="text-slate-600">View and export system audit logs.</p>
          </div>
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
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
            {/* Filters */}
            <div className="surface-card-elevated p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search logs by action or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="all">All Actions</option>
                  <option value="USER_CREATED">User Created</option>
                  <option value="USER_ROLE_UPDATED">Role Updated</option>
                  <option value="PASSWORD_RESET">Password Reset</option>
                  <option value="REQUEST_CREATED">Request Created</option>
                  <option value="SLA_BREACH">SLA Breach</option>
                  <option value="PROCESS_CONFIGURED">Process Configured</option>
                </select>
                <select
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="all">All Entities</option>
                  <option value="User">User</option>
                  <option value="Request">Request</option>
                  <option value="Process">Process</option>
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="surface-card-elevated">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">System Audit Logs ({filteredLogs.length})</h2>
                <div className="text-sm text-slate-500">
                  {searchTerm && `Searching: "${searchTerm}"`}
                  {filterAction !== 'all' && `Filtered by action: ${filterAction}`}
                  {filterEntity !== 'all' && `Filtered by entity: ${filterEntity}`}
                </div>
              </div>
              
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No audit logs found matching your criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Action</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Entity</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Description</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Performed By</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Performed At</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">IP Address</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">User Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3 px-6">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                                {getActionIcon(log.action)}
                                <span className="ml-2">{log.action}</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {log.entity}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-sm text-slate-900">{log.description}</td>
                          <td className="py-3 px-6 text-sm text-slate-900">{log.performedBy}</td>
                          <td className="py-3 px-6 text-sm text-slate-900">{new Date(log.performedAt).toLocaleString()}</td>
                          <td className="py-3 px-6 text-sm text-slate-900">{log.ipAddress}</td>
                          <td className="py-3 px-6 text-sm text-slate-900">{log.userAgent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
