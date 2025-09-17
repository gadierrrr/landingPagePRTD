import React from 'react';
import Link from 'next/link';

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
  guides,
  title,
  subtitle,
  onGuideClick
}) => {
  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-sand/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-brand-navy sm:text-4xl">{title}</h2>
          <p className="text-brand-navy/70 mt-3 text-lg sm:text-xl">{subtitle}</p>
        </div>

        {/* Guides Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 6).map((guide, index) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              onClick={() => onGuideClick?.(guide.id, index)}
              className="group block"
            >
              <article className="ring-brand-navy/10 hover:ring-brand-blue/20 h-full overflow-hidden rounded-xl bg-white shadow-md ring-1 transition-all duration-200 hover:shadow-lg">
                {/* Content */}
                <div className="p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {guide.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-brand-blue/10 inline-flex rounded-full px-2 py-1 text-xs font-medium text-brand-blue"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="mb-3 text-xl font-bold leading-tight text-brand-navy transition-colors group-hover:text-brand-blue">
                    {guide.title}
                  </h3>
                  
                  <p className="text-brand-navy/70 mb-4 line-clamp-3">
                    {guide.excerpt}
                  </p>
                  
                  {/* Meta */}
                  {guide.publishDate && (
                    <div className="text-brand-navy/50 text-sm">
                      {new Date(guide.publishDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                  
                  {/* CTA Button */}
                  <div className="mt-4">
                    <div className="group-hover:bg-brand-blue/90 inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 text-sm font-bold text-white transition-colors">
                      Grab deal →
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* See All CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/guides"
            className="hover:bg-brand-navy/90 inline-flex items-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-bold text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
          >
            See all guides
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};