import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { generateSlug } from './slugGenerator';

const GUIDES_DIRECTORY = join(process.cwd(), 'content', 'guides');

export interface GuideMeta {
  title: string;
  slug: string;
  publishDate: string; // ISO date string
  author: string;
  excerpt: string;
  tags?: string[];
  duration?: string;
  heroImageUrl?: string;
  imageUrls?: string[];
  filePath: string; // internal use
}

export interface Guide {
  meta: GuideMeta;
  html: string;
}

// Memoization cache
let guidesCache: GuideMeta[] | null = null;
const guideContentCache: Map<string, Guide> = new Map();

async function ensureGuidesDirectory(): Promise<void> {
  try {
    await fs.access(GUIDES_DIRECTORY);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Create content/guides directory if it doesn't exist
      await fs.mkdir(GUIDES_DIRECTORY, { recursive: true });
    } else {
      throw error;
    }
  }
}

export async function getAllGuidesMeta(): Promise<GuideMeta[]> {
  // Return cached guides if available
  if (guidesCache) {
    return guidesCache;
  }

  await ensureGuidesDirectory();

  try {
    const fileNames = await fs.readdir(GUIDES_DIRECTORY);
    const markdownFiles = fileNames.filter(name => name.endsWith('.md'));
    
    const guides: GuideMeta[] = [];
    const existingSlugs: string[] = [];

    for (const fileName of markdownFiles) {
      const filePath = join(GUIDES_DIRECTORY, fileName);
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

      const guide: GuideMeta = {
        title: frontmatter.title,
        slug,
        publishDate: frontmatter.publishDate,
        author: frontmatter.author,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags || [],
        duration: frontmatter.duration || null,
        heroImageUrl: frontmatter.heroImageUrl || null,
        imageUrls: frontmatter.imageUrls || null,
        filePath
      };

      guides.push(guide);
    }

    // Sort by publishDate descending (most recent first)
    guides.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    
    // Cache the results
    guidesCache = guides;
    
    return guides;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  // Check cache first
  if (guideContentCache.has(slug)) {
    return guideContentCache.get(slug)!;
  }

  const guides = await getAllGuidesMeta();
  const guide = guides.find(g => g.slug === slug);
  
  if (!guide) {
    return null;
  }

  try {
    const fileContents = await fs.readFile(guide.filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);

    // Process markdown to HTML (no dangerous HTML by default)
    const processedContent = await remark()
      .use(remarkHtml)
      .process(content);

    const html = processedContent.toString();

    const guidePost: Guide = {
      meta: {
        title: frontmatter.title,
        slug: guide.slug,
        publishDate: frontmatter.publishDate,
        author: frontmatter.author,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags || [],
        duration: frontmatter.duration || null,
        heroImageUrl: frontmatter.heroImageUrl || null,
        imageUrls: frontmatter.imageUrls || null,
        filePath: guide.filePath
      },
      html
    };

    // Cache the result
    guideContentCache.set(slug, guidePost);
    
    return guidePost;
  } catch (error) {
    console.error(`Error reading guide ${slug}:`, error);
    return null;
  }
}

// Clear cache when needed (useful for development)
export function clearGuidesCache(): void {
  guidesCache = null;
  guideContentCache.clear();
}