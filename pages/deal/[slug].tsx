import React, { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Deal } from '../../src/lib/forms';
import { readDeals } from '../../src/lib/dealsStore';
import { getAllDeals, getDealBySlug } from '../../src/lib/dealsRepo';
import { isSqliteEnabled } from '../../src/lib/dataSource';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { SEO } from '../../src/ui/SEO';
import { isExpired, displaySourceName, appendUtm, appendEnhancedUtm, formatEndDate, formatRelativeTime } from '../../src/lib/dealUtils';
import { generateDealStructuredData, generateDealMeta, generateBreadcrumbSchema, generateImageObjectSchema } from '../../src/lib/seo';
import { 
  trackDealView, 
  trackExternalDealClick,
  trackDealShare, 
  trackScrollDepth,
  trackTimeOnPage,
  generateEnhancedUtm,
  trackImageEngagement,
  trackTextEngagement,
  trackLinkEngagement,
  trackSectionEngagement 
} from '../../src/lib/analytics';

interface DealPageProps {
  deal: Deal;
  relatedDeals: Deal[];
}

export default function DealPage({ deal, relatedDeals }: DealPageProps) {
  const [copied, setCopied] = useState(false);
  const [startTime] = useState(Date.now());
  const [imageViewStart, setImageViewStart] = useState<number | null>(null);
  const [sectionStartTimes, setSectionStartTimes] = useState<Record<string, number>>({});
  const [readingPatterns, setReadingPatterns] = useState<Record<string, { wordCount: number; readingTime: number }>>({});
  
  const expired = isExpired(deal.expiresAt || deal.expiry);
  const hasDiscount = deal.originalPrice && deal.price;
  const discountPercent = hasDiscount ? Math.round(((deal.originalPrice! - deal.price!) / deal.originalPrice!) * 100) : 0;
  const sourceName = displaySourceName(deal.externalUrl, deal.sourceName);

  // Track page view and setup engagement tracking
  useEffect(() => {
    // Track deal page view
    trackDealView(deal, 'deal_detail_page');

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth && scrollPercent % 25 === 0) {
        maxScrollDepth = scrollPercent;
        trackScrollDepth(scrollPercent, 'deal_page');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Track time on page when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        trackTimeOnPage(timeSpent, 'deal_page');
      }
      
      // Track section completion patterns
      Object.entries(sectionStartTimes).forEach(([sectionName, startTime]) => {
        const sectionTime = (Date.now() - startTime) / 1000;
        const pattern = readingPatterns[sectionName];
        if (pattern && sectionTime > 2) { // Only track meaningful engagement
          trackSectionEngagement(sectionName, {
            timeInSection: sectionTime,
            interactionCount: pattern.wordCount > 0 ? 1 : 0,
            sectionHeight: window.innerHeight,
            scrollDepth: Math.round((window.pageYOffset / document.documentElement.scrollHeight) * 100)
          }, deal);
        }
      });
    };
  }, [deal, startTime, sectionStartTimes, readingPatterns]);
  
  // Generate structured data and meta
  const dealUrl = typeof window !== 'undefined' ? window.location.href : `https://puertoricotraveldeals.com/deal/${deal.slug}`;
  const structuredData = generateDealStructuredData(deal, dealUrl);
  const dealMeta = generateDealMeta(deal);

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://puertoricotraveldeals.com' },
    { name: 'Deals', url: 'https://puertoricotraveldeals.com/deals' },
    { name: deal.title, url: dealUrl }
  ]);

  // Generate image schema
  const imageSchema = generateImageObjectSchema(
    dealMeta.image,
    deal.title,
    1200,
    630
  );

  const handleExternalClick = async () => {
    if (deal.externalUrl) {
      try {
        // Enhanced tracking with server-side backup and CTA tracking
        const clickId = trackExternalDealClick(deal, 'deal_detail_page', 'get_this_deal_button');
        
        // Server-side tracking backup
        try {
          await fetch('/api/track-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dealId: deal.id || deal.slug,
              dealSlug: deal.slug,
              externalUrl: deal.externalUrl,
              clickId: clickId,
              context: 'deal_detail_page',
              ctaId: 'get_this_deal_button',
              timestamp: new Date().toISOString(),
              referrer: window.location.href
            }),
          });
        } catch (serverError) {
          console.warn('Server-side click tracking failed:', serverError);
        }
        
        // Generate enhanced UTM parameters
        const enhancedUtm = generateEnhancedUtm(deal, clickId);
        const urlWithEnhancedUTM = appendEnhancedUtm(deal.externalUrl, enhancedUtm);
        
        // Open external link
        window.open(urlWithEnhancedUTM, '_blank', 'noopener noreferrer');
      } catch (error) {
        console.warn('Enhanced tracking failed, falling back to basic tracking:', error);
        
        // Fallback to basic tracking
        const urlWithUTM = appendUtm(deal.externalUrl);
        window.open(urlWithUTM, '_blank', 'noopener noreferrer');
      }
    }
  };

  const handleShare = async () => {
    trackDealShare(deal, 'native_share');
    
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: deal.title,
      text: deal.description,
      url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    trackDealShare(deal, 'copy_link');
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      console.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    trackDealShare(deal, 'whatsapp');
    
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(`Check out this deal: ${deal.title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener noreferrer');
  };

  const handleFacebookShare = () => {
    trackDealShare(deal, 'facebook');
    
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener noreferrer');
  };

  // Image engagement tracking
  const handleImageHover = () => {
    if (!imageViewStart) {
      setImageViewStart(Date.now());
      trackImageEngagement('hover', {
        imageUrl: deal.image,
        imageIndex: 1,
        totalImages: 1
      }, deal);
    }
  };

  const handleImageView = () => {
    trackImageEngagement('view', {
      imageUrl: deal.image,
      imageIndex: 1,
      totalImages: 1,
      viewDuration: imageViewStart ? (Date.now() - imageViewStart) / 1000 : 0
    }, deal);
  };

  const handleImageClick = () => {
    trackImageEngagement('click', {
      imageUrl: deal.image,
      imageIndex: 1,
      totalImages: 1,
      viewDuration: imageViewStart ? (Date.now() - imageViewStart) / 1000 : 0
    }, deal);
  };

  // Text engagement tracking with reading patterns
  const handleTextSelection = (sectionType: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString();
      const wordCount = selectedText.split(/\s+/).length;
      const sectionStartTime = sectionStartTimes[sectionType] || Date.now();
      const readingTime = (Date.now() - sectionStartTime) / 1000;
      
      // Update reading patterns
      setReadingPatterns(prev => ({
        ...prev,
        [sectionType]: {
          wordCount: (prev[sectionType]?.wordCount || 0) + wordCount,
          readingTime: Math.max(prev[sectionType]?.readingTime || 0, readingTime)
        }
      }));
      
      trackTextEngagement('selection', {
        sectionType: sectionType,
        selectionLength: selectedText.length,
        wordCount: wordCount,
        readingTime: readingTime
      }, deal);
    }
  };

  // Link engagement tracking
  const handleLinkHover = (linkType: string, linkText: string, position: string) => {
    const hoverStart = Date.now();
    trackLinkEngagement('hover', {
      linkText: linkText,
      position: position,
      hoverTime: 0 // Track start of hover
    }, deal);
    
    return () => {
      trackLinkEngagement('hover_end', {
        linkText: linkText,
        position: position,
        hoverTime: (Date.now() - hoverStart) / 1000
      }, deal);
    };
  };

  // Section engagement tracking
  const trackSectionView = (sectionName: string) => {
    const startTime = Date.now();
    setSectionStartTimes(prev => ({ ...prev, [sectionName]: startTime }));
    
    trackSectionEngagement(sectionName, {
      timeInSection: 0,
      interactionCount: 1,
      sectionHeight: window.innerHeight,
      scrollDepth: Math.round((window.pageYOffset / document.documentElement.scrollHeight) * 100)
    }, deal);
  };

  return (
    <>
      <SEO 
        title={dealMeta.title}
        description={dealMeta.description}
        image={dealMeta.image}
        type="product"
        canonical={dealMeta.canonical}
        keywords={dealMeta.keywords}
      />
      {expired && (
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
      )}
      
      <SiteLayout>
        {/* Breadcrumb */}
        <nav className="border-brand-navy/10 border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="text-brand-navy/70 flex items-center gap-2 text-sm">
              <Link href="/" className="hover:text-brand-blue">Home</Link>
              <span>›</span>
              <Link href="/deals" className="hover:text-brand-blue">Deals</Link>
              <span>›</span>
              <span className="font-medium text-brand-navy">{deal.title}</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              {/* Deal Image */}
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-brand-sand">
                  {deal.image.startsWith('/images/uploads/') || deal.image.startsWith('/api/serve-upload/') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="size-full cursor-pointer object-cover"
                      onMouseEnter={handleImageHover}
                      onMouseLeave={handleImageView}
                      onClick={handleImageClick}
                    />
                  ) : (
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="cursor-pointer object-cover"
                      priority
                      onMouseEnter={handleImageHover}
                      onMouseLeave={handleImageView}
                      onClick={handleImageClick}
                    />
                  )}
                </div>
                {expired && (
                  <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                    Expired
                  </div>
                )}
                {!expired && hasDiscount && (
                  <div className="absolute right-4 top-4 rounded-full bg-brand-red px-3 py-1 text-sm font-bold text-white">
                    {discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Deal Info */}
              <div className="space-y-6">
                <div>
                  <div className="bg-brand-blue/10 mb-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold capitalize text-brand-blue">
                    {deal.category}
                  </div>
                  <h1 
                    className="text-3xl font-black text-brand-navy lg:text-4xl"
                    onMouseUp={() => handleTextSelection('title')}
                  >
                    {deal.title}
                  </h1>
                  <p className="text-brand-navy/70 mt-2 flex items-center gap-2 text-lg">
                    <span>📍</span>
                    {deal.location}
                  </p>
                </div>

                {/* Pricing */}
                {hasDiscount && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-brand-navy">
                      ${deal.price}
                    </span>
                    <span className="text-brand-navy/50 text-xl line-through">
                      ${deal.originalPrice}
                    </span>
                    <span className="text-lg font-bold text-brand-red">
                      {deal.amountLabel}
                    </span>
                  </div>
                )}

                {!hasDiscount && (
                  <div className="text-2xl font-black text-brand-red">
                    {deal.amountLabel}
                  </div>
                )}

                {/* CTA Button */}
                {!expired && deal.externalUrl && (
                  <button
                    onClick={handleExternalClick}
                    className="hover:bg-brand-blue/90 focus:ring-brand-blue/40 w-full rounded-xl bg-brand-blue px-8 py-4 text-lg font-bold text-white shadow-lg focus:outline-none focus:ring-4"
                  >
                    Get This Deal ➜
                  </button>
                )}

                {expired && (
                  <div className="bg-brand-navy/20 text-brand-navy/60 w-full rounded-xl px-8 py-4 text-center text-lg font-bold">
                    This deal has expired
                  </div>
                )}

                {/* Source Info */}
                {sourceName && (
                  <div className="border-brand-navy/10 bg-brand-sand/50 rounded-xl border p-4">
                    <h3 className="font-bold text-brand-navy">Source</h3>
                    <p className="text-brand-navy/80">{sourceName}</p>
                  </div>
                )}

                {/* Share & Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleShare}
                    onMouseEnter={() => handleLinkHover('button', 'Share', 'share_section')}
                    className="hover:bg-brand-sand/80 flex items-center gap-2 rounded-lg bg-brand-sand px-4 py-2 text-sm font-semibold text-brand-navy"
                  >
                    Share
                  </button>
                  <button
                    onClick={handleCopyLink}
                    onMouseEnter={() => handleLinkHover('button', 'Copy Link', 'share_section')}
                    className="hover:bg-brand-sand/80 flex items-center gap-2 rounded-lg bg-brand-sand px-4 py-2 text-sm font-semibold text-brand-navy"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    onMouseEnter={() => handleLinkHover('button', 'WhatsApp', 'share_section')}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={handleFacebookShare}
                    onMouseEnter={() => handleLinkHover('button', 'Facebook', 'share_section')}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Facebook
                  </button>
                  <a
                    href="mailto:report@puertoricotraveldeals.com?subject=Report Deal Issue"
                    onMouseEnter={() => handleLinkHover('link', 'Report Issue', 'share_section')}
                    className="text-brand-navy/50 ml-auto text-xs hover:text-brand-navy"
                  >
                    Report Issue
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="bg-brand-sand/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-8 lg:col-span-2">
                {/* Why we like it */}
                {deal.highlights && deal.highlights.length > 0 && (
                  <div 
                    ref={() => trackSectionView('highlights_section')}
                    onMouseEnter={() => trackSectionView('highlights_section')}
                  >
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">Why we like it</h2>
                    <ul className="space-y-3">
                      {deal.highlights.slice(0, 5).map((highlight, index) => (
                        <li 
                          key={index} 
                          className="text-brand-navy/80 flex items-start gap-3"
                          onMouseUp={() => handleTextSelection('highlights')}
                        >
                          <span className="mt-1 text-brand-blue">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What to know */}
                {deal.terms && (
                  <div onMouseEnter={() => trackSectionView('terms_section')}>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">What to know</h2>
                    <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                      <p 
                        className="text-brand-navy/80 leading-relaxed"
                        onMouseUp={() => handleTextSelection('terms')}
                      >
                        {deal.terms}
                      </p>
                    </div>
                  </div>
                )}

                {/* How to redeem */}
                {deal.howTo && deal.howTo.length > 0 && (
                  <div onMouseEnter={() => trackSectionView('redemption_section')}>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">How to redeem</h2>
                    <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                      <ol className="space-y-2">
                        {deal.howTo.map((step, index) => (
                          <li 
                            key={index} 
                            className="text-brand-navy/80 flex gap-3"
                            onMouseUp={() => handleTextSelection('redemption_steps')}
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Full Description */}
                {deal.fullDescription && deal.fullDescription !== deal.description && (
                  <div onMouseEnter={() => trackSectionView('description_section')}>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">More details</h2>
                    <div className="prose prose-lg max-w-none">
                      <p 
                        className="text-brand-navy/80 leading-relaxed"
                        onMouseUp={() => handleTextSelection('full_description')}
                      >
                        {deal.fullDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Meta Information */}
                <div className="border-brand-navy/10 rounded-xl border bg-white p-4">
                  <h3 className="mb-3 font-bold text-brand-navy">Deal Info</h3>
                  <div className="space-y-2 text-sm">
                    {deal.updatedAt && (
                      <div className="text-brand-navy/70">
                        Updated {formatRelativeTime(deal.updatedAt)}
                      </div>
                    )}
                    {(deal.expiresAt || deal.expiry) && (
                      <div className={expired ? 'font-bold text-red-600' : 'text-brand-navy/70'}>
                        {expired ? 'Expired' : `Ends ${formatEndDate(deal.expiresAt || deal.expiry!)}`}
                      </div>
                    )}
                    {deal.partner && (
                      <div className="text-brand-navy/70">
                        Partner: {deal.partner}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Deals */}
        {relatedDeals.length > 0 && (
          <section className="bg-white">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
              <h2 className="mb-8 text-center text-3xl font-black text-brand-navy">Similar Deals</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedDeals.slice(0, 3).map((relatedDeal) => (
                  <Link key={relatedDeal.id} href={`/deal/${relatedDeal.slug}`}>
                    <div className="border-brand-navy/10 group cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          src={relatedDeal.image}
                          alt={relatedDeal.title}
                          width={400}
                          height={300}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-blue">
                          {relatedDeal.category}
                        </div>
                        <h3 className="mb-2 font-bold text-brand-navy group-hover:text-brand-blue">
                          {relatedDeal.title}
                        </h3>
                        <p className="text-brand-navy/70 mb-2 text-sm">
                          📍 {relatedDeal.location}
                        </p>
                        <div className="font-bold text-brand-red">
                          {relatedDeal.amountLabel}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageSchema)
          }}
        />
      </SiteLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const deals = isSqliteEnabled() ? await getAllDeals() : await readDeals();
  const paths = deals
    .filter(deal => deal.slug)
    .map(deal => ({
      params: { slug: deal.slug! }
    }));

  return {
    paths,
    fallback: 'blocking' // Enable ISR for new deals
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const deal = isSqliteEnabled()
    ? await getDealBySlug(params?.slug as string)
    : (await readDeals()).find(d => d.slug === params?.slug);

  if (!deal) {
    return {
      notFound: true
    };
  }

  // Get related deals (same category or location, excluding current deal)
  const allDeals = isSqliteEnabled() ? await getAllDeals() : await readDeals();
  const relatedDeals = allDeals
    .filter(d =>
      d.id !== deal.id &&
      (d.category === deal.category || d.location === deal.location)
    )
    .slice(0, 3);

  return {
    props: {
      deal,
      relatedDeals
    },
    revalidate: 3600 // Revalidate every hour
  };
};