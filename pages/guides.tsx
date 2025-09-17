import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { GuideMeta, getAllGuidesMeta } from '../src/lib/guides';
import { PublicGuidesGrid } from '../src/ui/guides/PublicGuidesGrid';

interface GuidesPageProps {
  guides: GuideMeta[];
}

export default function GuidesPage({ guides }: GuidesPageProps) {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Handle URL parameters for tag filtering
  React.useEffect(() => {
    if (router.isReady && router.query.tag) {
      const urlTag = router.query.tag as string;
      setSelectedTag(urlTag);
    }
  }, [router.isReady, router.query.tag]);

  // Get unique tags from guides data
  const tags = useMemo(() => {
    const allTags = guides.flatMap(guide => guide.tags || []);
    return Array.from(new Set(allTags));
  }, [guides]);

  // Filter guides by tag
  const filteredGuides = useMemo(() => {
    if (selectedTag === 'all') {
      return guides;
    }
    return guides.filter(guide => 
      guide.tags && guide.tags.includes(selectedTag)
    );
  }, [guides, selectedTag]);

  const updateUrlWithTag = (tag: string) => {
    const url = tag === 'all' ? '/guides' : `/guides?tag=${encodeURIComponent(tag)}`;
    router.push(url, undefined, { shallow: true });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    updateUrlWithTag(tag);
  };

  return (
    <SiteLayout>
      <SEO 
        title="Puerto Rico Travel Guides — PRTD"
        description="Hand-picked itineraries, neighborhoods, and week-by-week plans across Puerto Rico. Local insights for authentic island experiences."
        keywords={['Puerto Rico guides', 'travel itineraries', 'local experiences', 'island travel', 'Caribbean guides', 'Puerto Rico planning']}
        canonical="https://puertoricotraveldeals.com/guides"
      />
      
      <Section>
        <Heading level={1}>Guides</Heading>
        <p className="text-brand-navy/70 mt-4">
          Hand-picked itineraries, neighborhoods, and week-by-week plans across Puerto Rico
        </p>
        
        {/* Tag Filter */}
        {guides.length > 0 && tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => handleTagClick('all')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                selectedTag === 'all'
                  ? 'bg-brand-navy text-white'
                  : 'hover:bg-brand-navy/10 bg-brand-sand text-brand-navy'
              }`}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  selectedTag === tag
                    ? 'bg-brand-navy text-white'
                    : 'hover:bg-brand-navy/10 bg-brand-sand text-brand-navy'
                }`}
              >
                {tag.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        {guides.length > 0 && (
          <div className="text-brand-navy/60 mt-6 text-sm">
            Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
            {selectedTag !== 'all' && ` for "${selectedTag.replace('-', ' ')}"`}
          </div>
        )}
        
        {/* Guides Grid */}
        <div className="mt-8">
          <PublicGuidesGrid guides={filteredGuides} />
        </div>

        {/* No Results */}
        {guides.length > 0 && filteredGuides.length === 0 && (
          <div className="bg-brand-sand/50 border-brand-navy/10 mt-8 rounded-lg border px-6 py-8 text-center">
            <p className="text-brand-navy/70">No guides found for "{selectedTag.replace('-', ' ')}"</p>
            <button
              onClick={() => handleTagClick('all')}
              className="mt-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-navy"
            >
              View all guides
            </button>
          </div>
        )}

        {/* Empty State */}
        {guides.length === 0 && (
          <div className="bg-brand-sand/50 border-brand-navy/10 mt-8 rounded-lg border px-6 py-8 text-center">
            <p className="text-brand-navy/70">No guides available yet. Check back soon for exciting travel content!</p>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

export const getStaticProps: GetStaticProps<GuidesPageProps> = async () => {
  try {
    const guides = await getAllGuidesMeta();
    
    return {
      props: {
        guides
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching guides:', error);
    
    return {
      props: {
        guides: []
      },
      revalidate: 60 // Retry more frequently on error
    };
  }
};