import React from 'react';

type Level = 1|2|3|4;
interface HeadingProps { level?: Level; className?: string; children: React.ReactNode; }

const sizes: Record<Level,string> = {
  1: 'text-4xl sm:text-5xl font-black leading-tight',
  2: 'text-3xl sm:text-4xl font-black',
  3: 'text-2xl font-bold',
  4: 'text-xl font-semibold'
};

export const Heading: React.FC<HeadingProps> = ({ level=2, className='', children }) => {
  const Tag = `h${level}` as const;
  return <Tag className={`${sizes[level]} ${className}`}>{children}</Tag>;
};
