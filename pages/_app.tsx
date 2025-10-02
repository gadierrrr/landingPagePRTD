import '../src/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initializeAnalytics } from '../src/lib/analytics';

const GA_MEASUREMENT_ID = 'G-EF509Z3W9G';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Initialize enhanced analytics on idle so it doesn't contend with LCP
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const init = () => initializeAnalytics();
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(init, { timeout: 2000 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(init, 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!router.isReady || typeof window === 'undefined') {
      return undefined;
    }

    const sendPageView = (url: string) => {
      const pagePath = url || window.location.pathname + window.location.search;
      const pageTitle = document.title;

      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: pagePath,
          page_title: pageTitle,
        });
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push([
          'config',
          GA_MEASUREMENT_ID,
          {
            page_path: pagePath,
            page_title: pageTitle,
          },
        ]);
      }
    };

    // Send initial page view for hydration navigation edge cases
    sendPageView(window.location.pathname + window.location.search);

    const handleRouteChange = (url: string) => {
      sendPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

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
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* eslint-disable-next-line no-restricted-syntax */}
        <meta name="theme-color" content="#0b2b54" />
      </Head>
      
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script
        id="ga4"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
      
      <Component {...pageProps} />
    </>
  );
}
