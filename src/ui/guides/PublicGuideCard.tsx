import React from 'react';
import Link from 'next/link';
import { GuideMeta } from '../../lib/guides';
import { ResponsiveImage } from '../ResponsiveImage';

interface PublicGuideCardProps {
  guide: GuideMeta;
}

export const PublicGuideCard: React.FC<PublicGuideCardProps> = ({ guide }) => {
  return (
    <Link href={`/guides/${guide.slug}`} className="group block">
      <div className="ring-brand-navy/10 hover:ring-brand-blue/20 relative cursor-pointer overflow-hidden rounded-xl bg-white ring-1 transition-all duration-200 hover:shadow-md" aria-label={`View guide: ${guide.title}`}>
        {/* 16:9 Aspect Ratio Image */}
        <div className="to-brand-navy/20 relative aspect-[16/9] overflow-hidden rounded-xl bg-[#0A2A29] bg-gradient-to-br from-[#0A2A29]">
          {guide.heroImageUrl ? (
            <ResponsiveImage
              src={guide.heroImageUrl}
              alt={guide.title}
              objectPosition="50% 40%"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
            />
          ) : (
            <div className="from-brand-blue/20 to-brand-navy/20 flex size-full items-center justify-center bg-gradient-to-br">
              <div className="text-brand-navy/40 text-center">
                <div className="text-2xl font-bold">Guide</div>
                <div className="text-sm">No image</div>
              </div>
            </div>
          )}

          {/* Duration Badge */}
          {guide.duration && (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
              {guide.duration}
            </div>
          )}
        </div>
        
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 flex-1 text-lg font-bold leading-tight text-brand-navy transition-colors group-hover:text-brand-blue">
              {guide.title.length > 60 ? `${guide.title.slice(0, 60)}...` : guide.title}
            </h3>
            <span className="inline-flex shrink-0 rounded-full bg-brand-sand px-2 py-1 text-xs font-bold text-brand-navy">
              Guide
            </span>
          </div>
          
          <p className="text-brand-navy/70 line-clamp-2 text-sm">
            {guide.excerpt}
          </p>
          
          {/* Tags */}
          {guide.tags && guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {guide.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="bg-brand-navy/10 text-brand-navy/70 rounded px-2 py-1 text-xs">
                  {tag}
                </span>
              ))}
              {guide.tags.length > 3 && (
                <span className="text-brand-navy/50 text-xs">+{guide.tags.length - 3} more</span>
              )}
            </div>
          )}
          
          {/* Meta */}
          <div className="text-brand-navy/50 flex items-center justify-between text-xs">
            <div>
              By {guide.author}
            </div>
            <div>
              {new Date(guide.publishDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="pt-2">
            <div className="bg-brand-navy/10 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-navy transition-colors group-hover:bg-brand-blue group-hover:text-white">
              Read Guide <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};