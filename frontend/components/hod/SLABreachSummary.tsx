'use client'

import React from 'react'
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SLABreachSummaryProps {
  data?: {
    totalBreaches: number
    criticalBreaches: number
    majorBreaches: number
    minorBreaches: number
    avgBreachTime: number
    breachRate: number
    monthlyTrend: Array<{
      month: string
      breaches: number
      rate: number
    }>
    topBreachReasons: Array<{
      reason: string
      count: number
      percentage: number
    }>
    departmentComparison: Array<{
      department: string
      breaches: number
      rate: number
    }>
  }
  loading?: boolean
}

const mockData = {
  totalBreaches: 28,
  criticalBreaches: 5,
  majorBreaches: 12,
  minorBreaches: 11,
  avgBreachTime: 3.2,
  breachRate: 14.6,
  monthlyTrend: [
    { month: 'Jan', breaches: 8, rate: 12.5 },
    { month: 'Feb', breaches: 12, rate: 15.8 },
    { month: 'Mar', breaches: 6, rate: 10.2 },
    { month: 'Apr', breaches: 15, rate: 18.4 },
    { month: 'May', breaches: 10, rate: 13.6 },
    { month: 'Jun', breaches: 8, rate: 11.2 }
  ],
  topBreachReasons: [
    { reason: 'Missing Documentation', count: 12, percentage: 42.9 },
    { reason: 'System Delays', count: 8, percentage: 28.6 },
    { reason: 'Staff Shortage', count: 5, percentage: 17.9 },
    { reason: 'Citizen Non-Response', count: 3, percentage: 10.7 }
  ],
  departmentComparison: [
    { department: 'Revenue', breaches: 8, rate: 12.1 },
    { department: 'Urban Development', breaches: 12, rate: 18.5 },
    { department: 'Commerce', breaches: 5, rate: 11.3 },
    { department: 'Public Works', breaches: 3, rate: 9.8 }
  ]
}

const BreachCategoryCard: React.FC<{
  title: string
  count: number
  percentage: number
  color: 'red' | 'orange' | 'amber'
  icon: React.ReactNode
  loading?: boolean
}> = ({ title, count, percentage, color, icon, loading = false }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200'
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <div className="animate-pulse">
          <div className="skeleton h-4 w-24 rounded mb-4"></div>
          <div className="skeleton h-8 w-16 rounded mb-2"></div>
          <div className="skeleton h-3 w-20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card-elevated p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-slate-900">{count}</p>
        <p className="text-sm text-slate-500">{percentage}% of total breaches</p>
      </div>
    </div>
  )
}

export default function SLABreachSummary({ 
  data = mockData,
  loading = false 
}: SLABreachSummaryProps) {
  const currentMonthRate = data.monthlyTrend[data.monthlyTrend.length - 1]?.rate || 0
  const previousMonthRate = data.monthlyTrend[data.monthlyTrend.length - 2]?.rate || 0
  const trendPercentage = previousMonthRate > 0 ? ((currentMonthRate - previousMonthRate) / previousMonthRate) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Overall Summary */}
      <section>
        <div className="surface-card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">SLA Breach Summary</h3>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Current Month</p>
                <p className={`text-lg font-bold ${
                  data.breachRate > 15 ? 'text-red-600' : 
                  data.breachRate > 10 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {data.breachRate}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Trend</p>
                <div className={`flex items-center space-x-1 ${
                  trendPercentage > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {trendPercentage > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{data.totalBreaches}</p>
              <p className="text-sm text-slate-600">Total Breaches</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{data.criticalBreaches}</p>
              <p className="text-sm text-red-700">Critical Breaches</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{data.avgBreachTime} days</p>
              <p className="text-sm text-amber-700">Avg Breach Time</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{data.resolvedCount || 0}</p>
              <p className="text-sm text-emerald-700">Resolved This Month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Breach Categories */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Breach Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BreachCategoryCard
            title="Critical Breaches"
            count={data.criticalBreaches}
            percentage={(data.criticalBreaches / data.totalBreaches) * 100}
            color="red"
            icon={<XCircle className="h-5 w-5" />}
            loading={loading}
          />
          
          <BreachCategoryCard
            title="Major Breaches"
            count={data.majorBreaches}
            percentage={(data.majorBreaches / data.totalBreaches) * 100}
            color="orange"
            icon={<AlertTriangle className="h-5 w-5" />}
            loading={loading}
          />
          
          <BreachCategoryCard
            title="Minor Breaches"
            count={data.minorBreaches}
            percentage={(data.minorBreaches / data.totalBreaches) * 100}
            color="amber"
            icon={<Clock className="h-5 w-5" />}
            loading={loading}
          />
        </div>
      </section>

      {/* Top Breach Reasons */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface-card-elevated p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Breach Reasons</h3>
            <div className="space-y-3">
              {data.topBreachReasons.map((reason, index) => (
                <div key={reason.reason} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{reason.reason}</p>
                      <p className="text-sm text-slate-600">{reason.count} occurrences</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{reason.percentage}%</p>
                    <p className="text-xs text-slate-500">of total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card-elevated p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Department Comparison</h3>
            <div className="space-y-3">
              {data.departmentComparison.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{dept.department}</p>
                      <p className="text-sm text-slate-600">{dept.breaches} breaches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      dept.rate > 15 ? 'text-red-600' : 
                      dept.rate > 10 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {dept.rate}%
                    </p>
                    <p className="text-xs text-slate-500">breach rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Trend */}
      <section>
        <div className="surface-card-elevated p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">6-Month Breach Trend</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {data.monthlyTrend.map((month) => (
              <div key={month.month} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">{month.month}</p>
                <p className="text-xl font-bold text-slate-900 mb-1">{month.breaches}</p>
                <p className={`text-sm font-medium ${
                  month.rate > 15 ? 'text-red-600' : 
                  month.rate > 10 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {month.rate}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
