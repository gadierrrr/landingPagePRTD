import React from 'react';
import Link from 'next/link';

interface CategoryPill {
  emoji: string;
  label: string;
  href: string;
  bgColor?: string;
  textColor?: string;
}

interface CategoryPillsProps {
  categories: CategoryPill[];
  onPillClick?: (category: string, position: number) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, onPillClick }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {categories.map((category, index) => (
        <Link
          key={category.label}
          href={category.href}
          onClick={() => onPillClick?.(category.label, index)}
          className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 ${
            category.bgColor || 'bg-white/90'
          } ${category.textColor || 'text-brand-navy'}`}
          aria-label={`Browse ${category.label} deals`}
        >
          <span className="text-lg">{category.emoji}</span>
          <span className="font-semibold">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  );
};