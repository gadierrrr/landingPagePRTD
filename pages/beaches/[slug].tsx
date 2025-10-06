import React, { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Beach } from '../../src/lib/forms';
import { readBeaches, getBeachBySlug } from '../../src/lib/beachesStore';
import { getBeachBySlug as getBeachBySlugDb, getRelatedBeaches, getAllBeachesLight } from '../../src/lib/beachesRepo';
import { isSqliteEnabled } from '../../src/lib/dataSource';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { SEO } from '../../src/ui/SEO';
import { Section } from '../../src/ui/Section';
import { Heading } from '../../src/ui/Heading';
import { TAG_LABELS, AMENITY_LABELS, CONDITION_LABELS } from '../../src/constants/beachVocab';
import { generateBeachMeta, generateBeachStructuredData, generateBreadcrumbSchema } from '../../src/lib/seo';
import { RelatedBeachesGrid } from '../../src/ui/beaches/RelatedBeachesGrid';
import { isPopularBeach } from '../../src/constants/popularBeaches';
import {
  trackBeachDetailsView,
  trackBeachDirectionsClick
} from '../../src/lib/analytics';

interface BeachPageProps {
  beach: Beach;
  relatedBeaches: Beach[]; // Will be used in Phase 3
}

export default function BeachPage({ beach, relatedBeaches }: BeachPageProps) {
  // Track page view on mount
  useEffect(() => {
    trackBeachDetailsView(beach);
  }, [beach]);

  // Generate SEO metadata and structured data
  const beachUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://puertoricotraveldeals.com/beaches/${beach.slug}`;
  const beachMeta = generateBeachMeta(beach);
  const structuredData = generateBeachStructuredData(beach, beachUrl);

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://puertoricotraveldeals.com' },
    { name: 'Beaches', url: 'https://puertoricotraveldeals.com/beachfinder' },
    { name: beach.name, url: beachUrl }
  ]);

  const handleDirectionsClick = () => {
    const mapsUrl = `https://maps.apple.com/?daddr=${beach.coords.lat},${beach.coords.lng}&dirflg=d`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    
    trackBeachDirectionsClick(beach, undefined, 'beach_detail_page');
  };

  const getConditionColor = (condition: string, type: 'sargassum' | 'surf' | 'wind') => {
    if (!condition) return '';
    
    switch (type) {
      case 'sargassum':
        return condition === 'none' ? 'bg-green-100 text-green-800' :
               condition === 'light' ? 'bg-yellow-100 text-yellow-800' :
               condition === 'moderate' ? 'bg-orange-100 text-orange-800' :
               'bg-red-100 text-red-800';
      case 'surf':
        return condition === 'calm' ? 'bg-blue-100 text-blue-800' :
               'bg-teal-100 text-teal-800';
      case 'wind':
        return condition === 'calm' || condition === 'light' ? 'bg-green-100 text-green-800' :
               'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <SEO 
        title={beachMeta.title}
        description={beachMeta.description}
        canonical={beachMeta.canonical}
        image={beachMeta.image}
        type="website"
        keywords={beachMeta.keywords}
      />
      
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema, null, 2)
          }}
        />
      </Head>

      <SiteLayout>
        {/* Breadcrumb */}
        <nav className="border-brand-navy/10 border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="text-brand-navy/70 flex items-center gap-2 text-sm">
              <Link href="/" className="hover:text-brand-blue">Home</Link>
              <span>›</span>
              <Link href="/beachfinder" className="hover:text-brand-blue">Beach Finder</Link>
              <span>›</span>
              <span className="text-brand-navy">{beach.name}</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <Section>
          <div className="mx-auto max-w-4xl">
            {/* Cover Image */}
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src={beach.coverImage}
                alt={`${beach.name} beach in ${beach.municipality}, Puerto Rico - scenic coastal view`}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              
              {/* Municipality Badge */}
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white">
                📍 {beach.municipality}
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <Heading level={1} className="mb-2">
                {beach.name}
              </Heading>
              
              {/* Access Label */}
              {beach.accessLabel && (
                <div className="mb-4">
                  <span className="inline-flex rounded-full bg-brand-sand px-3 py-1 text-sm font-medium text-brand-navy">
                    🚶 {beach.accessLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {beach.tags && beach.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-brand-navy">Beach Features</h3>
                <div className="flex flex-wrap gap-2">
                  {beach.tags.map(tag => (
                    <span 
                      key={tag}
                      className="bg-brand-blue/10 inline-flex rounded-full px-3 py-1 text-sm font-medium text-brand-navy"
                    >
                      {TAG_LABELS[tag] || tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Conditions */}
            {(beach.sargassum || beach.surf || beach.wind) && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-brand-navy">Current Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {beach.sargassum && (
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getConditionColor(beach.sargassum, 'sargassum')}`}>
                      Sargassum: {CONDITION_LABELS.sargassum[beach.sargassum]}
                    </span>
                  )}
                  {beach.surf && (
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getConditionColor(beach.surf, 'surf')}`}>
                      Surf: {CONDITION_LABELS.surf[beach.surf]}
                    </span>
                  )}
                  {beach.wind && (
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getConditionColor(beach.wind, 'wind')}`}>
                      Wind: {CONDITION_LABELS.wind[beach.wind]}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {beach.amenities && beach.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-brand-navy">Amenities</h3>
                <div className="text-brand-navy/70 flex flex-wrap gap-1 text-sm">
                  {beach.amenities.map(amenity => (
                    <span key={amenity} className="inline-flex items-center">
                      {AMENITY_LABELS[amenity] || amenity}
                    </span>
                  )).reduce((prev, curr, index) => 
                    index === 0 ? [curr] : [...prev, <span key={`sep-${index}`} className="text-brand-navy/30 mx-1">•</span>, curr], 
                    [] as React.ReactNode[]
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {beach.description && (
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-brand-navy">About This Beach</h3>
                <p className="text-brand-navy/80 leading-relaxed">
                  {beach.description}
                </p>
              </div>
            )}

            {/* Features */}
            {beach.features && beach.features.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-brand-navy">Beach Features</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {beach.features.map((feature, index) => (
                    <div key={index} className="rounded-lg bg-brand-sand/30 p-4">
                      <h4 className="mb-2 font-semibold text-brand-navy">{feature.title}</h4>
                      <p className="text-brand-navy/70 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parking & Access */}
            {beach.parkingDetails && (
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-brand-navy">🚗 Parking & Access</h3>
                <p className="text-brand-navy/80 leading-relaxed">
                  {beach.parkingDetails}
                </p>
              </div>
            )}

            {/* Safety Information */}
            {beach.safetyInfo && (
              <div className="mb-8 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-orange-900">⚠️ Safety Information</h3>
                <p className="text-orange-900/80 leading-relaxed">
                  {beach.safetyInfo}
                </p>
              </div>
            )}

            {/* Visitor Tips */}
            {beach.tips && beach.tips.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-brand-navy">💡 Visitor Tips</h3>
                <div className="space-y-3">
                  {beach.tips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="text-brand-blue shrink-0 font-semibold">[{tip.category}]</span>
                      <p className="text-brand-navy/80">{tip.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Tips */}
            {beach.localTips && (
              <div className="mb-8">
                <h3 className="mb-3 text-lg font-semibold text-brand-navy">🌴 Local Tips</h3>
                <p className="text-brand-navy/80 leading-relaxed">
                  {beach.localTips}
                </p>
              </div>
            )}

            {/* Best Time to Visit */}
            {beach.bestTime && (
              <div className="mb-8 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-blue-900">📅 Best Time to Visit</h3>
                <p className="text-blue-900/80 leading-relaxed">
                  {beach.bestTime}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-8 flex gap-4">
              <button
                onClick={handleDirectionsClick}
                className="flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-navy"
              >
                🧭 Get Directions
              </button>
              <Link 
                href="/beachfinder" 
                className="bg-brand-navy/10 flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-brand-navy transition-colors hover:bg-brand-blue hover:text-white"
              >
                ← Back to Beach Finder
              </Link>
            </div>

            {/* Coordinates (for reference) */}
            <div className="text-brand-navy/40 border-brand-navy/10 border-t pt-4 text-xs">
              Coordinates: {beach.coords.lat}, {beach.coords.lng}
              {beach.updatedAt && (
                <span className="ml-4">
                  Updated: {new Date(beach.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </Section>

        {/* Related Beaches Section */}
        {relatedBeaches && relatedBeaches.length > 0 && (
          <Section>
            <div className="mx-auto max-w-6xl">
              <RelatedBeachesGrid 
                beaches={relatedBeaches}
                currentBeach={beach}
                title={`More Beaches in ${beach.municipality}`}
              />
            </div>
          </Section>
        )}
      </SiteLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Use lightweight query to reduce memory during build
  const beaches = isSqliteEnabled() ? await getAllBeachesLight() : await readBeaches();

  // Only pre-render popular beaches to reduce build time and memory
  // Other beaches will be rendered on-demand via fallback: 'blocking'
  const popularBeaches = beaches.filter(beach =>
    beach.slug && isPopularBeach({
      municipality: beach.municipality,
      tags: beach.tags
    })
  );

  const paths = popularBeaches.map(beach => ({
    params: { slug: beach.slug! }
  }));

  console.log(`[Build] Pre-rendering ${paths.length} popular beaches out of ${beaches.length} total`);

  return {
    paths,
    fallback: 'blocking' // Other beaches rendered on-demand, then cached
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const beach = isSqliteEnabled()
    ? await getBeachBySlugDb(params?.slug as string)
    : await getBeachBySlug(params?.slug as string);

  if (!beach || !beach.id) {
    return {
      notFound: true
    };
  }

  // Get related beaches using optimized query
  // For SQLite: uses getRelatedBeaches (lightweight, scored query)
  // For JSON: fallback to simple same-municipality filter
  let relatedBeaches: Beach[] = [];

  if (isSqliteEnabled()) {
    relatedBeaches = await getRelatedBeaches(beach.id!, 6);
  } else {
    // Fallback for JSON store: simple municipality match
    const allBeaches = await readBeaches();
    relatedBeaches = allBeaches
      .filter(b => b.id !== beach.id && b.municipality === beach.municipality)
      .slice(0, 6);
  }

  return {
    props: {
      beach,
      relatedBeaches
    },
    revalidate: 3600 // 1 hour ISR
  };
};