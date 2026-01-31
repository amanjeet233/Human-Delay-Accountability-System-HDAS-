'use client';

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

interface RadialGaugeProps {
  value?: number;
  label?: string;
}

export default function RadialGauge({ value = 72, label = 'Health Score' }: RadialGaugeProps) {
  const data = [
    {
      name: label,
      value: value,
      fill: '#80CBC4',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="60%" 
        outerRadius="90%" 
        barSize={20} 
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
        />
        <Legend 
          iconSize={0}
          layout="vertical"
          verticalAlign="middle"
          align="center"
          content={() => (
            <div className="text-center">
              <div className="text-4xl font-bold text-heading">{value}%</div>
              <div className="text-sm text-subtext mt-1">{label}</div>
            </div>
          )}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
