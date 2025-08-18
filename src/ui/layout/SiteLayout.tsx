import React from 'react';

export const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-brand-sand font-sans text-brand-navy">{children}</div>
);
