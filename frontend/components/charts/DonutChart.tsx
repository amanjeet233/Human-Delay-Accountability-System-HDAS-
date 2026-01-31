'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  data?: Array<{ name: string; value: number }>;
}

export default function DonutChart({ data }: DonutChartProps) {
  const defaultData = [
    { name: 'Housing', value: 35 },
    { name: 'Food', value: 25 },
    { name: 'Transport', value: 20 },
    { name: 'Entertainment', value: 12 },
    { name: 'Other', value: 8 },
  ];

  const chartData = data || defaultData;
  const COLORS = ['#00897B', '#80CBC4', '#004D40', '#26A69A', '#B2DFDB'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }} 
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
