'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface DelayReport {
  id: string
  reportDate: string
  reportPeriod: string
  totalDelayedRequests: number
  criticalDelays: number
  avgDelayTime: number
  mostDelayedRole: string
  topDelayReason: string
  generatedBy: string
  status: 'draft' | 'published' | 'archived'
}

interface DelayReportsProps {
  reports: DelayReport[]
  loading?: boolean
  onView?: (reportId: string) => void
  onDownload?: (reportId: string, format: 'pdf' | 'csv') => void
}

const mockReports: DelayReport[] = [
  {
    id: 'DELAY-2024-01',
    reportDate: '2024-01-17',
    reportPeriod: 'January 2024',
    totalDelayedRequests: 47,
    criticalDelays: 8,
    avgDelayTime: 4.2,
    mostDelayedRole: 'Section Officer',
    topDelayReason: 'Missing Documentation',
    generatedBy: 'System Auto-Report',
    status: 'published'
  },
  {
    id: 'DELAY-2023-12',
    reportDate: '2024-01-01',
    reportPeriod: 'December 2023',
    totalDelayedRequests: 52,
    criticalDelays: 12,
    avgDelayTime: 5.8,
    mostDelayedRole: 'Clerk',
    topDelayReason: 'Staff Shortage',
    generatedBy: 'AUD-001',
    status: 'published'
  },
  {
    id: 'DELAY-2023-11',
    reportDate: '2023-12-01',
    reportPeriod: 'November 2023',
    totalDelayedRequests: 38,
    criticalDelays: 6,
    avgDelayTime: 3.5,
    mostDelayedRole: 'Section Officer',
    topDelayReason: 'System Delays',
    generatedBy: 'System Auto-Report',
    status: 'published'
  },
  {
    id: 'DELAY-2023-10',
    reportDate: '2023-11-01',
    reportPeriod: 'October 2023',
    totalDelayedRequests: 41,
    criticalDelays: 9,
    avgDelayTime: 4.7,
    mostDelayedRole: 'HOD',
    topDelayReason: 'Complex Cases',
    generatedBy: 'AUD-001',
    status: 'published'
  },
  {
    id: 'DELAY-2023-Q3',
    reportDate: '2023-10-01',
    reportPeriod: 'Q3 2023 (Jul-Sep)',
    totalDelayedRequests: 125,
    criticalDelays: 28,
    avgDelayTime: 4.3,
    mostDelayedRole: 'Section Officer',
    topDelayReason: 'Missing Documentation',
    generatedBy: 'System Auto-Report',
    status: 'archived'
  }
]

const DelayReportCard: React.FC<{
  report: DelayReport
  onView?: (reportId: string) => void
  onDownload?: (reportId: string, format: 'pdf' | 'csv') => void
}> = ({ report, onView, onDownload }) => {
  const statusColors = {
    draft: 'bg-slate-50 text-slate-700 border-slate-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    archived: 'bg-amber-50 text-amber-700 border-amber-200'
  }

  const getDelayTrend = () => {
    // This would normally come from comparing with previous period
    const trends = ['up', 'down', 'stable'] as const
    return trends[Math.floor(Math.random() * trends.length)]
  }

  const trend = getDelayTrend()

  return (
    <div className="surface-card-elevated p-6 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-900">{report.id}</h4>
          <p className="text-sm text-slate-600 mt-1">{report.reportPeriod}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[report.status]}`}>
          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{report.totalDelayedRequests}</p>
          <p className="text-xs text-slate-500">Total Delays</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{report.criticalDelays}</p>
          <p className="text-xs text-slate-500">Critical</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{report.avgDelayTime}</p>
          <p className="text-xs text-slate-500">Avg Days</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-emerald-500" />}
            <span className={`text-lg font-bold ${
              trend === 'up' ? 'text-red-600' : 
              trend === 'down' ? 'text-emerald-600' : 'text-slate-600'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          </div>
          <p className="text-xs text-slate-500">vs Last Period</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Most Delayed Role:</span>
          <span className="text-sm font-medium text-slate-900">{report.mostDelayedRole}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Top Delay Reason:</span>
          <span className="text-sm font-medium text-slate-900">{report.topDelayReason}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Generated By:</span>
          <span className="text-sm font-medium text-slate-900">{report.generatedBy}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Report Date:</span>
          <span className="text-sm font-medium text-slate-900">{report.reportDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => onView?.(report.id)}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Eye className="h-4 w-4" />
          <span>View Report</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDownload?.(report.id, 'pdf')}
            className="flex items-center space-x-2 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">PDF</span>
          </button>
          
          <button
            onClick={() => onDownload?.(report.id, 'csv')}
            className="flex items-center space-x-2 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">CSV</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DelayReports({ 
  reports = mockReports,
  loading = false,
  onView,
  onDownload
}: DelayReportsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredReports = reports.filter(report => {
    // Search filter
    if (searchTerm && !report.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !report.reportPeriod.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Period filter
    if (filterPeriod !== 'all' && !report.reportPeriod.toLowerCase().includes(filterPeriod)) {
      return false
    }
    
    // Status filter
    if (filterStatus !== 'all' && report.status !== filterStatus) {
      return false
    }
    
    return true
  })

  const handleGenerateReport = () => {
    console.log('Generating new delay report...')
    // In a real implementation, this would trigger report generation
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Delay Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="surface-card-elevated p-6">
              <div className="animate-pulse">
                <div className="skeleton h-4 w-32 rounded mb-4"></div>
                <div className="skeleton h-3 w-24 rounded mb-2"></div>
                <div className="skeleton h-3 w-28 rounded mb-2"></div>
                <div className="skeleton h-2 w-full rounded"></div>
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
          <h3 className="text-lg font-semibold text-slate-900">Delay Reports</h3>
          <p className="text-sm text-slate-600 mt-1">
            {filteredReports.length} reports found
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm w-48"
            />
          </div>
          
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="input text-sm w-32"
          >
            <option value="all">All Periods</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input text-sm w-32"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          
          <button
            onClick={handleGenerateReport}
            className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">No delay reports found</h4>
          <p className="text-sm text-slate-600">
            No reports match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <DelayReportCard
              key={report.id}
              report={report}
              onView={onView}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  )
}
