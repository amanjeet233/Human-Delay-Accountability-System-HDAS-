'use client'

import React, { useState } from 'react'
import { 
  Eye, 
  Calendar,
  User,
  FileText,
  Clock,
  Filter,
  Download,
  Search,
  ChevronDown
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  role: string
  action: string
  targetRequestId?: string
  targetCitizen?: string
  details: string
  ipAddress: string
  status: 'success' | 'failure' | 'warning'
}

interface AuditLogsTableProps {
  logs: AuditLog[]
  loading?: boolean
  onView?: (logId: string) => void
}

const mockLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-01-17 14:32:15',
    userId: 'CLERK-001',
    userName: 'John Smith',
    role: 'Clerk',
    action: 'Document Verification',
    targetRequestId: 'REQ-2024-014',
    targetCitizen: 'Anjali Sharma',
    details: 'Verified land registration documents - all documents found to be in order',
    ipAddress: '192.168.1.105',
    status: 'success'
  },
  {
    id: 'AUD-002',
    timestamp: '2024-01-17 13:15:42',
    userId: 'SO-001',
    userName: 'Robert Johnson',
    role: 'Section Officer',
    action: 'Request Approval',
    targetRequestId: 'REQ-2024-015',
    targetCitizen: 'Vikram Singh',
    details: 'Approved building permit request with conditions',
    ipAddress: '192.168.1.106',
    status: 'success'
  },
  {
    id: 'AUD-003',
    timestamp: '2024-01-17 11:48:23',
    userId: 'HOD-001',
    userName: 'Dr. Sarah Mitchell',
    role: 'HOD',
    action: 'Final Rejection',
    targetRequestId: 'REQ-2024-016',
    targetCitizen: 'Meera Patel',
    details: 'Rejected business license application - incomplete tax documentation',
    ipAddress: '192.168.1.107',
    status: 'warning'
  },
  {
    id: 'AUD-004',
    timestamp: '2024-01-17 10:22:18',
    userId: 'CLERK-002',
    userName: 'Sarah Johnson',
    role: 'Clerk',
    action: 'Delay Report',
    targetRequestId: 'REQ-2024-017',
    targetCitizen: 'Rahul Kumar',
    details: 'Reported delay due to missing ownership certificates',
    ipAddress: '192.168.1.108',
    status: 'warning'
  },
  {
    id: 'AUD-005',
    timestamp: '2024-01-17 09:35:47',
    userId: 'CIT-001',
    userName: 'Rajesh Kumar',
    role: 'Citizen',
    action: 'Request Submission',
    targetRequestId: 'REQ-2024-018',
    targetCitizen: 'Rajesh Kumar',
    details: 'Submitted new property tax assessment request',
    ipAddress: '192.168.1.200',
    status: 'success'
  },
  {
    id: 'AUD-006',
    timestamp: '2024-01-17 08:12:33',
    userId: 'ADMIN-001',
    userName: 'System Administrator',
    role: 'Admin',
    action: 'User Creation',
    details: 'Created new clerk account for Emily Davis',
    ipAddress: '192.168.1.100',
    status: 'success'
  },
  {
    id: 'AUD-007',
    timestamp: '2024-01-16 16:45:12',
    userId: 'CLERK-003',
    userName: 'Michael Brown',
    role: 'Clerk',
    action: 'Login Failure',
    details: 'Failed login attempt - invalid password',
    ipAddress: '192.168.1.109',
    status: 'failure'
  }
]

