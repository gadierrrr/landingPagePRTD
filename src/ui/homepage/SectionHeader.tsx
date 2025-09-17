import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className = '',
  titleClassName = '',
  subtitleClassName = ''
}) => {
  return (
    <div className={`text-center ${className}`}>
      <h2 className={`text-3xl font-black text-brand-navy sm:text-4xl ${titleClassName}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-brand-navy/70 mt-3 sm:text-lg ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};