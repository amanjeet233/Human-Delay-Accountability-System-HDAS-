'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Clock, Users, AlertTriangle, CheckCircle, Activity, Target } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import api from '@/lib/api'

interface AnalyticsData {
  summary: {
    totalRequests: number
    onTimeDeliveries: number
    delayedRequests: number
    slaCompliance: number
    averageProcessingTime: number
    totalEscalations: number
  }
  delaysByRole: Array<{
    role: string
    avgDelay: number
    totalRequests: number
  }>
  slaByProcess: Array<{
    process: string
    slaCompliance: number
    avgTime: number
  }>
  monthlyTrends: Array<{
    month: string
    requests: number
    onTime: number
    delayed: number
  }>
  roleDistribution: Array<{
    role: string
    count: number
    percentage: number
  }>
  topDelays: Array<{
    id: string
    title: string
    delay: number
    assignedRole: string
  }>
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics')
      console.log('Analytics API response:', response.data)
      setAnalyticsData(response.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  if (loading || !analyticsData) {
    return (
      <AdminLayout
        userId="ADMIN-001"
        userName="District Administrator"
        department="District Collector Office"
        currentPage="Analytics"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Governance Analytics</h1>
              <p className="text-slate-600">System-level performance metrics and compliance data.</p>
            </div>
          </div>

          <div className="surface-card-elevated p-8">
            <div className="animate-pulse space-y-4">
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
              <div className="skeleton h-10 w-full"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Analytics"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Governance Analytics</h1>
            <p className="text-slate-600">System-level performance metrics and compliance data.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="surface-card-elevated p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Total Requests</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{analyticsData.summary.totalRequests.toLocaleString()}</div>
          </div>
          
          <div className="surface-card-elevated p-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-600">On-Time</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{analyticsData.summary.onTimeDeliveries.toLocaleString()}</div>
          </div>
          
          <div className="surface-card-elevated p-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-slate-600">Delayed</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{analyticsData.summary.delayedRequests.toLocaleString()}</div>
          </div>
          
          <div className="surface-card-elevated p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-slate-600">SLA Compliance</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{analyticsData.summary.slaCompliance}%</div>
          </div>
          
          <div className="surface-card-elevated p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-slate-600">Avg Processing</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{analyticsData.summary.averageProcessingTime} days</div>
          </div>
          
          <div className="surface-card-elevated p-6">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-slate-600">Escalations</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">{analyticsData.summary.totalEscalations.toLocaleString()}</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delays by Role Chart */}
          <div className="surface-card-elevated p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Average Delays by Role</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.delaysByRole}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} days`]} />
                <Bar dataKey="avgDelay" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SLA Compliance by Process Chart */}
          <div className="surface-card-elevated p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">SLA Compliance by Process</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.slaByProcess}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="process" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="slaCompliance" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trends Chart */}
        <div className="surface-card-elevated p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Request Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="onTime" stroke="#10B981" strokeWidth={2} name="On-Time" />
              <Line type="monotone" dataKey="delayed" stroke="#EF4444" strokeWidth={2} name="Delayed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Chart */}
        <div className="surface-card-elevated p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Role Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Delays Table */}
        <div className="surface-card-elevated">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Delayed Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-6 font-semibold text-slate-900">Request</th>
                  <th className="text-left py-3 px-6 font-semibold text-slate-900">Delay (Days)</th>
                  <th className="text-left py-3 px-6 font-semibold text-slate-900">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analyticsData.topDelays.map((delay) => (
                  <tr key={delay.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6">
                      <div>
                        <div className="font-medium text-slate-900">{delay.title}</div>
                        <div className="text-sm text-slate-500">ID: {delay.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        delay.delay >= 7 ? 'bg-red-100 text-red-800' :
                        delay.delay >= 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delay.delay} days
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        {delay.assignedRole}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
