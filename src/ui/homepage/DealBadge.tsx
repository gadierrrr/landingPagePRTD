import React from 'react';

export type BadgeType = 'hot' | 'editor';

interface DealBadgeProps {
  type: BadgeType;
  className?: string;
}

export const DealBadge: React.FC<DealBadgeProps> = ({ type, className = '' }) => {
  const badgeConfig = {
    hot: {
      label: 'Hot Deal This Week',
      bgColor: 'bg-brand-red',
      textColor: 'text-white',
      icon: '🔥'
    },
    editor: {
      label: "Editor's Pick",
      bgColor: 'bg-brand-blue',
      textColor: 'text-white', 
      icon: '⭐'
    }
  };

  const config = badgeConfig[type];

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${config.bgColor} ${config.textColor} ${className}`}
      aria-label={config.label}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};