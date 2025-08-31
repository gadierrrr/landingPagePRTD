import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { BlogPostLayout } from '../../src/ui/blog/BlogPostLayout';
import { Heading } from '../../src/ui/Heading';
import { PostMeta, BlogPost, getAllPostsMeta, getPostBySlug } from '../../src/lib/blog';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: PostMeta[];
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const { meta, html } = post;
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate structured data for Article
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": meta.title,
    "description": meta.excerpt,
    "author": {
      "@type": "Person",
      "name": meta.author
    },
    "datePublished": meta.publishDate,
    "dateModified": meta.publishDate,
    "publisher": {
      "@type": "Organization",
      "name": "Puerto Rico Travel Deals",
      "logo": {
        "@type": "ImageObject",
        "url": "https://puertoricotraveldeals.com/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://puertoricotraveldeals.com/blog/${meta.slug}`
    },
    "url": `https://puertoricotraveldeals.com/blog/${meta.slug}`,
    "keywords": meta.tags?.join(', ') || ''
  };

  return (
    <>
      <Head>
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData, null, 2) }}
        />
      </Head>

      <BlogPostLayout meta={meta} structuredData={articleStructuredData}>
        {/* Article Content */}
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-brand-navy/10 mt-16 border-t pt-8">
            <Heading level={2} className="mb-6 text-xl">
              More Posts
            </Heading>
            
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.slice(0, 2).map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="border-brand-navy/10 group block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="text-brand-navy/70 mb-2 text-sm">
                    {formatDate(relatedPost.publishDate)}
                  </div>
                  
                  <Heading 
                    level={3} 
                    className="mb-2 text-lg transition-colors group-hover:text-brand-blue"
                  >
                    {relatedPost.title}
                  </Heading>
                  
                  <p className="text-brand-navy/80 text-sm leading-relaxed">
                    {relatedPost.excerpt}
                  </p>
                  
                  {relatedPost.tags && relatedPost.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {relatedPost.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-brand-sand/50 rounded px-2 py-1 text-xs text-brand-navy"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </BlogPostLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const posts = await getAllPostsMeta();
    const paths = posts.map((post) => ({
      params: { slug: post.slug }
    }));

    return {
      paths,
      fallback: false // 404 for non-existent posts
    };
  } catch (error) {
    console.error('Error generating static paths for blog posts:', error);
    return {
      paths: [],
      fallback: false
    };
  }
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  
  if (!slug) {
    return {
      notFound: true
    };
  }

  try {
    const [post, allPosts] = await Promise.all([
      getPostBySlug(slug),
      getAllPostsMeta()
    ]);

    if (!post) {
      return {
        notFound: true
      };
    }

    // Get related posts (excluding current post)
    const relatedPosts = allPosts
      .filter(p => p.slug !== slug)
      .slice(0, 2);

    return {
      props: {
        post,
        relatedPosts
      },
      revalidate: 3600 // Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return {
      notFound: true
    };
  }
};