import React from 'react';
import { Heading } from '../../Heading';
import { EventsManager } from '../../events/EventsManager';

export function EventsSection() {
  return (
    <section className="space-y-6">
      <header className="border-brand-navy/10 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <Heading level={1} className="text-3xl">
            Events
          </Heading>
          <p className="text-brand-navy/70">
            Manage weekly events, schedules, and key details.
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-brand-navy/10 bg-white p-4 shadow-sm">
        <EventsManager />
      </div>
    </section>
  );
}
