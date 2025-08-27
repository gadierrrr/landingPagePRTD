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
  keywords
}) => {
  const finalImage = image || ogImageUrl;
  const canonicalUrl = canonical || canonicalHref;
  
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {finalImage && <meta property="og:image" content={finalImage} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="Puerto Rico Travel Deals" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      {description && <meta property="twitter:description" content={description} />}
      {finalImage && <meta property="twitter:image" content={finalImage} />}
      {finalImage && <meta property="twitter:image:alt" content={title} />}
    </Head>
  );
};