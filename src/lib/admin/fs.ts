import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { generateSlug } from '../slugGenerator';

const BLOG_DIRECTORY = join(process.cwd(), 'content', 'blog');
const IMAGES_DIRECTORY = join(process.cwd(), 'public', 'images', 'uploads');

export interface PostData {
  title: string;
  slug?: string;
  publishDate: string;
  author: string;
  excerpt: string;
  tags?: string[];
  heroImageUrl?: string;
  imageUrls?: string[];
  body: string;
}

export function generatePostFilename(publishDate: string, slug: string): string {
  const date = new Date(publishDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${slug}.md`;
}

export async function writePostFile(postData: PostData, existingFilename?: string): Promise<string> {
  // Ensure blog directory exists
  await fs.mkdir(BLOG_DIRECTORY, { recursive: true });

  // Generate or use existing slug
  let finalSlug = postData.slug;
  if (!finalSlug) {
    const existingFiles = await fs.readdir(BLOG_DIRECTORY).catch(() => []);
    const existingSlugs = existingFiles
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', '').split('-').slice(3).join('-'));
    finalSlug = generateSlug(postData.title, existingSlugs);
  }

  // Generate filename
  const filename = existingFilename || generatePostFilename(postData.publishDate, finalSlug);
  const filePath = join(BLOG_DIRECTORY, filename);

  // Validate path is within blog directory
  if (!filePath.startsWith(BLOG_DIRECTORY) || !filename.endsWith('.md')) {
    throw new Error('Invalid file path');
  }

  // Prepare frontmatter
  const frontmatter: Record<string, unknown> = {
    title: postData.title,
    slug: finalSlug,
    publishDate: postData.publishDate,
    author: postData.author,
    excerpt: postData.excerpt,
  };

  if (postData.tags && postData.tags.length > 0) {
    frontmatter.tags = postData.tags;
  }

  if (postData.heroImageUrl) {
    frontmatter.heroImageUrl = postData.heroImageUrl;
  }

  if (postData.imageUrls && postData.imageUrls.length > 0) {
    frontmatter.imageUrls = postData.imageUrls;
  }

  // Serialize to markdown
  const fileContent = matter.stringify(postData.body, frontmatter);
  
  // Write file
  await fs.writeFile(filePath, fileContent, 'utf8');
  
  return filename;
}

export async function listImagesInFolder(year: string, month: string): Promise<string[]> {
  const folderPath = join(IMAGES_DIRECTORY, year, month);
  
  try {
    const files = await fs.readdir(folderPath);
    return files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
  } catch (error) {
    return [];
  }
}