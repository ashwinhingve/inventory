'use client';

import Link from 'next/link';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
  link?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  trend = 'neutral', 
  prefix = '', 
  suffix = '',
  link 
}: StatsCardProps) {
  const formattedValue = `${prefix}${value.toLocaleString()}${suffix}`;
  
  const TrendIcon = 
    trend === 'up' ? ArrowUpIcon : 
    trend === 'down' ? ArrowDownIcon : 
    MinusIcon;
  
  const trendColor = 
    trend === 'up' ? 'text-green-600' : 
    trend === 'down' ? 'text-red-600' : 
    'text-gray-600';
  
  const Card = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-800 text-sm font-semibold">{title}</h3>
        <span className={`flex items-center ${trendColor}`}>
          <TrendIcon className="h-4 w-4 mr-1" />
        </span>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
      </div>
    </div>
  );
  
  if (link) {
    return (
      <Link href={link}>
        <Card />
      </Link>
    );
  }
  
  return <Card />;
} 