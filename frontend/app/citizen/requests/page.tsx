'use client'

import React, { useState, useEffect } from 'react'
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import CitizenLayout from '@/components/layout/CitizenLayout'
import api from '@/lib/api'

interface Request {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  processId: string
}

interface NewRequest {
  title: string
  description: string
  processId: string
}

export default function CitizenRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [processes, setProcesses] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<NewRequest>({
    title: '',
    description: '',
    processId: ''
  })

  useEffect(() => {
    loadRequests()
    loadProcesses()
  }, [])

  const loadRequests = async () => {
    try {
      const response = await api.get('/citizen/requests')
      console.log('Citizen requests API response:', response.data)
      setRequests(response.data || [])
    } catch (error) {
      console.error('Failed to load requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const loadProcesses = async () => {
    try {
      const response = await api.get('/processes')
      setProcesses(response.data || [])
    } catch (error) {
      console.error('Failed to load processes:', error)
      setProcesses([])
    }
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Creating request:', formData)
      const response = await api.post('/citizen/requests', formData)
      console.log('Create request response:', response.data)
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        processId: ''
      })
      loadRequests()
    } catch (error) {
      console.error('Failed to create request:', error)
    }
  }

  const handleInputChange = (field: keyof NewRequest, value: string) => {
    setFormData({ ...formData, [field]: value })
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

  return (
    <CitizenLayout userId="CITIZEN-001" userName="Citizen User" currentPage="My Requests">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
            <p className="text-slate-600">Submit and track your service requests.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Request</span>
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
            {/* Requests List */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">My Requests</h2>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No requests found. Create your first request!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-slate-900 mb-2">{request.title}</h3>
                          <p className="text-sm text-slate-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {request.processId}
                            </span>
                          </div>
                          <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        {getStatusIcon(request.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Request</h2>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Request Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter request title"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter request description"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Process Type</label>
                  <select
                    value={formData.processId}
                    onChange={(e) => handleInputChange('processId', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Process</option>
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>
                        {process.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CitizenLayout>
  )
}
