'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, ArrowUp, ArrowDown, User } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

interface ProcessStep {
  order: number
  name: string
  assignedRole: string
}

interface Process {
  id: string
  name: string
  description: string
  steps: ProcessStep[]
  active: boolean
  createdAt: string
}

export default function AdminProcesses() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [newProcess, setNewProcess] = useState({
    name: '',
    description: '',
    steps: [
      { order: 1, name: '', assignedRole: 'CITIZEN' },
      { order: 2, name: '', assignedRole: 'CLERK' },
      { order: 3, name: '', assignedRole: 'SECTION_OFFICER' },
      { order: 4, name: '', assignedRole: 'HOD' }
    ]
  })

  useEffect(() => {
    loadProcesses()
  }, [])

  const loadProcesses = async () => {
    try {
      const response = await api.get('/admin/processes')
      console.log('Processes API response:', response.data)
      setProcesses(response.data || [])
    } catch (error) {
      console.error('Failed to load processes:', error)
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProcess = async () => {
    try {
      console.log('Creating process:', newProcess)
      const response = await api.post('/admin/processes', newProcess)
      console.log('Create process response:', response.data)
      setShowCreateModal(false)
      setNewProcess({
        name: '',
        description: '',
        steps: [
          { order: 1, name: '', assignedRole: 'CITIZEN' },
          { order: 2, name: '', assignedRole: 'CLERK' },
          { order: 3, name: '', assignedRole: 'SECTION_OFFICER' },
          { order: 4, name: '', assignedRole: 'HOD' }
        ]
      })
      loadProcesses()
    } catch (error) {
      console.error('Failed to create process:', error)
    }
  }

  const updateStep = (index: number, field: string, value: string) => {
    const updatedSteps = [...newProcess.steps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setNewProcess({ ...newProcess, steps: updatedSteps })
  }

  const addStep = () => {
    const newOrder = newProcess.steps.length + 1
    setNewProcess({
      ...newProcess,
      steps: [
        ...newProcess.steps,
        { order: newOrder, name: '', assignedRole: 'CITIZEN' }
      ]
    })
  }

  const removeStep = (index: number) => {
    const updatedSteps = newProcess.steps.filter((_, i) => i !== index)
    // Reorder remaining steps
    const reorderedSteps = updatedSteps.map((step, i) => ({ ...step, order: i + 1 }))
    setNewProcess({ ...newProcess, steps: reorderedSteps })
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const updatedSteps = [...newProcess.steps]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < updatedSteps.length) {
      const [movedStep] = updatedSteps.splice(index, 1)
      updatedSteps.splice(newIndex, 0, movedStep[0])
    }
    
    setNewProcess({ ...newProcess, steps: updatedSteps })
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Process & SLA Config"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Process Configuration</h1>
            <p className="text-slate-600">Define workflow steps and role assignments.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Process</span>
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
            {/* Processes List */}
            <div className="surface-card-elevated">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Existing Processes</h2>
              <div className="space-y-3">
                {processes.map((process) => (
                  <div key={process.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{process.name}</h3>
                        <p className="text-sm text-slate-600">{process.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          process.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {process.active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => setSelectedProcess(process)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-900 mb-2">Workflow Steps</h4>
                      <div className="space-y-2">
                        {process.steps.map((step) => (
                          <div key={step.order} className="flex items-center space-x-3">
                            <span className="flex-shrink-0 w-8 text-center font-medium text-slate-600">
                              {step.order}
                            </span>
                            <span className="flex-shrink-0 w-32 text-sm text-slate-900">
                              {step.name}
                            </span>
                            <span className="flex-shrink-0 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {step.assignedRole}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Process Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="surface-card-elevated p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Process</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateProcess(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Process Name</label>
                  <input
                    type="text"
                    value={newProcess.name}
                    onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
                    placeholder="Enter process name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newProcess.description}
                    onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
                    placeholder="Enter process description"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-900">Workflow Steps</h3>
                    <button
                      type="button"
                      onClick={addStep}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Add Step
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newProcess.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <span className="flex-shrink-0 w-8 text-center font-medium text-slate-600">
                          {step.order}
                        </span>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => updateStep(index, 'name', e.target.value)}
                          placeholder="Step name"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <select
                          value={step.assignedRole}
                          onChange={(e) => updateStep(index, 'assignedRole', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="CITIZEN">CITIZEN</option>
                          <option value="CLERK">CLERK</option>
                          <option value="SECTION_OFFICER">SECTION_OFFICER</option>
                          <option value="HOD">HOD</option>
                          <option value="AUDITOR">AUDITOR</option>
                        </select>
                        <div className="flex flex-col space-y-1">
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === newProcess.steps.length - 1}
                            className="p-1 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    Create Process
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
