import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AtsScoreGaugeProps {
  score: number;
}

export const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s >= 90) return '#10b981'; // Emerald 500
    if (s >= 70) return '#f59e0b'; // Amber 500
    return '#ef4444'; // Red 500
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={getColor(score)} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className="text-2xl font-bold text-slate-800">{score}</span>
        <span className="text-[10px] uppercase text-slate-500 font-semibold">ATS Score</span>
      </div>
    </div>
  );
};
