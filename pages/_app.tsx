import '../src/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { initializeAnalytics } from '../src/lib/analytics';

export default function App({ Component, pageProps }: AppProps) {
  // Initialize enhanced analytics
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <>
      <Head>
        <title>Puerto Rico Travel Deals - Discover Amazing Vacation Offers</title>
        <meta name="description" content="Find the best travel deals to Puerto Rico. Curated daily offers on flights, hotels, tours, and vacation packages. Start planning your perfect Caribbean getaway today!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://puertoricotraveldeals.com/" />
        <meta property="og:title" content="Puerto Rico Travel Deals - Discover Amazing Vacation Offers" />
        <meta property="og:description" content="Find the best travel deals to Puerto Rico. Curated daily offers on flights, hotels, tours, and vacation packages. Start planning your perfect Caribbean getaway today!" />
        <meta property="og:image" content="https://puertoricotraveldeals.com/api/serve-upload/2025/09/ogImage1-1758115388863.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:alt" content="Puerto Rico Travel Deals - Discover Amazing Vacation Offers" />
        <meta property="og:site_name" content="Puerto Rico Travel Deals" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@puertoricotraveldeals" />
        <meta name="twitter:creator" content="@puertoricotraveldeals" />
        <meta name="twitter:title" content="Puerto Rico Travel Deals - Discover Amazing Vacation Offers" />
        <meta name="twitter:description" content="Find the best travel deals to Puerto Rico. Curated daily offers on flights, hotels, tours, and vacation packages. Start planning your perfect Caribbean getaway today!" />
        <meta name="twitter:image" content="https://puertoricotraveldeals.com/api/serve-upload/2025/09/ogImage1-1758115388863.webp" />
        <meta name="twitter:image:alt" content="Puerto Rico Travel Deals - Discover Amazing Vacation Offers" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
      </Head>
      
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-EF509Z3W9G" strategy="afterInteractive" />
      <Script
        id="ga4"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EF509Z3W9G');
          `,
        }}
      />
      
      <Component {...pageProps} />
    </>
  );
}
