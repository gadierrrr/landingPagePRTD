import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description?: string;
  canonicalHref?: string;
  image?: string;
  ogImageUrl?: string;
  noIndex?: boolean;
  type?: 'website' | 'product';
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonicalHref, 
  image,
  ogImageUrl, 
  noIndex = false,
  type = 'website'
}) => {
  const finalImage = image || ogImageUrl;
  
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonicalHref && <link rel="canonical" href={canonicalHref} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {finalImage && <meta property="og:image" content={finalImage} />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      {description && <meta property="twitter:description" content={description} />}
      {finalImage && <meta property="twitter:image" content={finalImage} />}
    </Head>
  );
};