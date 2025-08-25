import React, { useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Deal } from '../../src/lib/forms';
import { readDeals } from '../../src/lib/dealsStore';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { SEO } from '../../src/ui/SEO';
import { isExpired, displaySourceName, appendUtm, formatEndDate, formatRelativeTime } from '../../src/lib/dealUtils';

interface DealPageProps {
  deal: Deal;
  relatedDeals: Deal[];
}

export default function DealPage({ deal, relatedDeals }: DealPageProps) {
  const [copied, setCopied] = useState(false);
  
  const expired = isExpired(deal.expiresAt || deal.expiry);
  const hasDiscount = deal.originalPrice && deal.price;
  const discountPercent = hasDiscount ? Math.round(((deal.originalPrice! - deal.price!) / deal.originalPrice!) * 100) : 0;
  const sourceName = displaySourceName(deal.externalUrl, deal.sourceName);

  const handleExternalClick = () => {
    if (deal.externalUrl) {
      const urlWithUTM = appendUtm(deal.externalUrl);
      window.open(urlWithUTM, '_blank', 'noopener noreferrer');
    }
  };

  const handleShare = async () => {
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
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(`Check out this deal: ${deal.title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener noreferrer');
  };

  const handleFacebookShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener noreferrer');
  };

  return (
    <>
      <SEO 
        title={`${deal.title} – Puerto Rico Travel Deals`}
        description={deal.fullDescription?.substring(0, 160) || deal.description}
        image={deal.image}
        type="product"
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
                      className="size-full object-cover"
                    />
                  ) : (
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-cover"
                      priority
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
                  <h1 className="text-3xl font-black text-brand-navy lg:text-4xl">{deal.title}</h1>
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
                    className="hover:bg-brand-sand/80 flex items-center gap-2 rounded-lg bg-brand-sand px-4 py-2 text-sm font-semibold text-brand-navy"
                  >
                    Share
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="hover:bg-brand-sand/80 flex items-center gap-2 rounded-lg bg-brand-sand px-4 py-2 text-sm font-semibold text-brand-navy"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={handleFacebookShare}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Facebook
                  </button>
                  <a
                    href="mailto:report@puertoricotraveldeals.com?subject=Report Deal Issue"
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
                  <div>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">Why we like it</h2>
                    <ul className="space-y-3">
                      {deal.highlights.slice(0, 5).map((highlight, index) => (
                        <li key={index} className="text-brand-navy/80 flex items-start gap-3">
                          <span className="mt-1 text-brand-blue">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What to know */}
                {deal.terms && (
                  <div>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">What to know</h2>
                    <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                      <p className="text-brand-navy/80 leading-relaxed">
                        {deal.terms}
                      </p>
                    </div>
                  </div>
                )}

                {/* How to redeem */}
                {deal.howTo && deal.howTo.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">How to redeem</h2>
                    <div className="border-brand-navy/10 rounded-xl border bg-white p-6">
                      <ol className="space-y-2">
                        {deal.howTo.map((step, index) => (
                          <li key={index} className="text-brand-navy/80 flex gap-3">
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
                  <div>
                    <h2 className="mb-4 text-2xl font-black text-brand-navy">More details</h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-brand-navy/80 leading-relaxed">
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

        {/* JSON-LD Structured Data - only when price info exists */}
        {(deal.price || deal.originalPrice) && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: deal.title,
                description: deal.fullDescription || deal.description,
                image: deal.image,
                category: deal.category,
                ...(deal.externalUrl && {
                  offers: {
                    "@type": "Offer",
                    url: deal.externalUrl,
                    ...(deal.price && { price: deal.price }),
                    ...(deal.currency && { priceCurrency: deal.currency }),
                    ...(deal.expiresAt && { priceValidUntil: deal.expiresAt }),
                    availability: expired ? "https://schema.org/Discontinued" : "https://schema.org/InStock"
                  }
                })
              })
            }}
          />
        )}
      </SiteLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const deals = await readDeals();
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
  const deals = await readDeals();
  const deal = deals.find(d => d.slug === params?.slug);

  if (!deal) {
    return {
      notFound: true
    };
  }

  // Get related deals (same category or location, excluding current deal)
  const relatedDeals = deals
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