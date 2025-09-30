import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  canonicalHref?: string; // Keep for backward compatibility
  image?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
  type?: 'website' | 'product';
  keywords?: string[];
  locale?: string; // Language locale (e.g., 'en' or 'es')
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  canonicalHref,
  image,
  ogImageUrl,
  noIndex = false,
  type = 'website',
  keywords,
  locale = 'en'
}) => {
  const finalImage = image || ogImageUrl;
  const canonicalUrl = canonical || canonicalHref;

  // Generate hreflang alternate URLs
  const baseUrl = canonicalUrl ? canonicalUrl.replace(/\/(en|es)\//, '/') : '';
  const enUrl = canonicalUrl || baseUrl;
  const esUrl = baseUrl ? baseUrl.replace('puertoricotraveldeals.com', 'puertoricotraveldeals.com/es') : '';
  
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Hreflang tags for bilingual support */}
      {canonicalUrl && (
        <>
          <link rel="alternate" hrefLang="en" href={enUrl} />
          <link rel="alternate" hrefLang="es" href={esUrl} />
          <link rel="alternate" hrefLang="x-default" href={enUrl} />
        </>
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {finalImage && <meta property="og:image" content={finalImage} />}
      {finalImage && <meta property="og:image:width" content="1200" />}
      {finalImage && <meta property="og:image:height" content="630" />}
      {finalImage && <meta property="og:image:type" content="image/webp" />}
      {finalImage && <meta property="og:image:alt" content={title} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Puerto Rico Travel Deals" />
      <meta property="og:locale" content={locale === 'es' ? 'es_PR' : 'en_US'} />
      <meta property="og:locale:alternate" content={locale === 'es' ? 'en_US' : 'es_PR'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@puertoricotraveldeals" />
      <meta name="twitter:creator" content="@puertoricotraveldeals" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {finalImage && <meta name="twitter:image" content={finalImage} />}
      {finalImage && <meta name="twitter:image:alt" content={title} />}
    </Head>
  );
};