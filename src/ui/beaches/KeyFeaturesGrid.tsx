import React from 'react';

interface KeyFeature {
  title: string;
  description: string;
  icon?: string;
}

interface KeyFeaturesGridProps {
  features: KeyFeature[];
  beachName: string;
}

export const KeyFeaturesGrid: React.FC<KeyFeaturesGridProps> = ({ features, beachName }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <section className="border-brand-navy/10 border-b py-8">
      <h2 className="mb-6 text-2xl font-bold text-brand-navy">
        What Makes {beachName} Special
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-brand-sand/30 border-brand-navy/10 rounded-lg border p-6 transition-shadow hover:shadow-md"
          >
            {feature.icon && (
              <div className="mb-3 text-3xl" aria-hidden="true">
                {feature.icon}
              </div>
            )}
            <h3 className="mb-2 text-lg font-semibold text-brand-navy">
              {feature.title}
            </h3>
            <p className="text-brand-navy/70 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
