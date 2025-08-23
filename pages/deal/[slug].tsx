import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Deal } from '../../src/lib/forms';
import { readDeals } from '../../src/lib/dealsStore';
import { SiteLayout } from '../../src/ui/layout/SiteLayout';
import { SEO } from '../../src/ui/SEO';

interface DealPageProps {
  deal: Deal;
  relatedDeals: Deal[];
}

export default function DealPage({ deal, relatedDeals }: DealPageProps) {
  const isExpired = deal.expiresAt ? new Date(deal.expiresAt) < new Date() : false;
  const hasDiscount = deal.originalPrice && deal.price;
  const discountPercent = hasDiscount ? Math.round(((deal.originalPrice! - deal.price!) / deal.originalPrice!) * 100) : 0;

  const handleExternalClick = () => {
    if (deal.externalUrl) {
      const urlWithUTM = new URL(deal.externalUrl);
      urlWithUTM.searchParams.set('utm_source', 'PRTD');
      urlWithUTM.searchParams.set('utm_medium', 'referral');
      urlWithUTM.searchParams.set('utm_campaign', 'deal_page');
      window.open(urlWithUTM.toString(), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <SEO 
        title={`${deal.title} – Puerto Rico Travel Deals`}
        description={deal.fullDescription?.substring(0, 160) || deal.description}
        image={deal.image}
        type="product"
      />
      
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
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {isExpired && (
                  <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                    Expired
                  </div>
                )}
                {!isExpired && hasDiscount && (
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
                {!isExpired && deal.externalUrl && (
                  <button
                    onClick={handleExternalClick}
                    className="hover:bg-brand-blue/90 focus:ring-brand-blue/40 w-full rounded-xl bg-brand-blue px-8 py-4 text-lg font-bold text-white shadow-lg focus:outline-none focus:ring-4"
                  >
                    Get This Deal ➜
                  </button>
                )}

                {isExpired && (
                  <div className="bg-brand-navy/20 text-brand-navy/60 w-full rounded-xl px-8 py-4 text-center text-lg font-bold">
                    This deal has expired
                  </div>
                )}

                {/* Partner Info */}
                {deal.partner && (
                  <div className="border-brand-navy/10 bg-brand-sand/50 rounded-xl border p-4">
                    <h3 className="font-bold text-brand-navy">Partner</h3>
                    <p className="text-brand-navy/80">{deal.partner}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="bg-brand-sand/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Description */}
              <div className="lg:col-span-2">
                <h2 className="mb-6 text-2xl font-black text-brand-navy">About This Deal</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-brand-navy/80 leading-relaxed">
                    {deal.fullDescription || deal.description}
                  </p>
                </div>

                {/* Highlights */}
                {deal.highlights && deal.highlights.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-xl font-black text-brand-navy">What&apos;s Included</h3>
                    <ul className="space-y-2">
                      {deal.highlights.map((highlight, index) => (
                        <li key={index} className="text-brand-navy/80 flex items-start gap-3">
                          <span className="mt-1 text-brand-blue">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Expiry Info */}
                {deal.expiresAt && (
                  <div className="border-brand-navy/10 rounded-xl border bg-white p-4">
                    <h3 className="mb-2 font-bold text-brand-navy">Deal Expires</h3>
                    <p className={`text-sm ${isExpired ? 'font-bold text-red-600' : 'text-brand-navy/70'}`}>
                      {new Date(deal.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Terms */}
                {deal.terms && (
                  <div className="border-brand-navy/10 rounded-xl border bg-white p-4">
                    <h3 className="mb-2 font-bold text-brand-navy">Terms & Conditions</h3>
                    <p className="text-brand-navy/70 text-sm leading-relaxed">
                      {deal.terms}
                    </p>
                  </div>
                )}
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
                  availability: isExpired ? "https://schema.org/Discontinued" : "https://schema.org/InStock"
                }
              })
            })
          }}
        />
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