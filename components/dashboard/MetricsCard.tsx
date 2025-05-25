import React from 'react';

interface Metric {
  label: string;
  value: string;
  color?: string;
}

interface MetricsCardProps {
  title: string;
  timeframe: string;
  metrics: Metric[];
  className?: string;
}

export default function MetricsCard({ title, timeframe, metrics, className = '' }: MetricsCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 border border-gray-100 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{timeframe}</span>
      </div>
      <div className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex justify-between items-center">
            <span className="text-gray-600">{metric.label}</span>
            <span className={`font-medium ${metric.color || 'text-gray-900'}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 