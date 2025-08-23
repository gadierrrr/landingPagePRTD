import React, { useState, useEffect } from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { Deal } from '../src/lib/forms';
import { PublicDealsGrid } from '../src/ui/deals/PublicDealsGrid';

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      setError('Failed to load deals');
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <SEO 
        title="Deals"
        description="Discover the best travel deals in Puerto Rico"
      />
      <Section>
        <Heading level={1}>Deals</Heading>
        <p className="text-brand-navy/70 mt-4">Discover the best travel deals in Puerto Rico</p>
        
        <div className="mt-8">
          {loading && (
            <div className="py-12 text-center">
              <div className="text-brand-navy">Loading deals...</div>
            </div>
          )}
          
          {error && (
            <div className="bg-brand-red/10 border-brand-red/20 rounded-lg border px-4 py-3 text-brand-red">
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <PublicDealsGrid deals={deals} />
          )}
        </div>
      </Section>
    </SiteLayout>
  );
}