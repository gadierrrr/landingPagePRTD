import React from 'react';
import { Heading } from '../../Heading';
import { DealsManager } from '../../deals/DealsManager';

export function DealsSection() {
  return (
    <section className="space-y-6">
      <header className="border-brand-navy/10 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <Heading level={1} className="text-3xl">
            Deals
          </Heading>
          <p className="text-brand-navy/70">
            Add or edit deals to highlight promotions and packages.
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-brand-navy/10 bg-white p-4 shadow-sm">
        <DealsManager />
      </div>
    </section>
  );
}
