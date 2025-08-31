import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { verifyAdminCookie } from '../../../src/lib/admin/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

// MIME type checking with magic bytes for security

function checkMimeType(buffer: Buffer): string | null {
  // Check JPEG
  if (buffer.length >= 3 && 
      buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // Check PNG
  if (buffer.length >= 4 && 
      buffer[0] === 0x89 && buffer[1] === 0x50 && 
      buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  
  // Check WebP (RIFF + WEBP at offset 8)
  if (buffer.length >= 12 && 
      buffer[0] === 0x52 && buffer[1] === 0x49 && 
      buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && 
      buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp';
  }
  
  return null;
}

export function sanitizeFilename(filename: string): string {
  // Remove Unicode control characters and unsafe characters
  const cleaned = filename
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control chars
    .replace(/[^\w\s.-]/g, '') // Keep only word chars, spaces, dots, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  return cleaned || 'image';
}

export function generateContentHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 12);
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

  // Check admin authentication
  const adminCookie = req.cookies.admin;
  if (!verifyAdminCookie(adminCookie || '')) {
    return res.status(401).json({ error: 'Unauthorized' });
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
    // Create upload directory structure for events
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads', 'events', year, month);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      uploadDir: uploadsDir,
      keepExtensions: false, // We'll handle extensions ourselves
      filter: (part) => {
        return part.name === 'file' && !!part.mimetype;
      }
    });

    const [, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No valid file uploaded' });
    }

    // Read file for MIME validation and hash generation
    const fileBuffer = await fs.promises.readFile(uploadedFile.filepath);
    
    // Validate MIME type with magic bytes
    const detectedMime = checkMimeType(fileBuffer);
    if (!detectedMime) {
      // Clean up uploaded file
      try {
        await fs.promises.unlink(uploadedFile.filepath);
      } catch (e) {
        // Ignore cleanup errors
      }
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' });
    }

    // Check file size (server-side enforcement)
    if (fileBuffer.length > 5 * 1024 * 1024) {
      try {
        await fs.promises.unlink(uploadedFile.filepath);
      } catch (e) {
        // Ignore cleanup errors
      }
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    // Generate content-based filename
    const contentHash = generateContentHash(fileBuffer);
    const originalName = uploadedFile.originalFilename || 'image';
    const sanitizedOriginal = sanitizeFilename(originalName);
    const ext = detectedMime === 'image/jpeg' ? '.jpg' : 
                detectedMime === 'image/png' ? '.png' : '.webp';
    
    const finalFilename = `${contentHash}${ext}`;
    const finalPath = path.join(uploadsDir, finalFilename);
    
    // Move file to final location with content-based name
    await fs.promises.rename(uploadedFile.filepath, finalPath);

    // Set proper file permissions (readable by web server)
    await fs.promises.chmod(finalPath, 0o644);

    // Return path and alt suggestion
    const publicPath = `/images/uploads/events/${year}/${month}/${finalFilename}`;
    const altSuggestion = path.basename(sanitizedOriginal, path.extname(sanitizedOriginal))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    res.status(200).json({ 
      url: publicPath,
      altSuggestion
    });
  } catch (error) {
    console.error('Events upload error:', error);
    
    if (error instanceof Error && error.message.includes('maxFileSize')) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    
    res.status(500).json({ error: 'Upload failed' });
  }
}