import React from 'react';

export const SiteLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-brand-sand text-brand-navy font-sans">{children}</div>
);