const AuditLogRow: React.FC<{
  log: AuditLog
  onView?: (logId: string) => void
}> = ({ log, onView }) => {
  const statusColors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failure: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200'
  }

  const roleColors = {
    Admin: 'bg-slate-50 text-slate-700 border-slate-200',
    HOD: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Section Officer': 'bg-purple-50 text-purple-700 border-purple-200',
    Clerk: 'bg-amber-50 text-amber-700 border-amber-200',
    Citizen: 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return (
    <tr className="table-row hover:bg-slate-50 transition-colors">
      <td className="table-cell">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onView?.(log.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <span className="font-medium text-slate-900">{log.id}</span>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="text-sm text-slate-700">
          <div>{log.timestamp.split(' ')[0]}</div>
          <div className="text-slate-500">{log.timestamp.split(' ')[1]}</div>
        </div>
      </td>
      
      <td className="table-cell">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-slate-400" />
          <div>
            <div className="text-sm text-slate-700">{log.userName}</div>
            <div className="text-xs text-slate-500">{log.userId}</div>
          </div>
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${roleColors[log.role as keyof typeof roleColors]}`}>
          {log.role}
        </div>
      </td>
      
      <td className="table-cell">
        <span className="text-sm text-slate-700">{log.action}</span>
      </td>
      
      <td className="table-cell">
        {log.targetRequestId && (
          <div className="text-sm">
            <div className="text-slate-700">{log.targetRequestId}</div>
            {log.targetCitizen && (
              <div className="text-slate-500">{log.targetCitizen}</div>
            )}
          </div>
        )}
      </td>
      
      <td className="table-cell">
        <div className="max-w-xs">
          <p className="text-sm text-slate-600 truncate" title={log.details}>
            {log.details}
          </p>
        </div>
      </td>
      
      <td className="table-cell">
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[log.status]}`}>
          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
        </div>
      </td>
      
      <td className="table-cell">
        <span className="text-sm text-slate-600">{log.ipAddress}</span>
      </td>
    </tr>
  )
}

export default function AuditLogsTable({ 
  logs = mockLogs,
  loading = false,
  onView
}: AuditLogsTableProps) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    role: 'all',
    action: 'all',
    status: 'all'
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredLogs = logs.filter(log => {
    // Search filter
    if (searchTerm && !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.action.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Role filter
    if (filters.role !== 'all' && log.role !== filters.role) return false
    
    // Status filter
    if (filters.status !== 'all' && log.status !== filters.status) return false
    
    return true
  })

  const handleExportPDF = () => {
    console.log('Exporting to PDF...')
    // In a real implementation, this would generate and download a PDF
  }

  const handleExportCSV = () => {
    console.log('Exporting to CSV...')
    // In a real implementation, this would generate and download a CSV
  }

  if (loading) {
    return (
      <div className="surface-card-elevated overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Audit Logs</h3>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="skeleton h-4 w-20 rounded"></div>
                  <div className="skeleton h-4 w-32 rounded"></div>
                  <div className="skeleton h-4 w-28 rounded"></div>
                  <div className="skeleton h-4 w-24 rounded"></div>
                  <div className="skeleton h-4 w-20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Audit Logs</h3>
            <p className="text-sm text-slate-600 mt-1">
              {filteredLogs.length} records found
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm w-64"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filters</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Export to PDF"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">PDF</span>
              </button>
              
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Export to CSV"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="input text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="input text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="input text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="HOD">HOD</option>
                  <option value="Section Officer">Section Officer</option>
                  <option value="Clerk">Clerk</option>
                  <option value="Citizen">Citizen</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters({...filters, action: e.target.value})}
                  className="input text-sm"
                >
                  <option value="all">All Actions</option>
                  <option value="Request Submission">Request Submission</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="Request Approval">Request Approval</option>
                  <option value="Final Rejection">Final Rejection</option>
                  <option value="Delay Report">Delay Report</option>
                  <option value="User Creation">User Creation</option>
                  <option value="Login Failure">Login Failure</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="input text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Log ID</th>
                <th className="table-header-cell">Timestamp</th>
                <th className="table-header-cell">User</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Action</th>
                <th className="table-header-cell">Target</th>
                <th className="table-header-cell">Details</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <AuditLogRow
                  key={log.id}
                  log={log}
                  onView={onView}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
