import React from 'react';
import { LandingHeader } from '../landing/LandingHeader';
import { Footer } from '../Footer';

export const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-brand-sand font-sans text-brand-navy">
    <LandingHeader />
    {children}
    <Footer />
  </div>
);
