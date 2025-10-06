import React from 'react';

interface VisitingTip {
  title: string;
  description: string;
  category?: 'timing' | 'safety' | 'access' | 'cost' | 'activities' | 'general';
  isWarning?: boolean;
}

interface VisitingTipsSectionProps {
  tips: VisitingTip[];
  beachName: string;
}

const getCategoryIcon = (category?: string): string => {
  switch (category) {
    case 'timing':
      return '⏰';
    case 'safety':
      return '⚠️';
    case 'access':
      return '🚗';
    case 'cost':
      return '💰';
    case 'activities':
      return '🎯';
    default:
      return '💡';
  }
};

const getCategoryLabel = (category?: string): string => {
  switch (category) {
    case 'timing':
      return 'Timing';
    case 'safety':
      return 'Safety';
    case 'access':
      return 'Access';
    case 'cost':
      return 'Cost';
    case 'activities':
      return 'Activities';
    default:
      return 'General';
  }
};

export const VisitingTipsSection: React.FC<VisitingTipsSectionProps> = ({ tips, beachName }) => {
  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <section className="border-brand-navy/10 border-b py-8">
      <h2 className="mb-6 text-2xl font-bold text-brand-navy">
        Tips for Visiting {beachName}
      </h2>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`rounded-lg border p-5 transition-shadow hover:shadow-sm ${
              tip.isWarning
                ? 'border-brand-red/30 bg-brand-red/5'
                : 'border-brand-navy/10 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden="true">
                {getCategoryIcon(tip.category)}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold text-brand-navy">{tip.title}</h3>
                  {tip.category && (
                    <span className="text-brand-navy/50 text-xs uppercase tracking-wide">
                      {getCategoryLabel(tip.category)}
                    </span>
                  )}
                </div>
                <p className="text-brand-navy/70 text-sm leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
