import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { BlogPostLayout } from '../../src/ui/blog/BlogPostLayout';
import { Heading } from '../../src/ui/Heading';
import { GuideMeta, Guide, getAllGuidesMeta, getGuideBySlug } from '../../src/lib/guides';

interface GuidePageProps {
  guide: Guide;
  relatedGuides: GuideMeta[];
}

export default function GuidePage({ guide, relatedGuides }: GuidePageProps) {
  const { meta, html } = guide;
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate structured data for Article (guides count as articles)
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": meta.title,
    "description": meta.excerpt,
    "author": {
      "@type": "Person",
      "name": meta.author
    },
    "datePublished": meta.publishDate,
    "dateModified": meta.publishDate,
    "publisher": {
      "@type": "Organization",
      "name": "Puerto Rico Travel Deals",
      "logo": {
        "@type": "ImageObject",
        "url": "https://puertoricotraveldeals.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://puertoricotraveldeals.com/guides/${meta.slug}`
    },
    "url": `https://puertoricotraveldeals.com/guides/${meta.slug}`,
    "keywords": meta.tags?.join(', ') || ''
  };

  // Create modified meta for guide-specific display
  const guideMeta = {
    ...meta,
    // Add guide-specific context for the blog post layout
    title: meta.title,
    excerpt: meta.duration ? `${meta.duration} • ${meta.excerpt}` : meta.excerpt
  };

  return (
    <>
      <Head>
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData, null, 2) }}
        />
      </Head>

      <BlogPostLayout meta={guideMeta} structuredData={articleStructuredData}>
        {/* Guide Type Badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-full bg-brand-sand px-3 py-1 text-sm font-bold text-brand-navy">
            Guide
          </span>
          {meta.duration && (
            <span className="text-brand-navy/70 text-sm">
              {meta.duration}
            </span>
          )}
        </div>

        {/* Guide Content */}
        <div className="prose-post" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <div className="border-brand-navy/10 mt-16 border-t pt-8">
            <Heading level={2} className="mb-6 text-xl">
              Related Guides
            </Heading>
            
            <div className="grid gap-6 md:grid-cols-2">
              {relatedGuides.slice(0, 2).map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={`/guides/${relatedGuide.slug}`}
                  className="border-brand-navy/10 group block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="text-brand-navy/70 mb-2 flex items-center gap-2 text-sm">
                    <span className="rounded bg-brand-sand px-2 py-0.5 text-xs font-bold text-brand-navy">
                      Guide
                    </span>
                    {relatedGuide.duration && (
                      <span>{relatedGuide.duration}</span>
                    )}
                    <span>•</span>
                    <span>{formatDate(relatedGuide.publishDate)}</span>
                  </div>
                  
                  <Heading 
                    level={3} 
                    className="mb-2 text-lg transition-colors group-hover:text-brand-blue"
                  >
                    {relatedGuide.title}
                  </Heading>
                  
                  <p className="text-brand-navy/80 text-sm leading-relaxed">
                    {relatedGuide.excerpt}
                  </p>
                  
                  {relatedGuide.tags && relatedGuide.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {relatedGuide.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-brand-sand/50 rounded px-2 py-1 text-xs text-brand-navy"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-blue transition-colors group-hover:text-brand-navy">
                    Read Guide
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </BlogPostLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const guides = await getAllGuidesMeta();
    const paths = guides.map((guide) => ({
      params: { slug: guide.slug }
    }));

    return {
      paths,
      fallback: false // 404 for non-existent guides
    };
  } catch (error) {
    console.error('Error generating static paths for guides:', error);
    return {
      paths: [],
      fallback: false
    };
  }
};

export const getStaticProps: GetStaticProps<GuidePageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  
  if (!slug) {
    return {
      notFound: true
    };
  }

  try {
    const [guide, allGuides] = await Promise.all([
      getGuideBySlug(slug),
      getAllGuidesMeta()
    ]);

    if (!guide) {
      return {
        notFound: true
      };
    }

    // Get related guides (excluding current guide, prefer same tags)
    const relatedGuides = allGuides
      .filter(g => g.slug !== slug)
      .sort((a, b) => {
        // Prioritize guides with shared tags
        const aSharedTags = a.tags?.filter(tag => guide.meta.tags?.includes(tag))?.length || 0;
        const bSharedTags = b.tags?.filter(tag => guide.meta.tags?.includes(tag))?.length || 0;
        
        if (aSharedTags !== bSharedTags) {
          return bSharedTags - aSharedTags;
        }
        
        // Fall back to newest
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      })
      .slice(0, 2);

    return {
      props: {
        guide,
        relatedGuides
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching guide ${slug}:`, error);
    return {
      notFound: true
    };
  }
};