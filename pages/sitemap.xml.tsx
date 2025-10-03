import { GetServerSideProps } from 'next';
import { readDeals } from '../src/lib/dealsStore';
import { getAllDeals } from '../src/lib/dealsRepo';
import { readBeaches } from '../src/lib/beachesStore';
import { getAllBeaches } from '../src/lib/beachesRepo';
import { isSqliteEnabled } from '../src/lib/dataSource';
import { isExpired } from '../src/lib/dealUtils';
import { getAllGuidesMeta } from '../src/lib/guides';

export default function Sitemap() {
  // This component doesn't render anything - it's just for sitemap generation
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [deals, guides, beaches] = await Promise.all([
    isSqliteEnabled() ? getAllDeals() : readDeals(),
    getAllGuidesMeta(),
    isSqliteEnabled() ? getAllBeaches() : readBeaches()
  ]);
  const baseUrl = 'https://puertoricotraveldeals.com';
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/deals', priority: '1.0', changefreq: 'hourly' },
    { url: '/beachfinder', priority: '1.0', changefreq: 'daily' },
    { url: '/guides', priority: '0.9', changefreq: 'daily' },
    { url: '/join', priority: '0.8', changefreq: 'monthly' },
    { url: '/partner', priority: '0.8', changefreq: 'monthly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/styleguide', priority: '0.3', changefreq: 'yearly' }
  ];

  // Category pages
  const categories = ['hotel', 'restaurant', 'activity', 'tour'];
  const categoryPages = categories.map(category => ({
    url: `/puerto-rico-${category}-deals`,
    priority: '0.9',
    changefreq: 'daily'
  }));

  // Location pages  
  const locations = [
    'san-juan', 'culebra', 'old-san-juan', 'condado', 'isla-verde',
    'ponce', 'rincon', 'fajardo', 'vieques', 'aguadilla'
  ];
  const locationPages = locations.map(location => ({
    url: `/locations/${location}`,
    priority: '0.8', 
    changefreq: 'weekly'
  }));

  // Static guide pages (existing React pages)
  const staticGuidePages = [
    { url: '/guides/best-time-visit-puerto-rico-deals', priority: '0.7', changefreq: 'monthly' },
    { url: '/guides/puerto-rico-travel-deals-vs-booking-direct', priority: '0.7', changefreq: 'monthly' },
    { url: '/guides/authentic-puerto-rico-experiences', priority: '0.7', changefreq: 'monthly' }
  ];

  // Dynamic guide pages (markdown-based)
  const dynamicGuidePages = guides.map(guide => ({
    url: `/guides/${guide.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: guide.publishDate
  }));

  const allStaticPages = [...staticPages, ...categoryPages, ...locationPages, ...staticGuidePages];

  // Filter active deals (non-expired) for sitemap
  const activeDeals = deals.filter(deal => 
    deal.slug && !isExpired(deal.expiresAt || deal.expiry)
  );

  // Filter active beaches with valid slugs for sitemap
  const activeBeaches = beaches.filter(beach => 
    beach.slug && beach.slug.trim() !== ''
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allStaticPages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `).join('')}
  ${dynamicGuidePages.map(guide => `
    <url>
      <loc>${baseUrl}${guide.url}</loc>
      <lastmod>${guide.lastmod}</lastmod>
      <changefreq>${guide.changefreq}</changefreq>
      <priority>${guide.priority}</priority>
    </url>
  `).join('')}
  ${activeDeals.map(deal => `
    <url>
      <loc>${baseUrl}/deal/${deal.slug}</loc>
      <lastmod>${deal.updatedAt || new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>
  `).join('')}
  ${activeBeaches.map(beach => `
    <url>
      <loc>${baseUrl}/beaches/${beach.slug}</loc>
      <lastmod>${beach.updatedAt || new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {}
  };
};