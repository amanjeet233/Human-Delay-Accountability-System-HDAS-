'use client'

import React, { useState, useEffect } from 'react'
import { Plus, FileText, Search, Filter, MoreVertical, Eye, Edit, Trash2, UserCheck, Key, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

interface Request {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  processId: string
  createdBy: string
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProcess, setFilterProcess] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const response = await api.get('/requests/all')
      console.log('Admin requests API response:', response.data)
      setRequests(response.data || [])
    } catch (error) {
      console.error('Failed to load requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'SUBMITTED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS': return <AlertCircle className="h-4 w-4" />
      case 'SUBMITTED': return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus
    const matchesProcess = filterProcess === 'all' || req.processId === filterProcess
    return matchesSearch && matchesStatus && matchesProcess
  })

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="All Requests"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Requests</h1>
            <p className="text-slate-600">View and manage all system requests.</p>
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
            {/* Filters */}
            <div className="surface-card-elevated p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search requests by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <select
                  value={filterProcess}
                  onChange={(e) => setFilterProcess(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="all">All Processes</option>
                  <option value="proc-1">Land Registration</option>
                  <option value="proc-2">Certificate Issuance</option>
                </select>
              </div>
            </div>

            {/* Requests Table */}
            <div className="surface-card-elevated">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">System Requests ({filteredRequests.length})</h2>
                <div className="text-sm text-slate-500">
                  {searchTerm && `Searching: "${searchTerm}"`}
                  {filterStatus !== 'all' && `Filtered by status: ${filterStatus}`}
                  {filterProcess !== 'all' && `Filtered by process: ${filterProcess}`}
                </div>
              </div>
              
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No requests found matching your criteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Request</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Process</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Created By</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Created At</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Status</th>
                        <th className="text-left py-3 px-6 font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-slate-50">
                          <td className="py-3 px-6">
                            <div>
                              <h3 className="text-lg font-medium text-slate-900">{request.title}</h3>
                              <p className="text-sm text-slate-600">{request.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {request.processId}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-sm text-slate-900">{request.createdBy}</td>
                          <td className="py-3 px-6 text-sm text-slate-900">{new Date(request.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-6">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedRequest(request)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  // Mock action - in real implementation, this would open edit modal or navigate
                                  console.log('Edit request:', request.id)
                                }}
                                className="text-slate-500 hover:text-slate-700"
                                title="Edit Request"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this request?')) {
                                    console.log('Deleting request:', request.id)
                                    // Mock delete
                                    setRequests(requests.filter(r => r.id !== request.id))
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Request"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
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
