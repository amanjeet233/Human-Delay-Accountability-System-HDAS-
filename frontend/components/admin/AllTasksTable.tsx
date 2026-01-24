'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Clock, AlertTriangle, CheckCircle, User, Calendar } from 'lucide-react'

interface Task {
  id: string
  citizenName: string
  currentRole: string
  timeVsSLA: string
  delayStatus: 'on-time' | 'delayed' | 'critical'
  escalationLevel: number
  requestType: string
  assignedTo?: string
  createdDate: string
}

interface AllTasksTableProps {
  tasks: Task[]
  loading?: boolean
}

const mockTasks: Task[] = [
  {
    id: 'REQ-2024-001',
    citizenName: 'Rajesh Kumar',
    currentRole: 'Clerk',
    timeVsSLA: '2 days remaining',
    delayStatus: 'on-time',
    escalationLevel: 0,
    requestType: 'Land Registration',
    assignedTo: 'John Smith',
    createdDate: '2024-01-15'
  },
  {
    id: 'REQ-2024-002',
    citizenName: 'Priya Sharma',
    currentRole: 'Section Officer',
    timeVsSLA: '1 day overdue',
    delayStatus: 'delayed',
    escalationLevel: 1,
    requestType: 'Building Permit',
    assignedTo: 'Sarah Johnson',
    createdDate: '2024-01-10'
  },
  {
    id: 'REQ-2024-003',
    citizenName: 'Amit Patel',
    currentRole: 'HOD',
    timeVsSLA: '3 days overdue',
    delayStatus: 'critical',
    escalationLevel: 2,
    requestType: 'Business License',
    assignedTo: 'Michael Brown',
    createdDate: '2024-01-08'
  },
  {
    id: 'REQ-2024-004',
    citizenName: 'Sunita Devi',
    currentRole: 'Clerk',
    timeVsSLA: '5 days remaining',
    delayStatus: 'on-time',
    escalationLevel: 0,
    requestType: 'Property Tax',
    assignedTo: 'Emily Davis',
    createdDate: '2024-01-16'
  },
  {
    id: 'REQ-2024-005',
    citizenName: 'Mohammed Ali',
    currentRole: 'Section Officer',
    timeVsSLA: 'Same day',
    delayStatus: 'on-time',
    escalationLevel: 0,
    requestType: 'Water Connection',
    assignedTo: 'David Wilson',
    createdDate: '2024-01-17'
  }
]

type SortField = 'id' | 'citizenName' | 'currentRole' | 'timeVsSLA' | 'delayStatus' | 'escalationLevel'
type SortDirection = 'asc' | 'desc'

const TaskRow: React.FC<{ task: Task; index: number }> = ({ task, index }) => {
  const delayStatusColors = {
    'on-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'delayed': 'bg-amber-50 text-amber-700 border-amber-200',
    'critical': 'bg-red-50 text-red-700 border-red-200'
  }

  const escalationColors: { [key: number]: string } = {
    0: 'bg-slate-50 text-slate-600 border-slate-200',
    1: 'bg-amber-50 text-amber-600 border-amber-200',
    2: 'bg-red-50 text-red-600 border-red-200'
  }

  const delayStatusIcons = {
    'on-time': <CheckCircle className="h-3 w-3" />,
    'delayed': <Clock className="h-3 w-3" />,
    'critical': <AlertTriangle className="h-3 w-3" />
  }

  return (
    <tr className="table-row hover:bg-slate-50 transition-colors">
      <td className="table-cell">
        <span className="font-medium text-slate-900">{task.id}</span>
      </td>
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700">{task.citizenName}</span>
        </div>
      </td>
      <td className="table-cell">
        <span className="text-slate-700">{task.currentRole}</span>
      </td>
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-slate-700">{task.timeVsSLA}</span>
        </div>
      </td>
      <td className="table-cell">
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${delayStatusColors[task.delayStatus]}`}>
          {delayStatusIcons[task.delayStatus]}
          <span className="capitalize">{task.delayStatus}</span>
        </div>
      </td>
      <td className="table-cell">
        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium border ${escalationColors[task.escalationLevel]}`}>
          L{task.escalationLevel}
        </div>
      </td>
    </tr>
  )
}

const SortIcon: React.FC<{ direction: SortDirection | null }> = ({ direction }) => {
  if (direction === null) return null
  return direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
}

export default function AllTasksTable({ tasks = mockTasks, loading = false }: AllTasksTableProps) {
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  if (loading) {
    return (
      <div className="surface-card-elevated overflow-hidden mb-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Tasks Overview</h3>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="skeleton h-4 w-24 rounded"></div>
                  <div className="skeleton h-4 w-32 rounded"></div>
                  <div className="skeleton h-4 w-28 rounded"></div>
                  <div className="skeleton h-4 w-24 rounded"></div>
                  <div className="skeleton h-4 w-20 rounded"></div>
                  <div className="skeleton h-4 w-12 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">All Tasks Overview</h3>
          <div className="text-sm text-slate-500">
            Total: {tasks.length} requests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Request ID</span>
                    <SortIcon direction={sortField === 'id' ? sortDirection : null} />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('citizenName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Citizen Name</span>
                    <SortIcon direction={sortField === 'citizenName' ? sortDirection : null} />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('currentRole')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Current Role</span>
                    <SortIcon direction={sortField === 'currentRole' ? sortDirection : null} />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('timeVsSLA')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Time vs SLA</span>
                    <SortIcon direction={sortField === 'timeVsSLA' ? sortDirection : null} />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('delayStatus')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Delay Status</span>
                    <SortIcon direction={sortField === 'delayStatus' ? sortDirection : null} />
                  </div>
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('escalationLevel')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Escalation</span>
                    <SortIcon direction={sortField === 'escalationLevel' ? sortDirection : null} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task, index) => (
                <TaskRow key={task.id} task={task} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
