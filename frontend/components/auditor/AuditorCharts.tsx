'use client'

import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

interface AuditorChartsProps {
  delayTrendData?: Array<{
    month: string
    avgDelay: number
    totalDelayed: number
    criticalDelays: number
  }>
  roleDelayData?: Array<{
    role: string
    avgDelay: number
    totalDelayed: number
    delayRate: number
  }>
  loading?: boolean
}

const mockDelayTrendData = [
  { month: 'Jan', avgDelay: 3.2, totalDelayed: 15, criticalDelays: 3 },
  { month: 'Feb', avgDelay: 2.8, totalDelayed: 12, criticalDelays: 2 },
  { month: 'Mar', avgDelay: 3.5, totalDelayed: 18, criticalDelays: 4 },
  { month: 'Apr', avgDelay: 2.1, totalDelayed: 8, criticalDelays: 1 },
  { month: 'May', avgDelay: 2.9, totalDelayed: 14, criticalDelays: 3 },
  { month: 'Jun', avgDelay: 2.4, totalDelayed: 10, criticalDelays: 2 }
]

const mockRoleDelayData = [
  { role: 'Clerk', avgDelay: 2.5, totalDelayed: 25, delayRate: 15.2 },
  { role: 'Section Officer', avgDelay: 4.2, totalDelayed: 32, delayRate: 22.8 },
  { role: 'HOD', avgDelay: 1.8, totalDelayed: 8, delayRate: 8.5 },
  { role: 'Admin', avgDelay: 0.5, totalDelayed: 2, delayRate: 2.1 }
]

const delayReasonData = [
  { reason: 'Missing Documentation', count: 35, percentage: 42.2 },
  { reason: 'Staff Shortage', count: 18, percentage: 21.7 },
  { reason: 'System Delays', count: 15, percentage: 18.1 },
  { reason: 'Complex Cases', count: 10, percentage: 12.0 },
  { reason: 'Citizen Non-Response', count: 5, percentage: 6.0 }
]

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function AuditorCharts({ 
  delayTrendData = mockDelayTrendData,
  roleDelayData = mockRoleDelayData,
  loading = false 
}: AuditorChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface-card-elevated p-6">
            <div className="animate-pulse">
              <div className="skeleton h-4 w-32 rounded mb-4"></div>
              <div className="skeleton h-64 w-full rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Delay Trend Over Time */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">6-Month Delay Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={delayTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Avg Delay (Days)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Total Delayed', angle: 90, position: 'insideRight', style: { fill: '#64748b' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="avgDelay" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
              name="Avg Delay (Days)"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="totalDelayed" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Total Delayed"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="criticalDelays" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              name="Critical Delays"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Role-wise Delay Analysis */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Role-wise Delay Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roleDelayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="role" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Avg Delay (Days)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Delay Rate (%)', angle: 90, position: 'insideRight', style: { fill: '#64748b' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="avgDelay" 
              fill="#6366f1" 
              name="Avg Delay (Days)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right"
              dataKey="delayRate" 
              fill="#ef4444" 
              name="Delay Rate (%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total Delayed by Role */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Total Delayed Requests by Role</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleDelayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.role}: ${entry.totalDelayed}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="totalDelayed"
            >
              {roleDelayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Delay Reasons */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Delay Reasons</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={delayReasonData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              type="category"
              dataKey="reason" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: any) => {
                if (name === 'count') return [value, 'Occurrences']
                if (name === 'percentage') return [`${value}%`, 'Percentage']
                return [value, name]
              }}
            />
            <Bar dataKey="count" fill="#f59e0b" name="count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {delayReasonData.map((reason, index) => (
            <div key={reason.reason} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-xs text-slate-600 truncate" title={reason.reason}>
                {reason.reason}: {reason.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
