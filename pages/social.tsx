import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'red' | 'navy';
  onClick: () => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ href, title, description, icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-brand-blue hover:bg-brand-blue/90',
    red: 'bg-brand-red hover:bg-brand-red/90', 
    navy: 'bg-brand-navy hover:bg-brand-navy/90'
  };

  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`block w-full rounded-3xl p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-black">{title}</h3>
          <p className="text-white/90">{description}</p>
        </div>
        <div className="text-xl">→</div>
      </div>
    </Link>
  );
};

export default function SocialPage() {
  const trackSocialClick = (linkName: string, destination: string) => {
    if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
      ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
        event: 'social_link_click',
        link_name: linkName,
        destination: destination,
        page: 'social'
      });
    }
  };

  const links = [
    {
      href: '/beachfinder',
      title: 'Beach Finder',
      description: 'Discover Puerto Rico\'s best beaches',
      icon: '🏖️',
      color: 'blue' as const,
      name: 'beach_finder'
    },
    {
      href: '/guides',
      title: 'Travel Guides',
      description: 'Expert tips for your Puerto Rico adventure',
      icon: '📖',
      color: 'navy' as const,
      name: 'travel_guides'
    },
    {
      href: '/deals',
      title: 'Latest Deals',
      description: 'Exclusive discounts on hotels & activities',
      icon: '💰',
      color: 'red' as const,
      name: 'latest_deals'
    }
  ];

  return (
    <>
      <Head>
        <title>PRTD - Puerto Rico Travel Deals | Social Links</title>
        <meta name="description" content="Your one-stop hub for Puerto Rico travel deals, beach guides, and insider tips. Discover the best of Borinquen!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://puertoricotraveldeals.com/social" />
        <meta property="og:title" content="PRTD - Puerto Rico Travel Deals" />
        <meta property="og:description" content="Your one-stop hub for Puerto Rico travel deals, beach guides, and insider tips." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://puertoricotraveldeals.com/social" />
        <meta property="twitter:title" content="PRTD - Puerto Rico Travel Deals" />
        <meta property="twitter:description" content="Your one-stop hub for Puerto Rico travel deals, beach guides, and insider tips." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-brand-sand to-white">
        <div className="mx-auto max-w-md px-4 py-8">
          {/* Profile Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-brand-blue text-4xl text-white shadow-lg">
              ★
            </div>
            <h1 className="mb-2 text-3xl font-black text-brand-navy">PRTD</h1>
            <p className="text-lg font-bold text-brand-navy">Puerto Rico Travel Deals</p>
            <p className="text-brand-navy/80 mt-3">
              Your one-stop hub for Puerto Rico travel deals, beach guides, and insider tips. 
              Discover the best of Borinquen! 🇵🇷
            </p>
            
            {/* Instagram Link */}
            <div className="mt-6">
              <a 
                href="https://www.instagram.com/puertoricotraveldeals" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackSocialClick('instagram', 'https://www.instagram.com/puertoricotraveldeals')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
              >
                📸 Follow us on Instagram
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            {links.map((link) => (
              <LinkCard
                key={link.href}
                href={link.href}
                title={link.title}
                description={link.description}
                icon={link.icon}
                color={link.color}
                onClick={() => trackSocialClick(link.name, link.href)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-brand-navy/70 text-sm">
              © {new Date().getFullYear()} PRTD. Made with ❤️ for Puerto Rico travelers.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}