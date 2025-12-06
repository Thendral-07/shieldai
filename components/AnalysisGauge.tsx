
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisGaugeProps {
  score: number;
}

const AnalysisGauge: React.FC<AnalysisGaugeProps> = ({ score }) => {
  // Determine color based on score
  let color = '#22c55e'; // Green (Safe)
  let statusText = 'Safe';
  let shadowColor = 'rgba(34, 197, 94, 0.2)';
  
  if (score > 20) { 
    color = '#eab308'; 
    statusText = 'Caution'; 
    shadowColor = 'rgba(234, 179, 8, 0.2)';
  } 
  if (score > 50) { 
    color = '#f97316'; 
    statusText = 'High Risk'; 
    shadowColor = 'rgba(249, 115, 22, 0.2)';
  } 
  if (score > 75) { 
    color = '#ef4444'; 
    statusText = 'SCAM ALERT'; 
    shadowColor = 'rgba(239, 68, 68, 0.3)';
  }

  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full min-h-[180px]">
      {/* Glow effect */}
      <div 
        className="absolute inset-4 rounded-full blur-3xl opacity-50 transition-colors duration-500"
        style={{ background: shadowColor }}
      />
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="60%"
            startAngle={180}
            endAngle={0}
            innerRadius="75%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={8}
          >
            <Cell key="cell-score" fill={color} className="transition-all duration-1000 ease-out" />
            <Cell key="cell-remaining" fill="#1e293b" /> 
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-[50%] left-0 right-0 text-center z-10 -translate-y-1/2 mt-4">
        <div className="text-5xl lg:text-6xl font-black transition-colors duration-500 tracking-tighter leading-none" style={{ color }}>
          {score}
        </div>
        <div className="text-[10px] lg:text-xs font-semibold mt-1 text-slate-400 uppercase tracking-widest">
          Risk Score
        </div>
        <div className={`mt-2 inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-200 shadow-xl`}>
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default AnalysisGauge;
