'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartComponentProps {
  data?: Array<{ month: string; value: number }>;
}

export default function LineChartComponent({ data }: LineChartComponentProps) {
  const chartData = data && data.length > 0 ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-subtext text-sm">
        No metrics available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
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
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#00897B" 
          strokeWidth={3}
          dot={{ fill: '#00897B', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
