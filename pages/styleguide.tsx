import React from 'react';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { Button } from '../src/ui/Button';

const colorSwatches = [
  ['brand-blue','Brand Blue','bg-brand-blue'],
  ['brand-red','Brand Red','bg-brand-red'],
  ['brand-navy','Brand Navy','bg-brand-navy'],
  ['brand-sand','Brand Sand','bg-brand-sand'],
];

export default function Styleguide() {
  return (
    <SiteLayout>
      <Section id="tokens">
        <Heading level={1}>Design Tokens</Heading>
        <Heading level={3} className="mt-8">Colors</Heading>
        <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-4">
          {colorSwatches.map(([key,label,cls]) => (
            <div key={key} className="space-y-2 text-sm">
              <div className={`h-16 rounded-lg ring-1 ring-black/10 ${cls}`} />
              <div className="font-mono">{label}</div>
              <div className="text-xs text-black/60">{cls}</div>
            </div>
          ))}
        </div>
        {/* Spacing Scale */}
        <Heading level={3} className="mt-12">Spacing</Heading>
        <div className="mt-4 grid gap-3">
          {[1,2,3,4,6,8,12,16].map(n => (
            <div key={n} className="flex items-center gap-4 text-sm">
              <div className="w-32 font-mono">--space-{n}</div>
              <div className="bg-brand-blue/10 relative h-4 flex-1 rounded">
                <div style={{ width: `var(--space-${n})` }} className="h-4 rounded bg-brand-blue" />
              </div>
              <div className="w-16 text-right font-mono">var(--space-{n})</div>
            </div>
          ))}
        </div>
        {/* Radii */}
        <Heading level={3} className="mt-12">Radii</Heading>
        <div className="mt-4 flex flex-wrap gap-6">
          {['sm','md','lg','xl','full'].map(r => (
            <div key={r} className="space-y-2 text-center text-xs">
              <div style={{ borderRadius: `var(--radius-${r})` }} className="bg-brand-blue/15 ring-brand-blue/30 mx-auto h-16 w-20 ring-1" />
              <div className="font-mono">--radius-{r}</div>
            </div>
          ))}
        </div>
        {/* Shadows */}
        <Heading level={3} className="mt-12">Shadows</Heading>
        <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-3">
          {['sm','md','focus'].map(s => (
            <div key={s} className="space-y-2 text-sm">
              <div style={{ boxShadow: `var(--shadow-${s})` }} className="grid h-16 place-items-center rounded-lg bg-white ring-1 ring-black/5">box</div>
              <div className="font-mono">--shadow-{s}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section id="buttons" tone="default">
        <Heading level={2}>Buttons</Heading>
        <div className="mt-4 flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Section>
    </SiteLayout>
  );
}
