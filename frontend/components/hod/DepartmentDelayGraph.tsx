'use client'

import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

interface DepartmentDelayGraphProps {
  data?: Array<{
    role: string
    avgDelay: number
    totalRequests: number
    delayedRequests: number
    onTimePercentage: number
  }>
  loading?: boolean
}

const mockDepartmentData = [
  {
    role: 'Clerk',
    avgDelay: 2.5,
    totalRequests: 45,
    delayedRequests: 8,
    onTimePercentage: 82.2
  },
  {
    role: 'Section Officer',
    avgDelay: 4.2,
    totalRequests: 32,
    delayedRequests: 12,
    onTimePercentage: 62.5
  },
  {
    role: 'HOD',
    avgDelay: 1.8,
    totalRequests: 18,
    delayedRequests: 2,
    onTimePercentage: 88.9
  }
]

const delayTrendData = [
  { month: 'Jan', avgDelay: 3.2, totalDelayed: 15 },
  { month: 'Feb', avgDelay: 2.8, totalDelayed: 12 },
  { month: 'Mar', avgDelay: 3.5, totalDelayed: 18 },
  { month: 'Apr', avgDelay: 2.1, totalDelayed: 8 },
  { month: 'May', avgDelay: 2.9, totalDelayed: 14 },
  { month: 'Jun', avgDelay: 2.4, totalDelayed: 10 }
]

const slaBreachData = [
  { name: 'On Time', value: 68, color: '#10b981' },
  { name: 'Minor Delay', value: 20, color: '#f59e0b' },
  { name: 'Major Delay', value: 8, color: '#ef4444' },
  { name: 'Critical Delay', value: 4, color: '#991b1b' }
]

export default function DepartmentDelayGraph({ 
  data = mockDepartmentData,
  loading = false 
}: DepartmentDelayGraphProps) {
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
      {/* Role-wise Average Delay */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Role-wise Average Delay</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="role" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Average Delay (Days)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value: any, name: any) => {
                if (name === 'avgDelay') return [`${value} days`, 'Avg Delay']
                return [value, name]
              }}
            />
            <Bar dataKey="avgDelay" fill="#10b981" name="avgDelay" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delay Trend Over Time */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">6-Month Delay Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
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
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
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
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* On-Time Performance by Role */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">On-Time Performance by Role</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e1' }}
              domain={[0, 100]}
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
              formatter={(value: any) => [`${value}%`, 'On-Time Rate']}
            />
            <Bar dataKey="onTimePercentage" fill="#10b981" name="onTimePercentage" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SLA Breach Distribution */}
      <div className="surface-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">SLA Breach Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={slaBreachData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {slaBreachData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value: any) => [`${value}%`, 'Percentage']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {slaBreachData.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-slate-600">{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
