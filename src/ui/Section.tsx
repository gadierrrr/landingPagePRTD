import React from 'react';

interface SectionProps {
  id?: string;
  tone?: 'default' | 'brand' | 'inverse';
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}

const toneClasses: Record<string,string> = {
  default: 'bg-white text-brand-navy',
  brand: 'bg-brand-blue text-white',
  inverse: 'bg-brand-navy text-white'
};

export const Section: React.FC<SectionProps> = ({ id, tone='default', padded=true, className='', children }) => (
  <section id={id} className={`${toneClasses[tone]} ${padded ? 'py-12' : ''} px-4 sm:px-6 ${className}`}>
    <div className="mx-auto max-w-content">{children}</div>
  </section>
);
