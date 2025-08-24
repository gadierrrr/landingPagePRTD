import { GetServerSideProps } from 'next';
import { readDeals } from '../src/lib/dealsStore';

export default function Sitemap() {
  // This component doesn't render anything - it's just for sitemap generation
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const deals = await readDeals();
  const baseUrl = 'https://puertoricotraveldeals.com';
  
  const staticPages = [
    '',
    '/landing',
    '/deals',
    '/join',
    '/partner',
    '/styleguide'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${page === '' || page === '/deals' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
  ${deals.filter(deal => deal.slug).map(deal => `
    <url>
      <loc>${baseUrl}/deal/${deal.slug}</loc>
      <lastmod>${deal.updatedAt || new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
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