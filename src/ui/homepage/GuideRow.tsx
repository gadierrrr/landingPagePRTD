import React from 'react';

interface Guide {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags?: string[];
  publishDate?: string;
}

interface GuideRowProps {
  guides: Guide[];
  title: string;
  subtitle: string;
  onGuideClick?: (guideId: string, position: number) => void;
}

export const GuideRow: React.FC<GuideRowProps> = ({
  title,
  subtitle
}) => {
  return (
    <section className="bg-brand-sand/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-brand-navy sm:text-4xl">{title}</h2>
          <p className="text-brand-navy/70 mt-3 text-lg sm:text-xl">{subtitle}</p>
        </div>

        {/* Temporary Placeholder */}
        <div className="flex justify-center">
          <div className="max-w-md">
            <article className="ring-brand-navy/10 h-full overflow-hidden rounded-xl bg-white shadow-md ring-1">
              <div className="p-8 text-center">
                <div className="mb-4">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="mb-3 text-xl font-bold leading-tight text-brand-navy">
                  Guides coming soon
                </h3>
                <p className="text-brand-navy/70">
                  We're working on curated travel guides to help you discover the best of Puerto Rico. Stay tuned!
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};