import '../src/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
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
        <meta property="og:image" content="https://puertoricotraveldeals.com/og-image.jpg" />
        <meta property="og:site_name" content="Puerto Rico Travel Deals" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://puertoricotraveldeals.com/" />
        <meta property="twitter:title" content="Puerto Rico Travel Deals - Discover Amazing Vacation Offers" />
        <meta property="twitter:description" content="Find the best travel deals to Puerto Rico. Curated daily offers on flights, hotels, tours, and vacation packages. Start planning your perfect Caribbean getaway today!" />
        <meta property="twitter:image" content="https://puertoricotraveldeals.com/og-image.jpg" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-EF509Z3W9G"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EF509Z3W9G');
            `,
          }}
        />
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}
