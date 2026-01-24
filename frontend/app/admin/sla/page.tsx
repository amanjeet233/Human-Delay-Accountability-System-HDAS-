'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Save, Clock, Settings } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

interface SLA {
  id: string
  processStep: string
  processStepName: string
  allowedHours: number
  allowedDays: number
  active: boolean
  createdAt: string
}

interface SLAFormData {
  processStep: string
  processStepName: string
  allowedHours: string
  allowedDays: string
}

export default function AdminSLA() {
  const [slas, setSLAs] = useState<SLA[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<SLAFormData>({
    processStep: '',
    processStepName: '',
    allowedHours: '',
    allowedDays: ''
  })

  useEffect(() => {
    loadSLAs()
  }, [])

  const loadSLAs = async () => {
    try {
      const response = await api.get('/admin/sla')
      console.log('SLAs API response:', response.data)
      setSLAs(response.data || [])
    } catch (error) {
      console.error('Failed to load SLAs:', error)
      setSLAs([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSLA = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Creating SLA:', formData)
      const response = await api.post('/admin/sla', {
        processStep: formData.processStep,
        processStepName: formData.processStepName,
        allowedHours: parseInt(formData.allowedHours),
        allowedDays: parseInt(formData.allowedDays)
      })
      console.log('Create SLA response:', response.data)
      setShowCreateModal(false)
      setFormData({
        processStep: '',
        processStepName: '',
        allowedHours: '',
        allowedDays: ''
      })
      loadSLAs()
    } catch (error) {
      console.error('Failed to create SLA:', error)
    }
  }

  const handleInputChange = (field: keyof SLAFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="SLA Management"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SLA Management</h1>
            <p className="text-slate-600">Configure Service Level Agreements per workflow step.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create SLA</span>
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
            {/* SLAs List */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Existing SLAs</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-slate-900">Process Step</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-900">Step Name</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-900">Allowed Hours</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-900">Allowed Days</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {slas.map((sla) => (
                      <tr key={sla.id} className="hover:bg-slate-50">
                        <td className="py-3 px-6 text-sm text-slate-900">{sla.processStep}</td>
                        <td className="py-3 px-6 text-sm text-slate-900">{sla.processStepName}</td>
                        <td className="py-3 px-6 text-sm text-slate-900">{sla.allowedHours}h</td>
                        <td className="py-3 px-6 text-sm text-slate-900">{sla.allowedDays} days</td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sla.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {sla.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create SLA Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New SLA</h2>
              <form onSubmit={handleCreateSLA} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Process Step Number</label>
                  <select
                    value={formData.processStep}
                    onChange={(e) => handleInputChange('processStep', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Step</option>
                    <option value="1">Step 1</option>
                    <option value="2">Step 2</option>
                    <option value="3">Step 3</option>
                    <option value="4">Step 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Process Step Name</label>
                  <input
                    type="text"
                    value={formData.processStepName}
                    onChange={(e) => handleInputChange('processStepName', e.target.value)}
                    placeholder="Enter step name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allowed Hours</label>
                  <input
                    type="number"
                    value={formData.allowedHours}
                    onChange={(e) => handleInputChange('allowedHours', e.target.value)}
                    placeholder="Enter allowed hours"
                    min="1"
                    max="168"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Allowed Days</label>
                  <input
                    type="number"
                    value={formData.allowedDays}
                    onChange={(e) => handleInputChange('allowedDays', e.target.value)}
                    placeholder="Enter allowed days"
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    <Save className="h-4 w-4" />
                    Create SLA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
