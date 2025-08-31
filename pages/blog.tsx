import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { SiteLayout } from '../src/ui/layout/SiteLayout';
import { Section } from '../src/ui/Section';
import { Heading } from '../src/ui/Heading';
import { SEO } from '../src/ui/SEO';
import { PostMeta, getAllPostsMeta } from '../src/lib/blog';

interface BlogPageProps {
  posts: PostMeta[];
}

export default function BlogPage({ posts }: BlogPageProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SiteLayout>
      <SEO 
        title="Blog — PRTD"
        description="Discover insider tips, local experiences, and travel insights for your Puerto Rico adventure. Written by locals who know the island best."
        keywords={['Puerto Rico blog', 'travel tips', 'local insights', 'island experiences', 'Caribbean travel', 'Puerto Rico guide']}
        canonical="https://puertoricotraveldeals.com/blog"
      />
      
      <Section>
        <Heading level={1}>Blog</Heading>
        <p className="text-brand-navy/70 mt-4">
          Insider tips, local experiences, and travel insights for your Puerto Rico adventure
        </p>
        
        {posts.length === 0 ? (
          <div className="bg-brand-sand/50 border-brand-navy/10 mt-8 rounded-lg border px-6 py-8 text-center">
            <p className="text-brand-navy/70">No blog posts available yet. Check back soon for exciting content!</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-brand-navy/10 rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-brand-navy/70 mb-3 flex items-center gap-4 text-sm">
                      <time dateTime={post.publishDate}>
                        {formatDate(post.publishDate)}
                      </time>
                      <span>•</span>
                      <span>By {post.author}</span>
                    </div>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <Heading 
                        level={2} 
                        className="mb-3 text-xl transition-colors group-hover:text-brand-blue"
                      >
                        {post.title}
                      </Heading>
                    </Link>
                    
                    <p className="text-brand-navy/80 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-brand-sand px-3 py-1 text-sm font-medium text-brand-navy"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-navy"
                    >
                      Read more
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  try {
    const posts = await getAllPostsMeta();
    
    return {
      props: {
        posts
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    
    return {
      props: {
        posts: []
      },
      revalidate: 60 // Retry more frequently on error
    };
  }
};