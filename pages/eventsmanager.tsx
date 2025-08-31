import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { EventsManager } from '../src/ui/events/EventsManager';

export default function EventsManagerPage() {
  return (
    <SiteLayout>
      <SEO 
        title="Manage Events"
        description="Add, edit, and delete weekly events."
      />
      <Section>
        <Heading level={1}>Manage Events</Heading>
        <div className="mt-6">
          <EventsManager />
        </div>
      </Section>
    </SiteLayout>
  );
}