import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200'
};

export function StatsCard({ title, count, icon, color, onClick }: StatsCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`rounded-lg border p-6 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{count.toLocaleString()}</p>
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </Component>
  );
}
