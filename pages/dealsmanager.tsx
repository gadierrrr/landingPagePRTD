import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { DealsManager } from '../src/ui/deals/DealsManager';

export default function Deals() {
  return (
    <SiteLayout>
      <SEO 
        title="Manage Deals"
        description="Add, edit, and delete simple deal cards."
      />
      <Section>
        <Heading level={1}>Manage Deals</Heading>
        <div className="mt-6">
          <DealsManager />
        </div>
      </Section>
    </SiteLayout>
  );
}
