import React from 'react';

interface BeachOverviewProps {
  beachName: string;
  description: string;
}

export const BeachOverview: React.FC<BeachOverviewProps> = ({ beachName, description }) => {
  return (
    <section className="border-brand-navy/10 border-b pb-8">
      <h2 className="mb-4 text-2xl font-bold text-brand-navy">
        About {beachName}
      </h2>
      <div className="prose prose-lg max-w-none">
        <p className="text-brand-navy/80 leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
};
