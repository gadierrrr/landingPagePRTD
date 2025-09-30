import { GetServerSideProps } from 'next';
import { getAllGuidesMeta } from '../src/lib/guides';

// This component doesn't render anything - it only generates XML
const Feed = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://puertoricotraveldeals.com';

  try {
    // Fetch all guides
    const guides = await getAllGuidesMeta();

    // Sort guides by publish date (newest first)
    const sortedGuides = guides.sort((a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    // Take the most recent 50 guides
    const recentGuides = sortedGuides.slice(0, 50);

    // Generate RSS feed XML
    const rssItems = recentGuides.map((guide) => {
      const pubDate = new Date(guide.publishDate).toUTCString();
      const guideUrl = `${baseUrl}/guides/${guide.slug}`;

      return `
    <item>
      <title><![CDATA[${guide.title}]]></title>
      <link>${guideUrl}</link>
      <guid>${guideUrl}</guid>
      <description><![CDATA[${guide.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@puertoricotraveldeals.com (${guide.author})</author>
      ${guide.tags ? guide.tags.map(tag => `<category>${tag}</category>`).join('\n      ') : ''}
    </item>`;
    }).join('\n');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Puerto Rico Travel Deals - Guides</title>
    <link>${baseUrl}</link>
    <description>Island-wide discounts on hotels, dining, and experiences—curated by locals. Travel guides and tips for exploring Puerto Rico.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/favicon.png</url>
      <title>Puerto Rico Travel Deals</title>
      <link>${baseUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

    // Set response headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

    // Write the RSS feed
    res.write(rssFeed);
    res.end();
  } catch (error) {
    console.error('Error generating RSS feed:', error);

    // Return empty RSS feed on error
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Puerto Rico Travel Deals</title>
    <link>${baseUrl}</link>
    <description>Island-wide discounts on hotels, dining, and experiences—curated by locals</description>
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.write(emptyFeed);
    res.end();
  }

  return {
    props: {}
  };
};

export default Feed;