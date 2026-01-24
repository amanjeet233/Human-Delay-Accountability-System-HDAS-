'use client'

import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AdminChartsProps {
  pendingVsCompletedData?: Array<{ name: string; pending: number; completed: number }>
  delayTrendData?: Array<{ date: string; delays: number }>
  roleWiseDelayData?: Array<{ role: string; avgDelay: number; count: number }>
  loading?: boolean
}

const pendingVsCompletedDefault = [
  { name: 'Mon', pending: 45, completed: 28 },
  { name: 'Tue', pending: 52, completed: 38 },
  { name: 'Wed', pending: 38, completed: 42 },
  { name: 'Thu', pending: 65, completed: 35 },
  { name: 'Fri', pending: 48, completed: 48 },
  { name: 'Sat', pending: 25, completed: 32 },
  { name: 'Sun', pending: 15, completed: 18 },
]

const delayTrendDefault = [
  { date: 'Week 1', delays: 12 },
  { date: 'Week 2', delays: 18 },
  { date: 'Week 3', delays: 15 },
  { date: 'Week 4', delays: 8 },
  { date: 'Week 5', delays: 10 },
  { date: 'Week 6', delays: 6 },
]

const roleWiseDelayDefault = [
  { role: 'Clerk', avgDelay: 2.5, count: 45 },
  { role: 'Section Officer', avgDelay: 4.2, count: 32 },
  { role: 'HOD', avgDelay: 1.8, count: 18 },
  { role: 'Admin', avgDelay: 0.5, count: 8 },
]

export default function AdminCharts({ 
  pendingVsCompletedData = pendingVsCompletedDefault,
  delayTrendData = delayTrendDefault,
  roleWiseDelayData = roleWiseDelayDefault,
  loading = false 
}: AdminChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Pending vs Completed Chart */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending vs Completed</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pendingVsCompletedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="pending" fill="#3b82f6" name="Pending" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delay Trend Chart */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Delay Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={delayTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="delays" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Delays"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Role-wise Delay Chart */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Role-wise Delays</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={roleWiseDelayData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              type="category"
              dataKey="role" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="avgDelay" fill="#f59e0b" name="Avg Delay (Days)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
