'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NetWorthChartProps {
  data?: Array<{ month: string; value: number }>;
}

export default function NetWorthChart({ data }: NetWorthChartProps) {
  const chartData = data && data.length > 0 ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-subtext text-sm">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00897B" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#00897B" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }} 
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#00897B" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorValue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
