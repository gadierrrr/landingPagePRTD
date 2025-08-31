import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';
import { writePostFile, PostData, listImagesInFolder } from '../../../src/lib/admin/fs';
import { getAllPostsMeta, getPostBySlug, clearBlogCache } from '../../../src/lib/blog';
import { promises as fs } from 'fs';
import matter from 'gray-matter';

function getAuthCookie(req: NextApiRequest): string | undefined {
  const cookies = req.headers.cookie;
  if (!cookies) return undefined;
  
  const match = cookies.match(/admin_auth=([^;]+)/);
  return match ? match[1] : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authentication
  const cookieValue = getAuthCookie(req);
  if (!cookieValue || !verifyAdminCookie(cookieValue)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { slug, images, year, month } = req.query;
        
        if (images === 'true' && year && month) {
          const imageFiles = await listImagesInFolder(year as string, month as string);
          return res.status(200).json({ images: imageFiles });
        }
        
        if (slug) {
          const post = await getPostBySlug(slug as string);
          if (!post) {
            return res.status(404).json({ error: 'Post not found' });
          }
          
          // Read raw file to get original frontmatter
          const filePath = post.meta.filePath;
          const fileContents = await fs.readFile(filePath, 'utf8');
          const { data: frontmatter, content } = matter(fileContents);
          
          return res.status(200).json({
            meta: post.meta,
            frontmatter,
            body: content
          });
        }
        
        const posts = await getAllPostsMeta();
        return res.status(200).json({ posts });

      case 'POST':
        const postData: PostData = req.body;
        
        // Validate required fields
        if (!postData.title || !postData.publishDate || !postData.author || !postData.excerpt) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate image URLs if provided
        if (postData.heroImageUrl && !postData.heroImageUrl.startsWith('/images/uploads/')) {
          return res.status(400).json({ error: 'Hero image URL must start with /images/uploads/' });
        }

        if (postData.imageUrls) {
          for (const url of postData.imageUrls) {
            if (!url.startsWith('/images/uploads/')) {
              return res.status(400).json({ error: 'All image URLs must start with /images/uploads/' });
            }
          }
        }

        const filename = await writePostFile(postData);
        clearBlogCache();
        
        return res.status(201).json({ filename, success: true });

      case 'PUT':
        const { originalSlug } = req.query;
        const updateData: PostData = req.body;
        
        if (!originalSlug) {
          return res.status(400).json({ error: 'Original slug required for updates' });
        }

        // Validate required fields
        if (!updateData.title || !updateData.publishDate || !updateData.author || !updateData.excerpt) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find existing post to get filename
        const existingPost = await getPostBySlug(originalSlug as string);
        if (!existingPost) {
          return res.status(404).json({ error: 'Post not found' });
        }

        const existingFilename = existingPost.meta.filePath.split('/').pop();
        const updatedFilename = await writePostFile(updateData, existingFilename);
        clearBlogCache();
        
        return res.status(200).json({ filename: updatedFilename, success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}