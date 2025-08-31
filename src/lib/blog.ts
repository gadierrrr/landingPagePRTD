import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { generateSlug } from './slugGenerator';

const BLOG_POSTS_DIRECTORY = join(process.cwd(), 'content', 'blog');

export interface PostMeta {
  title: string;
  slug: string;
  publishDate: string; // ISO date string
  author: string;
  excerpt: string;
  tags?: string[];
  filePath: string; // internal use
}

export interface BlogPost {
  meta: PostMeta;
  html: string;
}

// Memoization cache
let postsCache: PostMeta[] | null = null;
const postContentCache: Map<string, BlogPost> = new Map();

async function ensureBlogDirectory(): Promise<void> {
  try {
    await fs.access(BLOG_POSTS_DIRECTORY);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Create content/blog directory if it doesn't exist
      await fs.mkdir(BLOG_POSTS_DIRECTORY, { recursive: true });
    } else {
      throw error;
    }
  }
}

export async function getAllPostsMeta(): Promise<PostMeta[]> {
  // Return cached posts if available
  if (postsCache) {
    return postsCache;
  }

  await ensureBlogDirectory();

  try {
    const fileNames = await fs.readdir(BLOG_POSTS_DIRECTORY);
    const markdownFiles = fileNames.filter(name => name.endsWith('.md'));
    
    const posts: PostMeta[] = [];
    const existingSlugs: string[] = [];

    for (const fileName of markdownFiles) {
      const filePath = join(BLOG_POSTS_DIRECTORY, fileName);
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data: frontmatter } = matter(fileContents);

      // Validate required frontmatter fields
      if (!frontmatter.title || !frontmatter.publishDate || !frontmatter.author || !frontmatter.excerpt) {
        console.warn(`Skipping ${fileName}: missing required frontmatter fields (title, publishDate, author, excerpt)`);
        continue;
      }

      // Derive slug from frontmatter or filename
      let slug = frontmatter.slug;
      if (!slug) {
        const baseSlug = fileName.replace('.md', '');
        slug = generateSlug(baseSlug, existingSlugs);
      }
      existingSlugs.push(slug);

      // Validate publishDate format
      const publishDate = new Date(frontmatter.publishDate);
      if (isNaN(publishDate.getTime())) {
        console.warn(`Skipping ${fileName}: invalid publishDate format`);
        continue;
      }

      const post: PostMeta = {
        title: frontmatter.title,
        slug,
        publishDate: frontmatter.publishDate,
        author: frontmatter.author,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags || [],
        filePath
      };

      posts.push(post);
    }

    // Sort by publishDate descending (most recent first)
    posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    
    // Cache the results
    postsCache = posts;
    
    return posts;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Check cache first
  if (postContentCache.has(slug)) {
    return postContentCache.get(slug)!;
  }

  const posts = await getAllPostsMeta();
  const post = posts.find(p => p.slug === slug);
  
  if (!post) {
    return null;
  }

  try {
    const fileContents = await fs.readFile(post.filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);

    // Process markdown to HTML (no dangerous HTML by default)
    const processedContent = await remark()
      .use(remarkHtml)
      .process(content);

    const html = processedContent.toString();

    const blogPost: BlogPost = {
      meta: {
        title: frontmatter.title,
        slug: post.slug,
        publishDate: frontmatter.publishDate,
        author: frontmatter.author,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags || [],
        filePath: post.filePath
      },
      html
    };

    // Cache the result
    postContentCache.set(slug, blogPost);
    
    return blogPost;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// Clear cache when needed (useful for development)
export function clearBlogCache(): void {
  postsCache = null;
  postContentCache.clear();
}