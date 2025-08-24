import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Security and validation helpers
export function isAllowedMimeType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return allowedTypes.includes(mimeType);
}

export function sanitizeFilename(filename: string): string {
  // Extract extension and base name
  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, ext);
  
  // Remove unsafe characters, keep only alphanumeric, hyphens, underscores
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '');
  
  // Fallback to "img" if name becomes empty
  const finalName = safeName || 'img';
  const finalExt = ext || '.jpg'; // Fallback extension
  
  return finalName + finalExt;
}

export function generateUniqueFilename(originalName: string): string {
  const safeName = sanitizeFilename(originalName);
  const timestamp = Date.now();
  const ext = path.extname(safeName);
  const baseName = path.basename(safeName, ext);
  
  return `${baseName}-${timestamp}${ext}`;
}

export function isValidOrigin(origin: string | undefined, referer: string | undefined): boolean {
  const allowedOrigins = [
    'https://puertoricotraveldeals.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return true;
  }
  
  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return true;
  }
  
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check CSRF-style header
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Invalid request headers' });
  }

  // Check same-origin
  if (!isValidOrigin(req.headers.origin, req.headers.referer)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  try {
    // Create upload directory structure
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads', year, month);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      uploadDir: uploadsDir,
      keepExtensions: true,
      filter: (part) => {
        return part.name === 'file' && part.mimetype ? isAllowedMimeType(part.mimetype) : false;
      }
    });

    const [, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No valid file uploaded' });
    }

    // Validate file type again (server-side safety)
    if (!uploadedFile.mimetype || !isAllowedMimeType(uploadedFile.mimetype)) {
      // Clean up uploaded file
      try {
        await fs.promises.unlink(uploadedFile.filepath);
      } catch (e) {
        // Ignore cleanup errors
      }
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' });
    }

    // Generate safe filename and move file
    const originalName = uploadedFile.originalFilename || 'upload';
    const safeFilename = generateUniqueFilename(originalName);
    const finalPath = path.join(uploadsDir, safeFilename);
    
    // Move file to final location with safe name
    await fs.promises.rename(uploadedFile.filepath, finalPath);

    // Set proper file permissions (readable by web server)
    await fs.promises.chmod(finalPath, 0o644);

    // Return public path
    const publicPath = `/images/uploads/${year}/${month}/${safeFilename}`;
    
    res.status(200).json({ ok: true, path: publicPath });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof Error && error.message.includes('maxFileSize')) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    
    res.status(500).json({ error: 'Upload failed' });
  }
}