import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteLayout } from '../layout/SiteLayout';
import { Section } from '../Section';
import { Heading } from '../Heading';
import { SEO } from '../SEO';

interface BlogPostMeta {
  title: string;
  slug: string;
  publishDate: string;
  author: string;
  excerpt: string;
  tags?: string[];
  heroImageUrl?: string;
  imageUrls?: string[];
}

interface BlogPostLayoutProps {
  meta: BlogPostMeta;
  children: React.ReactNode;
  structuredData?: object;
  backLink?: {
    url: string;
    text: string;
  };
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function QuickJump({ headings }: { headings: HeadingItem[] }) {
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <>
      {/* Mobile: Collapsible above content */}
      <div className="mb-6 lg:hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="border-brand-navy/10 hover:bg-brand-sand/20 flex w-full items-center justify-between rounded-lg border bg-white p-3 text-sm font-medium text-brand-navy"
        >
          Quick Jump to Section
          <span className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}>
            ▼
          </span>
        </button>
        
        {!isCollapsed && (
          <div className="border-brand-navy/10 mt-2 rounded-lg border bg-white p-3">
            <nav className="space-y-1">
              {headings.map(({ id, text }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`hover:bg-brand-sand/50 block rounded px-2 py-1 text-sm transition-colors ${
                    activeId === id ? 'bg-brand-sand font-medium text-brand-navy' : 'text-brand-navy/80'
                  }`}
                  onClick={() => setIsCollapsed(true)}
                >
                  {text}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop: Sticky sidebar */}
      <div className="fixed right-4 top-1/3 z-10 hidden w-64 lg:block">
        <div className="border-brand-navy/10 rounded-lg border bg-white/95 p-4 shadow-sm backdrop-blur-sm">
          <h3 className="mb-3 text-sm font-semibold text-brand-navy">Quick Jump</h3>
          <nav className="space-y-1">
            {headings.map(({ id, text }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`hover:bg-brand-sand/50 block rounded px-2 py-1 text-sm transition-colors ${
                  activeId === id ? 'bg-brand-sand font-medium text-brand-navy' : 'text-brand-navy/80'
                }`}
              >
                {text}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-brand-blue/20 bg-brand-blue/5 mb-6 rounded-lg border p-4">
      <div className="text-brand-navy/80 text-sm">
        {children}
      </div>
    </div>
  );
}

export function BlogPostLayout({ meta, children, structuredData, backLink }: BlogPostLayoutProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Extract headings for Quick Jump
    const articleElement = document.querySelector('[data-blog-content]');
    if (articleElement) {
      const headingElements = articleElement.querySelectorAll('h2, h3');
      const headingData: HeadingItem[] = [];

      headingElements.forEach((el, index) => {
        const text = el.textContent?.trim() || '';
        if (text) {
          const id = el.id || `heading-${index}`;
          if (!el.id) el.id = id;
          
          headingData.push({
            id,
            text,
            level: parseInt(el.tagName.substring(1))
          });
        }
      });

      setHeadings(headingData);
    }
  }, []);

  return (
    <SiteLayout>
      <SEO 
        title={`${meta.title} — PRTD Blog`}
        description={meta.excerpt}
        keywords={meta.tags || []}
        canonical={`https://puertoricotraveldeals.com/blog/${meta.slug}`}
        type="website"
      />
      
      {structuredData && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
        />
      )}

      <Section>
        {/* Breadcrumb Navigation */}
        <nav className="text-brand-navy/70 mb-8 text-sm">
          <Link href={backLink?.url || "/blog"} className="transition-colors hover:text-brand-blue">
            ← {backLink?.text || "Back to Blog"}
          </Link>
        </nav>

        <div className="mx-auto max-w-4xl">
          {/* Article Header */}
          <header className="mb-8">
            <div className="text-brand-navy/70 mb-4 flex items-center gap-4 text-sm">
              <time dateTime={meta.publishDate}>
                {formatDate(meta.publishDate)}
              </time>
              <span>•</span>
              <span>By {meta.author}</span>
            </div>
            
            <Heading level={1} className="mb-6">
              {meta.title}
            </Heading>
            
            <p className="text-brand-navy/80 mb-6 text-lg leading-relaxed">
              {meta.excerpt}
            </p>
            
            {meta.tags && meta.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-sand px-3 py-1 text-sm font-medium text-brand-navy"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hero Image */}
            {meta.heroImageUrl && (
              <div className="mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.heroImageUrl}
                  alt={meta.title}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
          </header>

          {/* Info Callout */}
          <InfoCallout>
            <strong>Note:</strong> Event times and details can change. Always check official links the day of your visit.
          </InfoCallout>

          {/* Quick Jump Navigation */}
          <QuickJump headings={headings} />

          {/* Article Content */}
          <article 
            className="prose-post"
            data-blog-content
          >
            {children}
          </article>
        </div>
      </Section>
    </SiteLayout>
  );
}